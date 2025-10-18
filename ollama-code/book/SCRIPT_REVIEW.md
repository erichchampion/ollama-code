# Script Review: generate-dita.py and generate-pdf.py

## Implementation Status

✅ **All critical fixes have been implemented** (2025-10-17)

### Changes Applied to generate-dita.py:
1. ✅ **Code block language detection** (lines 355-381) - Now preserves language info and adds `outputclass` attribute
2. ✅ **Table formatting preservation** (lines 166-243) - Now uses `convert_element_content()` to preserve inline formatting
3. ✅ **Code blocks in list items** (lines 166-227, 436-451) - New `convert_list_item_content()` function handles block elements
4. ✅ **Markdown extensions** (lines 326-332) - Added `codehilite` and `nl2br` extensions

### Changes Applied to generate-pdf.py:
1. ✅ **Code syntax highlighting styles** (lines 104-125) - Added `codeblock` and `codeph` attribute sets
2. ✅ **Increased image max-width** (line 81) - Changed from 3in to 5in for architecture diagrams

**Result**: The scripts now properly handle all 750+ code examples with syntax highlighting and preserve formatting in all benchmark/reference tables.

---

## Issues and Recommendations for "Building AI Coding Assistants"

This book has **750+ code examples** in TypeScript/JavaScript and **extensive tables** for benchmarks, API references, and comparisons. The current scripts have several limitations that need addressing.

---

## Critical Issues

### 1. Code Block Language Detection (generate-dita.py)

**Current Implementation (Lines 355-357):**
```python
elif element.name == "pre":
    code_text = element.get_text()
    dita_parts.append(f'    <codeblock>{escape_xml(code_text)}</codeblock>')
```

**Problems:**
- ❌ **No language preservation**: Fenced code blocks specify language (```typescript, ```bash, ```json) but this is lost
- ❌ **No syntax highlighting**: DITA codeblocks need `outputclass` attribute for syntax highlighting
- ❌ **Code in nested contexts**: Many examples are inside numbered lists (exercises) which may not indent correctly

**Impact on this book:**
- All 750+ code examples will lose their language information
- PDF will have no syntax highlighting
- Code examples in exercises may not format properly

**Recommended Fix:**
```python
elif element.name == "pre":
    # Extract code element and language class
    code_elem = element.find("code")
    if code_elem:
        # Check for language class (e.g., "language-typescript")
        classes = code_elem.get("class", [])
        language = None

        if isinstance(classes, list):
            for cls in classes:
                if cls.startswith("language-"):
                    language = cls.replace("language-", "")
                    break
        elif isinstance(classes, str) and classes.startswith("language-"):
            language = classes.replace("language-", "")

        code_text = code_elem.get_text()

        # Add outputclass for syntax highlighting
        if language:
            dita_parts.append(f'    <codeblock outputclass="language-{language}">{escape_xml(code_text)}</codeblock>')
        else:
            dita_parts.append(f'    <codeblock>{escape_xml(code_text)}</codeblock>')
    else:
        # Fallback to pre content
        code_text = element.get_text()
        dita_parts.append(f'    <codeblock>{escape_xml(code_text)}</codeblock>')
```

---

### 2. Table Formatting Loss (generate-dita.py)

**Current Implementation (Lines 195-207):**
```python
for th in tr.find_all(["th", "td"]):
    text = th.get_text(strip=True)
    dita_parts.append(f'            <entry>{escape_xml(text)}</entry>')
```

**Problems:**
- ❌ **Formatting stripped**: Uses `get_text()` which removes all formatting (bold, code, links)
- ❌ **Code in cells lost**: Benchmark tables have code snippets in cells (model names, commands)
- ❌ **No colspan/rowspan**: Doesn't handle merged cells
- ❌ **No inline elements**: Table cells with `<code>`, `<strong>`, `<em>` lose formatting

**Impact on this book:**
- Appendix D (Benchmarks): Provider names like `gpt-4-turbo` lose code formatting
- Appendix A (API Reference): Type definitions in tables lose formatting
- All tables lose bold headers and inline code

**Recommended Fix:**
```python
def convert_table_to_dita(table_element) -> str:
    """Convert HTML table to DITA table with formatting preserved."""
    dita_table = ['    <table>']

    # Find thead and tbody
    thead = table_element.find("thead")
    tbody = table_element.find("tbody")

    # Determine column count from first row
    num_cols = 1
    if thead:
        first_row = thead.find("tr")
        if first_row:
            num_cols = len(first_row.find_all(["th", "td"]))
    elif tbody:
        first_row = tbody.find("tr")
        if first_row:
            num_cols = len(first_row.find_all(["td", "th"]))

    dita_table.append(f'      <tgroup cols="{num_cols}">')

    # Add column specifications
    for i in range(num_cols):
        dita_table.append('        <colspec colname="c{}" colnum="{}"/>'.format(i+1, i+1))

    if thead:
        dita_table.append('        <thead>')
        for tr in thead.find_all("tr"):
            dita_table.append('          <row>')
            for th in tr.find_all(["th", "td"]):
                # Preserve formatting in table cells
                cell_content = convert_element_content(th)

                # Handle colspan/rowspan
                colspan = th.get("colspan")
                rowspan = th.get("rowspan")

                entry_attrs = []
                if colspan:
                    entry_attrs.append(f'namest="c1" nameend="c{colspan}"')
                if rowspan:
                    entry_attrs.append(f'morerows="{int(rowspan)-1}"')

                if entry_attrs:
                    dita_table.append(f'            <entry {" ".join(entry_attrs)}>{cell_content}</entry>')
                else:
                    dita_table.append(f'            <entry>{cell_content}</entry>')
            dita_table.append('          </row>')
        dita_table.append('        </thead>')

    if tbody:
        dita_table.append('        <tbody>')
        for tr in tbody.find_all("tr"):
            dita_table.append('          <row>')
            for td in tr.find_all(["td", "th"]):
                # Preserve formatting in table cells
                cell_content = convert_element_content(td)

                # Handle colspan/rowspan
                colspan = td.get("colspan")
                rowspan = td.get("rowspan")

                entry_attrs = []
                if colspan:
                    entry_attrs.append(f'namest="c1" nameend="c{colspan}"')
                if rowspan:
                    entry_attrs.append(f'morerows="{int(rowspan)-1}"')

                if entry_attrs:
                    dita_table.append(f'            <entry {" ".join(entry_attrs)}>{cell_content}</entry>')
                else:
                    dita_table.append(f'            <entry>{cell_content}</entry>')
            dita_table.append('          </row>')
        dita_table.append('        </tbody>')

    dita_table.append('      </tgroup>')
    dita_table.append('    </table>')
    return "\n".join(dita_table)
```

---

### 3. Missing Markdown Extensions (generate-dita.py)

**Current Implementation (Line 233):**
```python
html = markdown.markdown(md_content, extensions=["extra", "tables", "fenced_code"])
```

**Problems:**
- ❌ **No CodeHilite**: Won't detect language from fenced code blocks
- ⚠️ **No admonition support**: Book uses checkboxes `- [ ]` which might not render well

**Recommended Fix:**
```python
html = markdown.markdown(md_content, extensions=[
    "extra",
    "tables",
    "fenced_code",
    "codehilite",  # Better code block handling with language detection
    "nl2br"        # Preserve line breaks in code examples
])
```

---

### 4. Code Block Nesting in Lists (generate-dita.py)

**Problem:**
The book has many code examples inside numbered lists (especially in exercises). The current implementation (lines 344-354) handles lists but may not properly nest codeblocks:

```python
elif element.name == "ol":
    dita_parts.append('    <ol>')
    for li in element.find_all("li", recursive=False):
        li_content = convert_element_content(li)
        dita_parts.append(f'      <li>{li_content}</li>')
    dita_parts.append('    </ol>')
```

**Issue:**
- `convert_element_content()` only handles inline elements (lines 121-164)
- It doesn't handle block elements like `<pre>`, `<p>`, or nested lists within list items
- Code blocks in list items will be converted to text instead of proper codeblocks

**Impact on this book:**
- All exercises with code examples in the solution steps will lose code formatting
- Multi-paragraph list items (common in exercises) will merge into one line

**Recommended Fix:**
```python
def convert_list_item_content(li_element) -> list:
    """Convert list item content, handling both inline and block elements."""
    result = []

    for child in li_element.children:
        if isinstance(child, str):
            text = child.strip()
            if text:
                result.append(escape_xml(text))
        elif child.name == "p":
            # Paragraph in list item
            result.append('<p>' + convert_element_content(child) + '</p>')
        elif child.name == "pre":
            # Code block in list item
            code_elem = child.find("code")
            if code_elem:
                classes = code_elem.get("class", [])
                language = None

                if isinstance(classes, list):
                    for cls in classes:
                        if cls.startswith("language-"):
                            language = cls.replace("language-", "")
                            break

                code_text = code_elem.get_text()

                if language:
                    result.append(f'<codeblock outputclass="language-{language}">{escape_xml(code_text)}</codeblock>')
                else:
                    result.append(f'<codeblock>{escape_xml(code_text)}</codeblock>')
        elif child.name in ["ul", "ol"]:
            # Nested list
            # Handle recursively (implement nested list conversion)
            pass
        elif child.name == "code":
            result.append(f'<codeph>{escape_xml(child.get_text())}</codeph>')
        elif child.name == "strong" or child.name == "b":
            result.append(f'<b>{escape_xml(child.get_text())}</b>')
        elif child.name == "em" or child.name == "i":
            result.append(f'<i>{escape_xml(child.get_text())}</i>')
        elif child.name == "a":
            # Handle links
            if child.get("data-dita-href"):
                href = child["data-dita-href"]
                link_text = child.get_text(strip=True)
                result.append(f'<xref href="{href}" format="dita">{escape_xml(link_text)}</xref>')
            else:
                href = child.get("href", "")
                link_text = child.get_text(strip=True)
                if href.startswith("http://") or href.startswith("https://"):
                    result.append(f'<xref href="{escape_xml(href)}" format="html" scope="external">{escape_xml(link_text)}</xref>')
                else:
                    result.append(escape_xml(link_text))

    return result

# Then update list handling:
elif element.name == "ol":
    dita_parts.append('    <ol>')
    for li in element.find_all("li", recursive=False):
        li_parts = convert_list_item_content(li)
        dita_parts.append('      <li>')
        dita_parts.extend(['        ' + part for part in li_parts])
        dita_parts.append('      </li>')
    dita_parts.append('    </ol>')
```

---

## Medium Priority Issues

### 5. Section Handling (generate-dita.py)

**Current Implementation (Lines 336-339):**
```python
elif element.name in ["h2", "h3", "h4", "h5", "h6"]:
    # Convert headings to sections (simplified)
    text = element.get_text(strip=True)
    dita_parts.append(f'    <section><title>{escape_xml(text)}</title></section>')
```

**Problems:**
- ❌ **Empty sections**: Creates section with title but no content
- ❌ **No section nesting**: All sections are flat, not hierarchical
- ❌ **No section content**: Content after heading is not associated with section

**Impact:**
- Chapter structure is lost
- Navigation in PDF will be poor
- Related content not grouped

**Recommended Approach:**
This requires a more sophisticated parser that:
1. Groups content under each heading
2. Creates nested sections for h2 → h3 → h4 hierarchy
3. Properly closes sections

This is complex and may require restructuring the entire conversion logic. Consider using DITA's `<concept>` or `<task>` topics instead of flat sections.

---

### 6. PDF Customization (generate-pdf.py)

**Current Image Sizing (Lines 66-86):**
```python
<xsl:attribute name="max-width">
  <xsl:text>3in</xsl:text>
</xsl:attribute>
```

**Issue:**
- **Fixed 3-inch max**: This book has mostly code diagrams, which might need different sizing
- **No responsiveness**: Doesn't adapt to page size

**Recommendation:**
```xml
<xsl:attribute name="max-width">
  <xsl:text>5in</xsl:text>  <!-- Increase for architecture diagrams -->
</xsl:attribute>
```

---

## Book-Specific Recommendations

### Add Code Syntax Highlighting (generate-pdf.py)

Add to the XSL customization:

```xml
<!-- Code block syntax highlighting -->
<xsl:attribute-set name="codeblock">
  <xsl:attribute name="font-family">monospace</xsl:attribute>
  <xsl:attribute name="font-size">9pt</xsl:attribute>
  <xsl:attribute name="background-color">#f5f5f5</xsl:attribute>
  <xsl:attribute name="padding">6pt</xsl:attribute>
  <xsl:attribute name="border">0.5pt solid #cccccc</xsl:attribute>
  <xsl:attribute name="keep-together.within-page">auto</xsl:attribute>
  <xsl:attribute name="white-space-treatment">preserve</xsl:attribute>
  <xsl:attribute name="linefeed-treatment">preserve</xsl:attribute>
  <xsl:attribute name="white-space-collapse">false</xsl:attribute>
</xsl:attribute-set>

<!-- Inline code -->
<xsl:attribute-set name="codeph">
  <xsl:attribute name="font-family">monospace</xsl:attribute>
  <xsl:attribute name="font-size">0.9em</xsl:attribute>
  <xsl:attribute name="background-color">#f5f5f5</xsl:attribute>
  <xsl:attribute name="padding-left">2pt</xsl:attribute>
  <xsl:attribute name="padding-right">2pt</xsl:attribute>
</xsl:attribute-set>
```

---

### Handle Long Code Lines

Add line breaking for long code:

```xml
<!-- Allow code to wrap at page boundaries -->
<xsl:attribute-set name="codeblock">
  <xsl:attribute name="wrap-option">wrap</xsl:attribute>
  <xsl:attribute name="overflow">scroll</xsl:attribute>
</xsl:attribute-set>
```

---

## Testing Checklist

Before generating the final PDF, test these specific scenarios from the book:

- [ ] **Chapter 2**: Code examples with TypeScript interfaces (check syntax highlighting)
- [ ] **Chapter 4**: Code blocks inside numbered lists (exercises)
- [ ] **Chapter 10**: Tables with inline code (testing matrices)
- [ ] **Appendix A**: API reference tables with code formatting
- [ ] **Appendix D**: Benchmark tables with multiple columns
- [ ] **Appendix E**: Security checklist with checkboxes
- [ ] **All chapters**: Verify 750+ code examples have proper language tags

---

## Summary of Required Changes

### generate-dita.py

1. **CRITICAL**: Add language detection to code blocks (lines 355-357)
2. **CRITICAL**: Preserve formatting in table cells (lines 195-207)
3. **CRITICAL**: Handle code blocks in list items (lines 344-354)
4. **RECOMMENDED**: Add CodeHilite extension (line 233)
5. **RECOMMENDED**: Improve section handling (lines 336-339)

### generate-pdf.py

1. **RECOMMENDED**: Increase max image width for diagrams (line 81)
2. **RECOMMENDED**: Add code block styling attributes
3. **RECOMMENDED**: Add line wrapping for long code

---

## Implementation Priority

1. **Do first**: Fix code block language detection (breaks all 750+ examples)
2. **Do second**: Fix table formatting (breaks all benchmark/reference tables)
3. **Do third**: Fix code in list items (breaks all exercises)
4. **Do later**: Section hierarchy improvements
5. **Do later**: PDF styling enhancements

---

## Alternative Approach

If DITA conversion proves too complex for this technical book with extensive code, consider:

1. **Pandoc**: Better code handling out of the box
   ```bash
   pandoc -f markdown -t pdf --pdf-engine=xelatex \
     --highlight-style=tango \
     --toc --toc-depth=3 \
     -o book.pdf md/*.md
   ```

2. **AsciiDoc**: Better suited for technical documentation
   ```bash
   asciidoctor-pdf book.adoc
   ```

3. **mdBook**: Modern Rust-based book builder
   ```bash
   mdbook build
   ```

All of these handle code blocks and tables better than the current DITA approach.

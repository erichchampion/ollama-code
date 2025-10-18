<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:fo="http://www.w3.org/1999/XSL/Format"
                version="2.0">

  <!-- TOC indent for nested levels -->
  <xsl:attribute-set name="__toc__indent">
    <xsl:attribute name="start-indent">
      <xsl:variable name="level" select="count(ancestor-or-self::*[contains(@class, ' topic/topic ')])"/>
      <xsl:value-of select="concat($level * 12, 'pt')"/>
    </xsl:attribute>
  </xsl:attribute-set>

  <!-- TOC entry styling by level -->
  <xsl:attribute-set name="__toc__topic__content">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
    <xsl:attribute name="font-weight">
      <xsl:variable name="level" select="count(ancestor-or-self::*[contains(@class, ' topic/topic ')])"/>
      <xsl:choose>
        <xsl:when test="$level = 1">bold</xsl:when>
        <xsl:otherwise>normal</xsl:otherwise>
      </xsl:choose>
    </xsl:attribute>
    <xsl:attribute name="font-size">
      <xsl:variable name="level" select="count(ancestor-or-self::*[contains(@class, ' topic/topic ')])"/>
      <xsl:choose>
        <xsl:when test="$level = 1">14pt</xsl:when>
        <xsl:when test="$level = 2">12pt</xsl:when>
        <xsl:otherwise>10pt</xsl:otherwise>
      </xsl:choose>
    </xsl:attribute>
  </xsl:attribute-set>

  <!-- Global font family settings for consistency -->
  <xsl:attribute-set name="common.border__top">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <xsl:attribute-set name="common.border__bottom">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <!-- Body text -->
  <xsl:attribute-set name="body__toplevel">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <xsl:attribute-set name="topic">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <!-- Title and headings -->
  <xsl:attribute-set name="topic.title">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <xsl:attribute-set name="topic.topic.title">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <xsl:attribute-set name="section.title">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <!-- Paragraphs and text -->
  <xsl:attribute-set name="p">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <!-- Lists -->
  <xsl:attribute-set name="ul">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <xsl:attribute-set name="ol">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <!-- Tables -->
  <xsl:attribute-set name="table">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <xsl:attribute-set name="table.title">
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>

  <!-- Standalone figure images: full size, max 50% of page width -->
  <xsl:attribute-set name="image" use-attribute-sets="image__block">
  </xsl:attribute-set>

  <xsl:attribute-set name="image__block">
    <xsl:attribute name="content-width">
      <xsl:text>scale-to-fit</xsl:text>
    </xsl:attribute>
    <xsl:attribute name="content-height">
      <xsl:text>100%</xsl:text>
    </xsl:attribute>
    <xsl:attribute name="width">
      <xsl:text>100%</xsl:text>
    </xsl:attribute>
    <xsl:attribute name="max-width">
      <xsl:text>5in</xsl:text>
    </xsl:attribute>
    <xsl:attribute name="scaling">
      <xsl:text>uniform</xsl:text>
    </xsl:attribute>
  </xsl:attribute-set>

  <!-- Inline icon images: height limited to line height, preserve aspect ratio -->
  <xsl:attribute-set name="image__inline">
    <xsl:attribute name="content-height">
      <xsl:text>1em</xsl:text>
    </xsl:attribute>
    <xsl:attribute name="content-width">
      <xsl:text>scale-to-fit</xsl:text>
    </xsl:attribute>
    <xsl:attribute name="scaling">
      <xsl:text>uniform</xsl:text>
    </xsl:attribute>
    <xsl:attribute name="vertical-align">
      <xsl:text>middle</xsl:text>
    </xsl:attribute>
  </xsl:attribute-set>

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
    <xsl:attribute name="wrap-option">wrap</xsl:attribute>
  </xsl:attribute-set>

  <!-- Inline code -->
  <xsl:attribute-set name="codeph">
    <xsl:attribute name="font-family">monospace</xsl:attribute>
    <xsl:attribute name="font-size">0.9em</xsl:attribute>
    <xsl:attribute name="background-color">#f5f5f5</xsl:attribute>
    <xsl:attribute name="padding-left">2pt</xsl:attribute>
    <xsl:attribute name="padding-right">2pt</xsl:attribute>
  </xsl:attribute-set>

</xsl:stylesheet>

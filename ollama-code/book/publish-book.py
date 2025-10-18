#!/bin/zsh

python3 -m venv venv
source venv/bin/activate
pip install requests beautifulsoup4 html2text markdown ollama weasyprint PyPDF2 

./generate-dita.py
./generate-pdf.py

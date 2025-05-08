import os
from docx import Document
from pdfminer.high_level import extract_text as pdf_extract_text

def extract_text_from_docx(path: str) -> str:
    """
    Extract text from a .docx file.
    """
    doc = Document(path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def extract_text_from_pdf(path: str) -> str:
    """
    Extract text from a PDF file.
    """
    return pdf_extract_text(path)

def extract_text_from_txt(path: str, encoding: str = 'utf-8') -> str:
    """
    Extract text from a plain text file.
    """
    with open(path, 'r', encoding=encoding) as f:
        return f.read()

def extract_text(path: str) -> str:
    """
    Dispatch based on file extension.
    """
    ext = os.path.splitext(path)[1].lower()
    if ext == '.docx':
        return extract_text_from_docx(path)
    elif ext == '.pdf':
        return extract_text_from_pdf(path)
    elif ext == '.txt':
        return extract_text_from_txt(path)
    else:
        raise ValueError(f'Unsupported file type: {ext}')

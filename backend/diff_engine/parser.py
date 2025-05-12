import os

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
    if ext == '.txt':
        return extract_text_from_txt(path)
    else:
        raise ValueError(f'Unsupported file type: {ext}')

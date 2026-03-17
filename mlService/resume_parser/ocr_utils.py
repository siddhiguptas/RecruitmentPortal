"""
OCR Utility for Resume Parsing
Handles scanned PDFs and image-based resumes using Tesseract OCR
"""
import io
import re
import os
import sys
from typing import Optional

# Try to import OCR dependencies - gracefully handle if not available
OCR_AVAILABLE = False
OCR_ERROR = None

try:
    import pytesseract
    from pdf2image import convert_from_bytes
    from PIL import Image
    
    tesseract_path = os.environ.get('TESSERACT_PATH')
    poppler_path = os.environ.get('POPPLER_PATH')

    # Handle OS-specific defaults
    if os.name == "nt":
        # Windows
        if not tesseract_path:
            tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    else:
        # Linux (Render / Docker)
        if not tesseract_path:
            tesseract_path = "/usr/bin/tesseract"

    # Set Poppler path only if provided (Windows case)
    if poppler_path and os.path.exists(poppler_path):
        os.environ['PATH'] = poppler_path + os.pathsep + os.environ.get('PATH', '')

    # Configure Tesseract
    if tesseract_path and os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
        OCR_AVAILABLE = True
    else:
        OCR_ERROR = f"Tesseract not found at: {tesseract_path}"
        print(f"ERROR: {OCR_ERROR}", file=sys.stderr)
        
        # Test if Tesseract actually works
        try:
            version = pytesseract.get_tesseract_version()
            print(f"Tesseract version: {version}", file=sys.stderr)
        except Exception as e:
            OCR_ERROR = f"Tesseract test failed: {str(e)}"
            print(f"ERROR: {OCR_ERROR}", file=sys.stderr)
        else:
            OCR_AVAILABLE = True
            
except ImportError as e:
    OCR_ERROR = f"OCR import failed: {str(e)}"
    print(f"ERROR: {OCR_ERROR}", file=sys.stderr)
    pytesseract = None
    convert_from_bytes = None
    Image = None


def extract_text_with_ocr(pdf_bytes: bytes) -> Optional[str]:
    """
    Extract text from PDF using OCR (Tesseract).
    Used for scanned/image-based PDFs that don't have extractable text.
    
    Args:
        pdf_bytes: Raw bytes of the PDF file
        
    Returns:
        Extracted text string or None if OCR fails
    """
    if not OCR_AVAILABLE:
        print(f"OCR Error: OCR not available - {OCR_ERROR}", file=sys.stderr)
        return None
    
    try:
        # Check if poppler is available
        try:
            # Convert PDF pages to images
            images = convert_from_bytes(pdf_bytes)
        except Exception as e:
            print(f"OCR Error: pdf2image failed (is Poppler installed?): {str(e)}", file=sys.stderr)
            return None
        
        extracted_text = ""
        for page_num, image in enumerate(images):
            # Extract text from image using Tesseract
            text = pytesseract.image_to_string(image)
            extracted_text += text + "\n"
        
        return extracted_text if extracted_text.strip() else None
        
    except Exception as e:
        print(f"OCR Error: {str(e)}", file=sys.stderr)
        return None


def is_scanned_pdf(text: str) -> bool:
    """
    Determine if a PDF is likely scanned/image-based by checking
    if the extracted text is empty or contains very little content.
    
    Args:
        text: Extracted text from PDF
        
    Returns:
        True if PDF appears to be scanned
    """
    if not text or not text.strip():
        return True
    
    # Check for minimal content (scanned PDFs often have headers/footers only)
    cleaned_text = re.sub(r'\s+', ' ', text.strip())
    if len(cleaned_text) < 100:
        return True
    
    return False


def preprocess_ocr_text(text: str) -> str:
    """
    Clean and preprocess OCR-extracted text to fix common OCR errors.
    
    Args:
        text: Raw OCR output
        
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    
    # Fix common OCR misreads
    replacements = {
        '|': 'l',  # Pipe to lowercase L
        '0': 'O',  # Zero to O (context-dependent)
        '\xa0': ' ',  # Non-breaking space
    }
    
    # Apply basic replacements
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Fix common word breaks
    text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)
    
    # Clean up excessive whitespace
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    
    return text.strip()

TESSERACT_CMD = pytesseract.pytesseract.tesseract_cmd if OCR_AVAILABLE else None

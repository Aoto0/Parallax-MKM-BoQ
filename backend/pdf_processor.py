"""
PDF processing utilities for extracting text from PDF files.
"""
import io
from typing import Optional
from PyPDF2 import PdfReader


class PDFProcessor:
    """Handle PDF file processing and text extraction."""
    
    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        """
        Extract text content from a PDF file.
        
        Args:
            pdf_bytes: PDF file content as bytes
            
        Returns:
            Extracted text content as string
            
        Raises:
            Exception: If PDF processing fails
        """
        try:
            # Create a PDF reader from bytes
            pdf_file = io.BytesIO(pdf_bytes)
            pdf_reader = PdfReader(pdf_file)
            
            # Extract text from all pages
            text_content = []
            for page_num, page in enumerate(pdf_reader.pages, start=1):
                page_text = page.extract_text()
                if page_text:
                    text_content.append(f"--- Page {page_num} ---\n{page_text}")
            
            # Combine all text
            full_text = "\n\n".join(text_content)
            
            if not full_text.strip():
                raise Exception("No text content could be extracted from the PDF")
            
            return full_text
            
        except Exception as e:
            raise Exception(f"Failed to process PDF: {str(e)}")
    
    @staticmethod
    def validate_pdf(pdf_bytes: bytes) -> bool:
        """
        Validate if the file is a valid PDF.
        
        Args:
            pdf_bytes: File content as bytes
            
        Returns:
            True if valid PDF, False otherwise
        """
        try:
            pdf_file = io.BytesIO(pdf_bytes)
            PdfReader(pdf_file)
            return True
        except Exception:
            return False


# Create a global processor instance
pdf_processor = PDFProcessor()

"""
FastAPI backend for BOQ (Bill of Quantities) Generator.
Handles PDF upload, AI processing, and BOQ extraction.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, Any
import os

from config import settings
from pdf_processor import pdf_processor
from openai_service import openai_service

# Initialize FastAPI app
app = FastAPI(
    title="BOQ Generator API",
    description="API for extracting Bill of Quantities from CAD-generated PDF plans",
    version="1.0.0"
)

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "BOQ Generator API is running",
        "version": "1.0.0",
        "status": "healthy",
        "mock_mode": settings.USE_MOCK_AI or not settings.has_openai_key
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "openai_configured": settings.has_openai_key,
        "mock_mode": settings.USE_MOCK_AI or not settings.has_openai_key
    }


@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)) -> JSONResponse:
    """
    Upload a PDF file and extract Bill of Quantities using AI.
    
    Args:
        file: Uploaded PDF file
        
    Returns:
        JSON response containing extracted BOQ data
        
    Raises:
        HTTPException: If file validation or processing fails
    """
    try:
        # Validate file extension
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only PDF files are allowed."
            )
        
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
            )
        
        # Validate PDF format
        if not pdf_processor.validate_pdf(file_content):
            raise HTTPException(
                status_code=400,
                detail="Invalid PDF file. The file may be corrupted or not a valid PDF."
            )
        
        # Extract text from PDF
        try:
            pdf_text = pdf_processor.extract_text_from_pdf(file_content)
        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to extract text from PDF: {str(e)}"
            )
        
        # Process with OpenAI to extract BOQ
        try:
            boq_data = openai_service.extract_boq_from_pdf(pdf_text, file.filename)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process PDF with AI: {str(e)}"
            )
        
        # Return the extracted BOQ data
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "BOQ extracted successfully",
                "data": boq_data
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    finally:
        # Ensure file is closed and not stored (privacy best practice)
        await file.close()


@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify API is working."""
    return {
        "message": "Test endpoint working",
        "mock_mode": settings.USE_MOCK_AI or not settings.has_openai_key,
        "sample_boq": openai_service._mock_boq_extraction("test.pdf")
    }


if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting BOQ Generator API on {settings.HOST}:{settings.PORT}")
    print(f"📝 Environment: {settings.ENVIRONMENT}")
    print(f"🤖 Mock Mode: {settings.USE_MOCK_AI or not settings.has_openai_key}")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )

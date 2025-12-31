from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from typing import List
from openai_service import OpenAIService  # Import the OpenAI service for BoQ extraction
from pdf_generator import generate_boq_pdf
from regulation_validator import validate_boq
from PyPDF2 import PdfReader

# ** Initialize OpenAI Service with Your API Key **
# Replace "your-api-key-here" with your actual OpenAI API key
openai_service = OpenAIService(api_key="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")  

# Initialize FastAPI
app = FastAPI()


@app.get("/")
async def root():
    """
    API Health Check
    """
    return {"message": "Welcome to the BoQ Generator API!"}


@app.post("/api/upload-pdfs")
async def upload_pdfs(files: List[UploadFile] = File(...)):
    """
    Extract BoQ data from uploaded PDFs and generate PDF reports.

    Args:
        files: A list of uploaded PDF files.

    Returns:
        JSON response including BoQ data for each file or error details
    """
    results = []  # To store processing results for each file
    generated_pdfs = []  # To hold paths to generated BoQ PDFs

    for file in files:
        try:
            # Extract file name
            filename = file.filename

            # Extract text from the PDF using PyPDF2
            pdf_reader = PdfReader(file.file)
            extracted_text = ""
            for page in pdf_reader.pages:
                extracted_text += page.extract_text()

            # Handle cases where no text is extractable
            if not extracted_text.strip():
                raise ValueError(f"No readable text found in {filename}. It may be a scanned or image-based file.")

            # Generate BoQ using OpenAI
            boq_data = openai_service.extract_boq_from_pdf(extracted_text, filename)

            # Validate the extracted BoQ data against UK Building Regulations
            compliance_results = validate_boq(boq_data)
            boq_data["compliance"] = compliance_results

            # Generate a BoQ PDF report
            generated_pdf_path = generate_boq_pdf(filename, boq_data)
            generated_pdfs.append(generated_pdf_path)

            # Append successful processing results
            results.append({
                "filename": filename,
                "boq": boq_data,
                "generated_pdf": generated_pdf_path
            })

        except Exception as e:
            # Append error for this specific file
            results.append({
                "filename": filename,
                "error": f"Error processing file: {str(e)}"
            })

    # Single file: Return the BoQ as a downloadable PDF file
    if len(generated_pdfs) == 1:
        return FileResponse(generated_pdfs[0], media_type='application/pdf', filename="BoQ_Report.pdf")

    # Multiple files: Provide results as a JSON response
    return {
        "success": True,
        "message": "BoQ extraction completed.",
        "data": results
    }

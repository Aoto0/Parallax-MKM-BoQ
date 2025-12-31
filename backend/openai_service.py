"""
OpenAI GPT-4 service for processing PDF documents and extracting BOQ data.
Includes mock functionality for testing without API access.
"""
import json
from typing import Dict, List, Any
from openai import OpenAI
from config import settings


class OpenAIService:
    """Service for interacting with OpenAI GPT-4 API."""
    
    def __init__(self):
        """Initialize OpenAI client if API key is available."""
        self.use_mock = settings.USE_MOCK_AI or not settings.has_openai_key
        if not self.use_mock:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.client = None
            print("⚠️  Running in MOCK mode - OpenAI API calls will be simulated")
    
    def extract_boq_from_pdf(self, pdf_text: str, filename: str) -> Dict[str, Any]:
        """
        Extract Bill of Quantities from PDF text using GPT-4.
        
        Args:
            pdf_text: Extracted text content from PDF
            filename: Original PDF filename
            
        Returns:
            Dictionary containing BOQ data
        """
        if self.use_mock:
            return self._mock_boq_extraction(filename)
        
        try:
            # Create a structured prompt for BOQ extraction
            messages = [
                {
                    "role": "system",
                    "content": """You are an expert construction estimator specializing in Bill of Quantities (BOQ) extraction from building plans.
                    
Your task is to analyze construction documents and extract material quantities in a structured format.

Return the data as a JSON object with the following structure:
{
    "project_name": "extracted or inferred project name",
    "items": [
        {
            "item_no": "sequential number",
            "description": "detailed description of the item",
            "unit": "measurement unit (m², m³, m, kg, no., etc.)",
            "quantity": "numeric quantity",
            "category": "category (e.g., Earthwork, Concrete, Masonry, Steel, Finishing, etc.)"
        }
    ],
    "summary": {
        "total_items": "number of items",
        "categories": ["list of unique categories"]
    }
}

Be thorough and extract all quantifiable items from the document."""
                },
                {
                    "role": "user",
                    "content": f"Please extract the Bill of Quantities from the following construction document:\n\nFilename: {filename}\n\nContent:\n{pdf_text[:8000]}"  # Limit text to avoid token limits
                }
            ]
            
            # Call GPT-4 with function calling for structured output
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3,  # Lower temperature for more consistent extraction
                max_tokens=2000
            )
            
            # Parse the response
            result = json.loads(response.choices[0].message.content)
            
            # Add metadata
            result["metadata"] = {
                "source_file": filename,
                "extraction_method": "GPT-4",
                "mock": False
            }
            
            return result
            
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            # Fallback to mock on error
            return self._mock_boq_extraction(filename)
    
    def _mock_boq_extraction(self, filename: str) -> Dict[str, Any]:
        """
        Generate mock BOQ data for testing purposes.
        
        Args:
            filename: Original PDF filename
            
        Returns:
            Mock BOQ dictionary
        """
        return {
            "project_name": f"Sample Project - {filename}",
            "items": [
                {
                    "item_no": "1",
                    "description": "Excavation for foundation",
                    "unit": "m³",
                    "quantity": "125.5",
                    "category": "Earthwork"
                },
                {
                    "item_no": "2",
                    "description": "Plain Cement Concrete (PCC) 1:4:8",
                    "unit": "m³",
                    "quantity": "8.75",
                    "category": "Concrete"
                },
                {
                    "item_no": "3",
                    "description": "Reinforced Cement Concrete (RCC) M25",
                    "unit": "m³",
                    "quantity": "45.20",
                    "category": "Concrete"
                },
                {
                    "item_no": "4",
                    "description": "Steel reinforcement bars (TMT)",
                    "unit": "kg",
                    "quantity": "3500.00",
                    "category": "Steel"
                },
                {
                    "item_no": "5",
                    "description": "Brick masonry in cement mortar 1:6",
                    "unit": "m³",
                    "quantity": "78.50",
                    "category": "Masonry"
                },
                {
                    "item_no": "6",
                    "description": "Plaster 12mm thick, cement mortar 1:4",
                    "unit": "m²",
                    "quantity": "450.25",
                    "category": "Finishing"
                },
                {
                    "item_no": "7",
                    "description": "Waterproofing membrane",
                    "unit": "m²",
                    "quantity": "95.00",
                    "category": "Waterproofing"
                },
                {
                    "item_no": "8",
                    "description": "PVC plumbing pipes 100mm dia",
                    "unit": "m",
                    "quantity": "65.00",
                    "category": "Plumbing"
                },
                {
                    "item_no": "9",
                    "description": "Electrical conduit PVC 20mm",
                    "unit": "m",
                    "quantity": "180.50",
                    "category": "Electrical"
                },
                {
                    "item_no": "10",
                    "description": "Ceramic floor tiles 600x600mm",
                    "unit": "m²",
                    "quantity": "120.00",
                    "category": "Finishing"
                }
            ],
            "summary": {
                "total_items": "10",
                "categories": ["Earthwork", "Concrete", "Steel", "Masonry", "Finishing", "Waterproofing", "Plumbing", "Electrical"]
            },
            "metadata": {
                "source_file": filename,
                "extraction_method": "Mock",
                "mock": True
            }
        }


# Create a global service instance
openai_service = OpenAIService()

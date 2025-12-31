import openai
import json
import re


class OpenAIService:
    """
    A class to interact with OpenAI's API for extracting BoQ data from building plan text.
    """

    def __init__(self, api_key: str = None, model: str = "gpt-4"):
        """
        Initialize the OpenAIService with the provided API key and model (default: gpt-4).

        Args:
            api_key: The OpenAI API key for authentication.
            model: The OpenAI language model to use (default: "gpt-4").
        """
        self.api_key = api_key
        self.model = model

        # Validate API key
        if not self.api_key:
            raise ValueError("OpenAI API key is missing. Please provide a valid API key.")

        # Set the API key for OpenAI
        openai.api_key = self.api_key

    def generate_boq_prompt(self, extracted_text: str, filename: str) -> str:
        """
        Generate a structured prompt for BoQ extraction.

        Args:
            extracted_text: Text extracted from the building plan PDF.
            filename: The name of the uploaded file (for context).

        Returns:
            A properly formatted prompt string for OpenAI.
        """
        return f"""
        You are a highly accurate Bill of Quantities (BoQ) generation system.

        Your task:
        - Read the provided building plan text.
        - Generate a BoQ as valid, strict JSON.

        ----

        ### Rules:
        - Output only JSON. No explanations, comments, introductory or extra text.
        - All keys must be enclosed in double quotes ("...").
        - Ensure all numerical values use consistent floating-point precision (e.g., 25.0).

        ----

        ### BoQ Categories:
        1. **Superstructure and Roof**
           - Tiles, battens, brickwork, timber, and other structural tasks.
        2. **First Fix**
           - Carpentry, plumbing, electrical, and mechanical works.
        3. **Plastering**
           - Plasterboarding and skimming tasks.
        4. **Second Fix**
           - Door fittings, ironmongery, skirts, arcs, and final finishes.

        ----

        Building plan information from the file "{filename}":
        {extracted_text}
        """

    @staticmethod
    def clean_openai_response(response_content: str) -> str:
        """
        Cleans the raw OpenAI response to ensure it's valid JSON.

        Args:
            response_content: Raw response content from OpenAI.

        Returns:
            A cleaned JSON string.
        """
        # Use a regular expression to extract the JSON content from the response
        json_match = re.search(r"\{.*\}", response_content, flags=re.DOTALL)
        if json_match:
            return json_match.group(0)
        # Return raw content if JSON structure cannot be cleaned
        return response_content

    def extract_boq_from_pdf(self, extracted_text: str, filename: str) -> dict:
        """
        Extract BoQ data from the text extracted from a building plan PDF.

        Args:
            extracted_text: Text extracted from a building plan.
            filename: The name of the uploaded building plan file.

        Returns:
            A structured dictionary with BoQ information.
        """
        print(f"Processing file: {filename}...")
        print(f"Extracted text preview:\n{extracted_text[:500]}")  # Log the first 500 characters

        if not extracted_text.strip():
            raise ValueError("Extracted text is empty. Ensure the file is valid and readable.")

        # Generate the prompt for OpenAI
        prompt = self.generate_boq_prompt(extracted_text, filename)
        print(f"Generated prompt:\n{prompt}")

        try:
            # Call OpenAI's ChatCompletion API
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert in BoQ generation for construction."},
                    {"role": "user", "content": prompt}
                ]
            )

            # Debug response to verify if GPT-4 is responding correctly
            print("Raw response received from GPT-4:")
            print(json.dumps(response, indent=4))  # Pretty print full response for debugging

            # Save raw response for deeper debugging
            with open("debug_openai_raw_response.json", "w") as debug_file:
                json.dump(response, debug_file, indent=4)

            # Extract the content safely
            choices = response.get("choices", [])
            if not choices:
                raise ValueError("No choices returned in OpenAI response.")

            # Extracting the assistant's content
            content = choices[0].get("message", {}).get("content", "")
            if not content.strip():
                raise ValueError("OpenAI API returned an empty content.")

            print("Extracted Content from GPT-4:")
            print(content)

            # Clean the response and parse it as JSON
            cleaned_content = self.clean_openai_response(content)
            return json.loads(cleaned_content)

        except openai.error.OpenAIError as e:
            print(f"OpenAI API Error: {e}")
            raise RuntimeError("OpenAI API error occurred.")

        except json.JSONDecodeError as e:
            print("Failed to decode GPT-4 response as JSON.")
            print("Problematic content (if any):")
            print(content)

            # Save problematic content into a debug file for further review
            with open("debug_openai_response.json", "w") as debug_file:
                debug_file.write(content if content else "No content received.")
            raise ValueError("JSON Decoding Issue: Check response structure for errors.")

        except Exception as e:
            print(f"Unexpected error: {e}")
            raise RuntimeError(f"An unexpected error occurred: {e}")

# Backend - BOQ Generator API

FastAPI backend for processing CAD-generated PDFs and extracting Bill of Quantities using OpenAI GPT-4.

## Features

- 📤 PDF upload endpoint
- 🤖 OpenAI GPT-4 integration for BOQ extraction
- 🎭 Mock mode for testing without API access
- 🔒 Secure API key management
- 🚫 Privacy-focused (no data storage)

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**For testing without OpenAI API:**

Set `USE_MOCK_AI=true` in your `.env` file to use mock responses.

### 3. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /
GET /health
```

### Upload PDF
```
POST /api/upload-pdf
Content-Type: multipart/form-data

Parameters:
- file: PDF file (max 10MB)
```

Response:
```json
{
  "success": true,
  "message": "BOQ extracted successfully",
  "data": {
    "project_name": "Project Name",
    "items": [...],
    "summary": {...},
    "metadata": {...}
  }
}
```

### Test Endpoint
```
GET /api/test
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Privacy & Security

- **No Data Storage**: Uploaded files are processed in memory and immediately discarded
- **Secure API Keys**: Environment variables are used for sensitive configuration
- **File Validation**: All uploads are validated for type and size
- **CORS Protection**: Only allowed origins can access the API

## Development

### Mock Mode

For development without OpenAI API access:

1. Set `USE_MOCK_AI=true` in `.env`
2. The API will return realistic mock BOQ data

### Error Handling

The API includes comprehensive error handling:
- Invalid file types
- File size limits
- PDF processing errors
- API failures with fallback to mock

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required (or use mock) |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `ENVIRONMENT` | Environment mode | `development` |
| `USE_MOCK_AI` | Use mock responses | `false` |

## Tech Stack

- **FastAPI**: Modern Python web framework
- **OpenAI**: GPT-4 for BOQ extraction
- **PyPDF2**: PDF text extraction
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation

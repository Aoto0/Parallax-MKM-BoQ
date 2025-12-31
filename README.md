# Parallax-MKM-BoQ

🏗️ **BOQ Generator** - Automated Bill of Quantities extraction from CAD-generated PDFs using AI.

## Overview

This is an MVP application that automates the generation of Bill of Quantities (BOQ) from uploaded CAD-generated PDF files. The system uses OpenAI's GPT-4 API to intelligently extract material quantities and construction details from building plans.

## Features

### Frontend
- ✅ React-based file upload interface with drag-and-drop support
- ✅ Real-time progress indicator during AI processing
- ✅ User-friendly BOQ display in table format
- ✅ CSV export functionality for extracted BOQ data
- ✅ Responsive design for mobile and desktop

### Backend
- ✅ FastAPI REST API for PDF processing
- ✅ OpenAI GPT-4 integration for intelligent BOQ extraction
- ✅ PDF text extraction using PyPDF2
- ✅ Secure API key management via environment variables
- ✅ Mock mode for testing without OpenAI API access
- ✅ Privacy-focused: no data storage (files processed in memory)

### AI Integration
- ✅ OpenAI GPT-4 API client with structured output
- ✅ Intelligent extraction of construction materials and quantities
- ✅ Fallback to mock data for development/testing
- ✅ Error handling with graceful degradation

## Tech Stack

**Frontend:**
- React 18
- Vite (build tool)
- Axios (HTTP client)
- CSS3 (styling)

**Backend:**
- Python 3.8+
- FastAPI (web framework)
- OpenAI API (GPT-4)
- PyPDF2 (PDF processing)
- Uvicorn (ASGI server)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- OpenAI API key (optional, can use mock mode)

### 1. Clone the Repository

```bash
git clone https://github.com/Aoto0/Parallax-MKM-BoQ.git
cd Parallax-MKM-BoQ
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Edit .env and add your OpenAI API key (or set USE_MOCK_AI=true)
# OPENAI_API_KEY=sk-your-actual-api-key-here
# Or for testing without API:
# USE_MOCK_AI=true

# Start the backend server
python main.py
```

The backend will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Configure environment (optional)
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Usage

1. Open your browser to `http://localhost:5173`
2. Upload a PDF file (CAD-generated building plan)
3. Wait for AI processing (progress indicator will show)
4. View the extracted BOQ in a table format
5. Export the BOQ as a CSV file

## Project Structure

```
Parallax-MKM-BoQ/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration management
│   ├── openai_service.py       # OpenAI GPT-4 integration
│   ├── pdf_processor.py        # PDF text extraction
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment template
│   └── README.md              # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── FileUpload.jsx
│   │   │   ├── ProgressIndicator.jsx
│   │   │   └── BOQTable.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── App.jsx            # Main application
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── .env.example           # Frontend environment template
└── README.md                  # This file
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Environment
ENVIRONMENT=development

# Mock mode (set to true for testing without API)
USE_MOCK_AI=false
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

## Mock Mode

For development and testing without an OpenAI API key:

1. Set `USE_MOCK_AI=true` in `backend/.env`
2. The system will return realistic mock BOQ data
3. Perfect for frontend development and testing

## API Endpoints

### Health Check
```
GET /health
```

### Upload PDF
```
POST /api/upload-pdf
Content-Type: multipart/form-data

Parameters:
- file: PDF file (max 10MB)

Response:
{
  "success": true,
  "message": "BOQ extracted successfully",
  "data": {
    "project_name": "Project Name",
    "items": [...],
    "summary": {...}
  }
}
```

## Privacy & Security

- ✅ **No Data Storage**: Uploaded files are processed in memory and immediately discarded
- ✅ **Secure API Keys**: Environment variables for sensitive configuration
- ✅ **File Validation**: Type and size validation for all uploads
- ✅ **CORS Protection**: Configured allowed origins
- ✅ **Error Handling**: Comprehensive error handling throughout

## Development

### Running Tests

```bash
# Backend (if tests exist)
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Output will be in frontend/dist/
```

## Troubleshooting

### Backend Issues

**"Module not found" errors:**
```bash
pip install -r requirements.txt
```

**"OpenAI API key not configured":**
- Check your `.env` file
- Or set `USE_MOCK_AI=true`

### Frontend Issues

**"Cannot connect to backend":**
- Ensure backend is running on port 8000
- Check `VITE_API_URL` in frontend/.env

**CORS errors:**
- Check that frontend URL is in `ALLOWED_ORIGINS` in backend/config.py

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenAI for GPT-4 API
- FastAPI framework
- React and Vite communities

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for construction professionals
 

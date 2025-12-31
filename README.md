# Parallax MKM - Building Plan BoQ Generator

AI-Powered Bill of Quantities (BoQ) Generator for Building Plans

## 🏗️ Overview

This application allows you to upload building plans (PDF, JPEG, PNG) and automatically generate a detailed Bill of Quantities (BoQ) using AI analysis. The system extracts dimensions, materials, specifications, and construction details from building plans to create comprehensive cost estimates.

## ✨ Features

- **File Upload Interface**: Drag-and-drop or browse to upload building plans
- **Multiple Format Support**: Accepts PDF, JPEG, and PNG files (up to 10MB)
- **AI-Powered Analysis**: Uses AI vision models to analyze building plans
- **Detailed BoQ Generation**: Generates itemized quantities with:
  - Project information and dimensions
  - Categorized construction items
  - Quantities, units, and rates
  - Cost calculations and summaries
  - Tax and contingency estimates
- **Export Options**: Download BoQ as text file or print directly
- **Responsive Design**: Works on desktop and mobile devices
- **Demo Mode**: Works without AI API for testing with sample data

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Aoto0/Parallax-MKM-BoQ.git
cd Parallax-MKM-BoQ
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your AI API key:
```env
AI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4-vision-preview
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `AI_API_KEY`: Your OpenAI or compatible AI service API key
- `AI_API_ENDPOINT`: AI API endpoint (default: OpenAI)
- `AI_MODEL`: AI model to use (default: gpt-4-vision-preview)
- `MAX_FILE_SIZE`: Maximum upload file size in bytes (default: 10485760 = 10MB)
- `ALLOWED_FILE_TYPES`: Comma-separated list of allowed MIME types

### AI Prompt Configuration

Customize the AI analysis by editing `config/boqPrompt.json`:

- `systemPrompt`: System instructions for the AI
- `analysisInstructions`: Specific analysis guidelines
- `requiredElements`: List of elements to extract from plans
- `outputFormat`: Expected JSON structure for results
- `categories`: BoQ categories to use
- `estimationRules`: Rules for quantity estimation

## 📋 Usage

1. **Upload Building Plan**: 
   - Click "Select File" or drag and drop your building plan
   - Supported formats: PDF, JPEG, PNG (max 10MB)

2. **Analyze**: 
   - Click "Analyze Building Plan" button
   - Wait for AI to process the document

3. **Review Results**:
   - View project information and estimated area
   - Browse itemized quantities by category
   - Check cost summary with totals

4. **Export**:
   - Download BoQ as text file
   - Print directly from browser

## 🎯 How It Works

1. **File Upload**: User uploads building plan through web interface
2. **File Processing**: Server receives and validates the file
3. **AI Analysis**: 
   - PDF files: Text is extracted and sent to AI
   - Image files: Base64-encoded image sent to AI vision model
4. **BoQ Generation**: AI analyzes the plan and extracts:
   - Dimensions and areas
   - Construction materials
   - Quantities and specifications
   - Standard rates and costs
5. **Result Display**: Structured BoQ displayed in user-friendly format

## 📁 Project Structure

```
Parallax-MKM-BoQ/
├── server.js              # Express server and API endpoints
├── package.json           # Node.js dependencies
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── config/
│   └── boqPrompt.json    # AI prompt configuration
├── services/
│   └── aiService.js      # AI integration and BoQ generation
├── public/
│   ├── index.html        # Main web interface
│   ├── styles.css        # CSS styling
│   └── app.js            # Frontend JavaScript
└── uploads/              # Uploaded files (created automatically)
```

## 🤖 AI Integration

The system supports OpenAI GPT-4 Vision and compatible APIs. To use AI features:

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add the key to `.env` file
3. The system will automatically use AI for analysis

**Demo Mode**: Without an API key, the system provides sample BoQ data for testing.

## 🎨 Customization

### Modify BoQ Categories

Edit `config/boqPrompt.json` to add/remove categories:
```json
{
  "categories": [
    "Site Preparation",
    "Foundation Works",
    "Your Custom Category"
  ]
}
```

### Adjust Estimation Rules

Modify `estimationRules` in `config/boqPrompt.json`:
```json
{
  "estimationRules": [
    "Include 5% wastage for materials",
    "Your custom rule"
  ]
}
```

### UI Customization

Edit `public/styles.css` to change colors, fonts, and layout.

## 🛡️ Security

- File type validation on upload
- File size limits enforced
- API keys stored in environment variables
- Uploaded files stored locally (not in git)

## 🐛 Troubleshooting

### File Upload Fails
- Check file size (must be under 10MB)
- Verify file type (PDF, JPEG, PNG only)
- Ensure uploads directory has write permissions

### AI Analysis Returns Demo Data
- Verify AI_API_KEY is set in .env
- Check API key is valid and has credits
- Ensure API endpoint is accessible

### Server Won't Start
- Check if port 3000 is available
- Verify all dependencies are installed
- Check Node.js version (14+ required)

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for the construction industry

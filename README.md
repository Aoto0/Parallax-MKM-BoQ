# Parallax-MKM - Building Plan BoQ Generator

🏗️ **BOQ Generator** - Automated Bill of Quantities extraction from building plans (CAD-generated PDFs or images) using AI.

---

## Overview

This project is a web application designed to automate the generation of Bill of Quantities (BoQ) for construction quoting purposes. It uses AI tools, including OpenAI's GPT-4 API, to extract dimensions, materials, and detailed specifications from uploaded building plans.

---

## ✨ Features

### **Frontend**
- ✅ React-based file upload interface with drag-and-drop support.
- ✅ Real-time progress indicator during AI processing.
- ✅ User-friendly BoQ table display organized by categories.
- ✅ CSV export and print functionality.
- ✅ Responsive design for desktop and mobile.

### **Backend**
- ✅ FastAPI REST API for processing PDF files.
- ✅ OpenAI GPT-4 integration for AI-powered BoQ analysis.
- ✅ Mock mode for testing without OpenAI API access.
- ✅ In-memory file processing (no data storage for privacy).

### **AI Integration**
- ✅ Intelligent material and quantity extraction.
- ✅ Dynamic BoQ generation with categorized construction items.
- ✅ Demo mode for testing with realistic mock data.

### **Additional Features**
- **Formats Supported**: Upload PDFs (CAD-generated), JPEGs, and PNGs (≤10MB).
- **Customizable Categories**: Modify AI BoQ categories and estimation rules.
- **Secure Configuration**: API keys stored in `.env` files.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- OpenAI API key (or use mock mode)

---

### Installation and Setup

#### Clone the Repository
```bash
git clone https://github.com/Aoto0/Parallax-MKM-BoQ.git
cd Parallax-MKM-BoQ
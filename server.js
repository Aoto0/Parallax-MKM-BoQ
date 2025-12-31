const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // Default 10MB
  },
  fileFilter: fileFilter
});

// Import AI service
const { analyzeBuildingPlanWithAI } = require('./services/aiService');

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload endpoint
app.post('/api/upload', upload.single('buildingPlan'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // Analyze the building plan with AI
    const boqData = await analyzeBuildingPlanWithAI(filePath, fileType);

    res.json({
      success: true,
      message: 'Building plan analyzed successfully',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
      },
      boq: boqData
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({
      error: 'Failed to process building plan',
      message: error.message
    });
  }
});

// Get list of uploaded files
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).map(filename => ({
      filename,
      uploadedAt: fs.statSync(path.join(uploadsDir, filename)).mtime
    }));
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large' });
    }
    return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload`);
});

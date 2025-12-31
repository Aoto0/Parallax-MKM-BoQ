const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Use node-fetch for Node.js < 18, or built-in fetch for Node.js 18+
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
  console.warn('Fetch not available. AI API calls will not work.');
}

// Load BoQ prompt configuration
const boqPromptConfig = require('../config/boqPrompt.json');

// Constants
const DEFAULT_API_KEY_PLACEHOLDER = 'your_api_key_here';

/**
 * Analyzes a building plan using AI and generates a Bill of Quantities (BoQ)
 * @param {string} filePath - Path to the uploaded file
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<Object>} - BoQ data extracted from the building plan
 */
async function analyzeBuildingPlanWithAI(filePath, fileType) {
  try {
    let fileData;

    // Process based on file type
    if (fileType === 'application/pdf') {
      fileData = await processPDF(filePath);
    } else if (fileType.startsWith('image/')) {
      fileData = await processImage(filePath);
    } else {
      throw new Error('Unsupported file type');
    }

    // Prepare AI analysis request
    const analysisResult = await performAIAnalysis(fileData, fileType);

    // Generate BoQ from analysis
    const boq = generateBoQ(analysisResult);

    return boq;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw error;
  }
}

/**
 * Process PDF file and extract text/data
 */
async function processPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);

  return {
    text: pdfData.text,
    pages: pdfData.numpages,
    info: pdfData.info,
    metadata: pdfData.metadata || {}, // Add a fallback for metadata
  };
}

/**
 * Process image file
 */
async function processImage(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  const base64Image = imageBuffer.toString('base64');

  return {
    base64: base64Image,
    buffer: imageBuffer,
    metadata: {}, // Add empty metadata for consistency
  };
}

/**
 * Perform AI analysis on the building plan data
 */
async function performAIAnalysis(fileData, fileType) {
  const apiKey = process.env.AI_API_KEY;

  // If no API key is provided, return mock data for demonstration
  if (!apiKey || apiKey === DEFAULT_API_KEY_PLACEHOLDER) {
    console.log('No AI API key configured, returning demo BoQ');
    return generateDemoBoQ();
  }

  // Construct the AI prompt based on configuration
  const prompt = constructAnalysisPrompt(fileData, fileType);

  try {
    // Call AI API (OpenAI, Anthropic, etc.)
    const response = await callAIAPI(prompt, fileData, fileType);
    return response;
  } catch (error) {
    console.error('AI API call failed, returning demo BoQ:', error.message);
    return generateDemoBoQ();
  }
}

/**
 * Construct the AI analysis prompt based on configuration
 */
function constructAnalysisPrompt(fileData, fileType) {
  const config = boqPromptConfig;

  let prompt = config.systemPrompt + '\n\n';
  prompt += config.analysisInstructions + '\n\n';

  if (fileType === 'application/pdf' && fileData.text) {
    prompt += `Building Plan Text Content:\n${fileData.text}\n\n`;
  }

  prompt += 'Please analyze this building plan and provide:\n';
  config.requiredElements.forEach((element, index) => {
    prompt += `${index + 1}. ${element}\n`;
  });

  prompt += '\n' + config.outputFormat;

  return prompt;
}

/**
 * Call AI API with the prepared prompt
 */
async function callAIAPI(prompt, fileData, fileType) {
  const apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4-vision-preview';

  const messages = [
    {
      role: 'system',
      content: 'You are an expert construction estimator and quantity surveyor.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  // Add image if it's an image file
  if (fileType.startsWith('image/') && fileData.base64) {
    messages[1].content = [
      {
        type: 'text',
        text: prompt,
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:${fileType};base64,${fileData.base64}`,
        },
      },
    ];
  }

  console.log('Sending request to AI API:', JSON.stringify({ apiEndpoint, model, messages }, null, 2));

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('AI API response:', JSON.stringify(data, null, 2));

  return data.choices[0].message.content;
}

/**
 * Generate BoQ structure from AI analysis result
 */
function generateBoQ(analysisResult) {
  // If analysisResult is already an object (from demo), return it
  if (typeof analysisResult === 'object' && analysisResult.projectInfo) {
    analysisResult.metadata = analysisResult.metadata || {}; // Ensure metadata exists
    return analysisResult;
  }

  // Parse AI response and structure it as BoQ
  try {
    // Try to extract JSON if AI returned it
    const jsonMatch = analysisResult.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      const parsedBoQ = JSON.parse(jsonMatch[1]);
      parsedBoQ.metadata = parsedBoQ.metadata || {}; // Ensure metadata exists
      return parsedBoQ;
    }

    // If not JSON, return structured text
    return {
      projectInfo: {
        title: 'Building Project',
        analysisDate: new Date().toISOString(),
        source: 'AI Analysis',
      },
      items: parseBoQItems(analysisResult),
      summary: {
        totalItems: 0,
        analysisText: analysisResult,
      },
      metadata: {}, // Add metadata field
    };
  } catch (error) {
    return {
      projectInfo: {
        title: 'Building Project',
        analysisDate: new Date().toISOString(),
      },
      rawAnalysis: analysisResult,
      metadata: {}, // Add metadata field
      error: 'Failed to parse structured data',
    };
  }
}

/**
 * Parse BoQ items from text analysis
 */
function parseBoQItems(text) {
  const lines = text.split('\n');
  const items = [];

  lines.forEach((line) => {
    // Look for quantity patterns like "10 m2" or "5 units"
    const match = line.match(/(\d+(?:\.\d+)?)\s*(m2|m3|m|units?|pcs?|kg|tons?)/i);
    if (match) {
      items.push({
        description: line.trim(),
        quantity: parseFloat(match[1]),
        unit: match[2],
      });
    }
  });

  return items;
}

/**
 * Generate demo BoQ for testing without AI API
 */
function generateDemoBoQ() {
  return {
    projectInfo: {
      title: 'Sample Building Project',
      analysisDate: new Date().toISOString(),
      source: 'Demo Data (Configure AI_API_KEY for real analysis)',
    },
    items: [],
    metadata: {}, // Ensure metadata is included in demo BoQ
    notes: [
      'This is a demo BoQ for testing purposes.',
      'Configure AI_API_KEY to enable real AI-powered analysis.',
    ],
  };
}

module.exports = {
  analyzeBuildingPlanWithAI,
};

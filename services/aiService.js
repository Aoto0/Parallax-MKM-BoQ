const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Load BoQ prompt configuration
const boqPromptConfig = require('../config/boqPrompt.json');

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
    info: pdfData.info
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
    buffer: imageBuffer
  };
}

/**
 * Perform AI analysis on the building plan data
 */
async function performAIAnalysis(fileData, fileType) {
  const apiKey = process.env.AI_API_KEY;
  
  // If no API key is provided, return mock data for demonstration
  if (!apiKey || apiKey === 'your_api_key_here') {
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
      content: 'You are an expert construction estimator and quantity surveyor.'
    },
    {
      role: 'user',
      content: prompt
    }
  ];
  
  // Add image if it's an image file
  if (fileType.startsWith('image/') && fileData.base64) {
    messages[1].content = [
      {
        type: 'text',
        text: prompt
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:${fileType};base64,${fileData.base64}`
        }
      }
    ];
  }
  
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 4096
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI API returned ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate BoQ structure from AI analysis result
 */
function generateBoQ(analysisResult) {
  // If analysisResult is already an object (from demo), return it
  if (typeof analysisResult === 'object' && analysisResult.projectInfo) {
    return analysisResult;
  }
  
  // Parse AI response and structure it as BoQ
  // This is a simplified parser - in production, you'd want more robust parsing
  try {
    // Try to extract JSON if AI returned it
    const jsonMatch = analysisResult.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // If not JSON, return structured text
    return {
      projectInfo: {
        title: 'Building Project',
        analysisDate: new Date().toISOString(),
        source: 'AI Analysis'
      },
      items: parseBoQItems(analysisResult),
      summary: {
        totalItems: 0,
        analysisText: analysisResult
      }
    };
  } catch (error) {
    return {
      projectInfo: {
        title: 'Building Project',
        analysisDate: new Date().toISOString()
      },
      rawAnalysis: analysisResult,
      error: 'Failed to parse structured data'
    };
  }
}

/**
 * Parse BoQ items from text analysis
 */
function parseBoQItems(text) {
  // Simple parser for demonstration
  const lines = text.split('\n');
  const items = [];
  
  lines.forEach(line => {
    // Look for quantity patterns like "10 m2" or "5 units"
    const match = line.match(/(\d+(?:\.\d+)?)\s*(m2|m3|m|units?|pcs?|kg|tons?)/i);
    if (match) {
      items.push({
        description: line.trim(),
        quantity: parseFloat(match[1]),
        unit: match[2]
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
      estimatedArea: '250 m²'
    },
    items: [
      {
        category: 'Earthworks',
        items: [
          {
            id: 'E001',
            description: 'Excavation for foundation',
            quantity: 45,
            unit: 'm³',
            unitRate: 25.00,
            amount: 1125.00
          },
          {
            id: 'E002',
            description: 'Backfilling with compaction',
            quantity: 30,
            unit: 'm³',
            unitRate: 18.00,
            amount: 540.00
          }
        ]
      },
      {
        category: 'Concrete Works',
        items: [
          {
            id: 'C001',
            description: 'Plain cement concrete (PCC) 1:4:8',
            quantity: 12,
            unit: 'm³',
            unitRate: 150.00,
            amount: 1800.00
          },
          {
            id: 'C002',
            description: 'Reinforced cement concrete (RCC) M25',
            quantity: 35,
            unit: 'm³',
            unitRate: 250.00,
            amount: 8750.00
          },
          {
            id: 'C003',
            description: 'Steel reinforcement',
            quantity: 2800,
            unit: 'kg',
            unitRate: 65.00,
            amount: 182000.00
          }
        ]
      },
      {
        category: 'Masonry',
        items: [
          {
            id: 'M001',
            description: 'Brick masonry in cement mortar 1:6',
            quantity: 85,
            unit: 'm³',
            unitRate: 120.00,
            amount: 10200.00
          },
          {
            id: 'M002',
            description: 'Block masonry 200mm thick',
            quantity: 120,
            unit: 'm²',
            unitRate: 45.00,
            amount: 5400.00
          }
        ]
      },
      {
        category: 'Plastering',
        items: [
          {
            id: 'P001',
            description: 'Internal wall plastering 12mm thick',
            quantity: 380,
            unit: 'm²',
            unitRate: 22.00,
            amount: 8360.00
          },
          {
            id: 'P002',
            description: 'External wall plastering 15mm thick',
            quantity: 280,
            unit: 'm²',
            unitRate: 28.00,
            amount: 7840.00
          }
        ]
      },
      {
        category: 'Flooring',
        items: [
          {
            id: 'F001',
            description: 'Vitrified tile flooring 600x600mm',
            quantity: 250,
            unit: 'm²',
            unitRate: 85.00,
            amount: 21250.00
          }
        ]
      },
      {
        category: 'Doors and Windows',
        items: [
          {
            id: 'D001',
            description: 'Wooden door with frame',
            quantity: 8,
            unit: 'nos',
            unitRate: 8500.00,
            amount: 68000.00
          },
          {
            id: 'D002',
            description: 'Aluminium sliding window',
            quantity: 12,
            unit: 'nos',
            unitRate: 4500.00,
            amount: 54000.00
          }
        ]
      },
      {
        category: 'Painting',
        items: [
          {
            id: 'PT001',
            description: 'Interior emulsion painting (2 coats)',
            quantity: 380,
            unit: 'm²',
            unitRate: 18.00,
            amount: 6840.00
          },
          {
            id: 'PT002',
            description: 'Exterior weather proof painting',
            quantity: 280,
            unit: 'm²',
            unitRate: 25.00,
            amount: 7000.00
          }
        ]
      },
      {
        category: 'Electrical',
        items: [
          {
            id: 'EL001',
            description: 'Electrical wiring and conduits',
            quantity: 1,
            unit: 'lot',
            unitRate: 45000.00,
            amount: 45000.00
          },
          {
            id: 'EL002',
            description: 'Light fittings and switches',
            quantity: 1,
            unit: 'lot',
            unitRate: 25000.00,
            amount: 25000.00
          }
        ]
      },
      {
        category: 'Plumbing',
        items: [
          {
            id: 'PL001',
            description: 'Water supply piping with fittings',
            quantity: 1,
            unit: 'lot',
            unitRate: 35000.00,
            amount: 35000.00
          },
          {
            id: 'PL002',
            description: 'Sanitary fixtures',
            quantity: 1,
            unit: 'lot',
            unitRate: 28000.00,
            amount: 28000.00
          }
        ]
      }
    ],
    summary: {
      totalCategories: 9,
      totalItems: 19,
      subtotal: 514105.00,
      contingency: {
        percentage: 5,
        amount: 25705.25
      },
      tax: {
        percentage: 18,
        amount: 97185.89
      },
      grandTotal: 636996.14,
      currency: 'USD'
    },
    notes: [
      'This is a demo Bill of Quantities generated for demonstration purposes.',
      'Configure AI_API_KEY in .env file to enable real AI-powered analysis of building plans.',
      'Rates are indicative and should be verified with current market prices.',
      'Quantities are estimated based on typical construction requirements.'
    ]
  };
}

module.exports = {
  analyzeBuildingPlanWithAI
};

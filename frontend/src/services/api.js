import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

/**
 * Upload a PDF file to the backend for BOQ extraction
 * @param {FormData} formData - FormData containing the PDF file
 * @returns {Promise} - Promise resolving to the BOQ data
 */
export const uploadPDF = async (formData) => {
  try {
    const response = await apiClient.post('/api/upload-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.detail || 'Failed to process PDF');
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw new Error('Failed to upload PDF: ' + error.message);
    }
  }
};

/**
 * Check API health
 * @returns {Promise} - Promise resolving to health status
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Failed to connect to backend');
  }
};

export default {
  uploadPDF,
  checkHealth,
};

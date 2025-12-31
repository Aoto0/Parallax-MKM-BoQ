import { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ProgressIndicator from './components/ProgressIndicator';
import BOQTable from './components/BOQTable';
import { uploadPDF, checkHealth } from './services/api';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [boqData, setBoqData] = useState(null);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(status => {
        setBackendStatus(status);
      })
      .catch(err => {
        console.error('Backend health check failed:', err);
      });
  }, []);

  const handleUploadStart = () => {
    setIsProcessing(true);
    setError(null);
    setBoqData(null);
  };

  const handleUploadSuccess = async (formData, filename) => {
    try {
      const response = await uploadPDF(formData);
      
      if (response.success) {
        setBoqData(response.data);
        setError(null);
      } else {
        setError('Failed to extract BOQ from PDF');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing the PDF');
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setBoqData(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleExportCSV = () => {
    console.log('CSV exported successfully');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏗️ BOQ Generator</h1>
        <p>Extract Bill of Quantities from CAD-Generated PDFs using AI</p>
        {backendStatus && (
          <div className="backend-status">
            <span className={`status-indicator ${backendStatus.status === 'healthy' ? 'healthy' : 'unhealthy'}`}></span>
            <span>Backend: {backendStatus.status}</span>
            {backendStatus.mock_mode && <span className="mock-label">• Mock Mode</span>}
          </div>
        )}
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={handleReset} className="error-close">✕</button>
          </div>
        )}

        {!boqData && !isProcessing && (
          <FileUpload
            onUploadStart={handleUploadStart}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {isProcessing && <ProgressIndicator />}

        {boqData && (
          <BOQTable
            boqData={boqData}
            onExportCSV={handleExportCSV}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Built with React + FastAPI + OpenAI GPT-4 |{' '}
          <a href="https://github.com/Aoto0/Parallax-MKM-BoQ" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

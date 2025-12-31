import React, { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onUploadSuccess, onUploadStart }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUploadStart();
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      onUploadSuccess(formData, selectedFile.name);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-container">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        {!selectedFile ? (
          <>
            <div className="upload-icon">📄</div>
            <h3>Upload CAD-Generated PDF</h3>
            <p>Drag and drop your PDF file here, or</p>
            <button className="browse-btn" onClick={handleBrowseClick}>
              Browse Files
            </button>
            <p className="file-info">Supported format: PDF (Max 10MB)</p>
          </>
        ) : (
          <div className="file-selected">
            <div className="file-icon">✓</div>
            <div className="file-details">
              <h4>{selectedFile.name}</h4>
              <p>{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="file-actions">
              <button className="upload-btn" onClick={handleUploadClick}>
                Process PDF
              </button>
              <button className="clear-btn" onClick={handleClearFile}>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

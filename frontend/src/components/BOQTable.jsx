import React from 'react';
import './BOQTable.css';

const BOQTable = ({ boqData, onExportCSV, onReset }) => {
  if (!boqData || !boqData.items) {
    return null;
  }

  const { project_name, items, summary, metadata } = boqData;

  const handleExport = () => {
    // Create CSV content
    const headers = ['Item No', 'Description', 'Unit', 'Quantity', 'Category'];
    const csvRows = [headers.join(',')];
    
    items.forEach(item => {
      const row = [
        item.item_no,
        `"${item.description}"`, // Wrap in quotes to handle commas
        item.unit,
        item.quantity,
        item.category
      ];
      csvRows.push(row.join(','));
    });
    
    // Add summary
    csvRows.push('');
    csvRows.push(`Total Items,${summary.total_items}`);
    csvRows.push(`Categories,"${summary.categories.join(', ')}"`);
    
    const csvContent = csvRows.join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `BOQ_${project_name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onExportCSV) {
      onExportCSV();
    }
  };

  return (
    <div className="boq-container">
      <div className="boq-header">
        <div>
          <h2>Bill of Quantities</h2>
          <p className="project-name">{project_name}</p>
          {metadata && metadata.mock && (
            <span className="mock-badge">📝 Mock Data</span>
          )}
        </div>
        <div className="boq-actions">
          <button className="export-btn" onClick={handleExport}>
            📥 Export CSV
          </button>
          <button className="reset-btn" onClick={onReset}>
            🔄 New Upload
          </button>
        </div>
      </div>

      <div className="boq-summary">
        <div className="summary-item">
          <span className="summary-label">Total Items:</span>
          <span className="summary-value">{summary.total_items}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Categories:</span>
          <span className="summary-value">{summary.categories.length}</span>
        </div>
      </div>

      <div className="table-container">
        <table className="boq-table">
          <thead>
            <tr>
              <th>Item No</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.item_no}</td>
                <td className="description-cell">{item.description}</td>
                <td>{item.unit}</td>
                <td className="quantity-cell">{item.quantity}</td>
                <td>
                  <span className="category-badge">{item.category}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {metadata && (
        <div className="boq-footer">
          <p>
            <strong>Source:</strong> {metadata.source_file} | 
            <strong> Method:</strong> {metadata.extraction_method}
          </p>
        </div>
      )}
    </div>
  );
};

export default BOQTable;

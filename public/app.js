// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFileBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeBtnText = document.getElementById('analyzeBtnText');
const spinner = document.getElementById('spinner');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');

let selectedFile = null;
let boqData = null;

// Event Listeners
selectFileBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
removeFileBtn.addEventListener('click', clearFile);
analyzeBtn.addEventListener('click', analyzeFile);
retryBtn.addEventListener('click', () => {
    errorSection.style.display = 'none';
    clearFile();
});
downloadBtn.addEventListener('click', downloadBoQ);
printBtn.addEventListener('click', () => window.print());

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

uploadArea.addEventListener('click', (e) => {
    if (e.target === uploadArea || e.target.closest('.upload-icon, .upload-text, .upload-subtext')) {
        fileInput.click();
    }
});

// File Handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        showError('Invalid file type. Please upload a PDF, JPEG, or PNG file.');
        return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('File is too large. Maximum size is 10MB.');
        return;
    }

    selectedFile = file;
    displayFileInfo(file);
}

function displayFileInfo(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'flex';
    analyzeBtn.style.display = 'block';
    uploadArea.style.display = 'none';
}

function clearFile() {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    analyzeBtn.style.display = 'none';
    uploadArea.style.display = 'block';
    resultsSection.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Analysis
async function analyzeFile() {
    if (!selectedFile) return;

    // Show loading state
    analyzeBtnText.textContent = 'Analyzing...';
    spinner.style.display = 'inline-block';
    analyzeBtn.disabled = true;
    errorSection.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('buildingPlan', selectedFile);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to analyze building plan');
        }

        const result = await response.json();
        boqData = result.boq;
        displayResults(boqData);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An error occurred while analyzing the building plan.');
    } finally {
        // Reset button state
        analyzeBtnText.textContent = 'Analyze Building Plan';
        spinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

// Display Results
function displayResults(data) {
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // Display Project Info
    displayProjectInfo(data.projectInfo);

    // Display BoQ Items
    displayBoQItems(data.items);

    // Display Summary
    displaySummary(data.summary);

    // Display Notes
    if (data.notes && data.notes.length > 0) {
        displayNotes(data.notes);
    }
}

function displayProjectInfo(info) {
    const projectInfoDiv = document.getElementById('projectInfo');
    projectInfoDiv.innerHTML = `
        <h3>Project Information</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Project Title</span>
                <span class="info-value">${info.title || 'N/A'}</span>
            </div>
            ${info.estimatedArea ? `
            <div class="info-item">
                <span class="info-label">Estimated Area</span>
                <span class="info-value">${info.estimatedArea}</span>
            </div>
            ` : ''}
            <div class="info-item">
                <span class="info-label">Analysis Date</span>
                <span class="info-value">${formatDate(info.analysisDate)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Source</span>
                <span class="info-value">${info.source || 'AI Analysis'}</span>
            </div>
        </div>
    `;
}

function displayBoQItems(items) {
    const boqItemsDiv = document.getElementById('boqItems');
    boqItemsDiv.innerHTML = '';

    items.forEach(categoryData => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'boq-category';

        categoryDiv.innerHTML = `
            <div class="category-header">${categoryData.category}</div>
            <table class="boq-table">
                <thead>
                    <tr>
                        <th style="width: 10%;">ID</th>
                        <th style="width: 40%;">Description</th>
                        <th style="width: 12%;" class="text-right">Quantity</th>
                        <th style="width: 10%;">Unit</th>
                        <th style="width: 13%;" class="text-right">Unit Rate</th>
                        <th style="width: 15%;" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryData.items.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.description}</td>
                            <td class="text-right">${formatNumber(item.quantity)}</td>
                            <td>${item.unit}</td>
                            <td class="text-right">${formatCurrency(item.unitRate)}</td>
                            <td class="text-right">${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        boqItemsDiv.appendChild(categoryDiv);
    });
}

function displaySummary(summary) {
    const summaryDiv = document.getElementById('boqSummary');
    summaryDiv.innerHTML = `
        <h3>Summary</h3>
        <div class="summary-table">
            <div class="summary-row">
                <span>Total Categories:</span>
                <span>${summary.totalCategories}</span>
            </div>
            <div class="summary-row">
                <span>Total Items:</span>
                <span>${summary.totalItems}</span>
            </div>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(summary.subtotal)}</span>
            </div>
            ${summary.contingency ? `
            <div class="summary-row">
                <span>Contingency (${summary.contingency.percentage}%):</span>
                <span>${formatCurrency(summary.contingency.amount)}</span>
            </div>
            ` : ''}
            ${summary.tax ? `
            <div class="summary-row">
                <span>Tax (${summary.tax.percentage}%):</span>
                <span>${formatCurrency(summary.tax.amount)}</span>
            </div>
            ` : ''}
            <div class="summary-row">
                <span>Grand Total:</span>
                <span>${formatCurrency(summary.grandTotal)}</span>
            </div>
        </div>
    `;
}

function displayNotes(notes) {
    const notesDiv = document.getElementById('boqNotes');
    notesDiv.innerHTML = `
        <h4>Notes & Assumptions</h4>
        <ul>
            ${notes.map(note => `<li>${note}</li>`).join('')}
        </ul>
    `;
}

// Error Handling
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    errorSection.scrollIntoView({ behavior: 'smooth' });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

function downloadBoQ() {
    if (!boqData) return;

    // Create a simple text version for download
    let content = '='.repeat(80) + '\n';
    content += 'BILL OF QUANTITIES\n';
    content += '='.repeat(80) + '\n\n';

    content += 'Project Information:\n';
    content += '-'.repeat(80) + '\n';
    content += `Title: ${boqData.projectInfo.title}\n`;
    if (boqData.projectInfo.estimatedArea) {
        content += `Estimated Area: ${boqData.projectInfo.estimatedArea}\n`;
    }
    content += `Analysis Date: ${formatDate(boqData.projectInfo.analysisDate)}\n`;
    content += `Source: ${boqData.projectInfo.source}\n\n`;

    boqData.items.forEach(category => {
        content += '\n' + '='.repeat(80) + '\n';
        content += category.category.toUpperCase() + '\n';
        content += '='.repeat(80) + '\n\n';

        category.items.forEach(item => {
            content += `ID: ${item.id}\n`;
            content += `Description: ${item.description}\n`;
            content += `Quantity: ${formatNumber(item.quantity)} ${item.unit}\n`;
            content += `Unit Rate: ${formatCurrency(item.unitRate)}\n`;
            content += `Amount: ${formatCurrency(item.amount)}\n`;
            content += '-'.repeat(80) + '\n';
        });
    });

    content += '\n' + '='.repeat(80) + '\n';
    content += 'SUMMARY\n';
    content += '='.repeat(80) + '\n';
    content += `Total Categories: ${boqData.summary.totalCategories}\n`;
    content += `Total Items: ${boqData.summary.totalItems}\n`;
    content += `Subtotal: ${formatCurrency(boqData.summary.subtotal)}\n`;
    if (boqData.summary.contingency) {
        content += `Contingency (${boqData.summary.contingency.percentage}%): ${formatCurrency(boqData.summary.contingency.amount)}\n`;
    }
    if (boqData.summary.tax) {
        content += `Tax (${boqData.summary.tax.percentage}%): ${formatCurrency(boqData.summary.tax.amount)}\n`;
    }
    content += `Grand Total: ${formatCurrency(boqData.summary.grandTotal)}\n`;

    if (boqData.notes && boqData.notes.length > 0) {
        content += '\n' + '='.repeat(80) + '\n';
        content += 'NOTES & ASSUMPTIONS\n';
        content += '='.repeat(80) + '\n';
        boqData.notes.forEach((note, index) => {
            content += `${index + 1}. ${note}\n`;
        });
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BoQ_${boqData.projectInfo.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// History page JavaScript

let currentPage = 1;
const itemsPerPage = 10;
let allHistory = [];
let filteredHistory = [];
let currentDetailItem = null;

document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    setupSearchFilter();
    updateStatistics();
});

function loadHistory() {
    try {
        allHistory = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');
        filteredHistory = [...allHistory];
        
        if (allHistory.length === 0) {
            showNoHistory();
        } else {
            showHistory();
            renderHistoryTable();
            renderPagination();
        }
    } catch (error) {
        console.error('Error loading history:', error);
        showNoHistory();
    }
}

function showNoHistory() {
    document.getElementById('noHistory').style.display = 'block';
    document.getElementById('historyTable').style.display = 'none';
}

function showHistory() {
    document.getElementById('noHistory').style.display = 'none';
    document.getElementById('historyTable').style.display = 'block';
}

function renderHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredHistory.slice(startIndex, endIndex);
    
    pageItems.forEach((item, index) => {
        const row = createHistoryRow(item, startIndex + index + 1);
        tbody.appendChild(row);
    });
}

function createHistoryRow(item, index) {
    const row = document.createElement('tr');
    
    const resultText = item.result === 'VIÊM PHỔI' ? 'VIÊM PHỔI' : 'BÌNH THƯỜNG';
    const resultBadge = item.result === 'VIÊM PHỔI' ? 
        '<span class="badge bg-danger">VIÊM PHỔI</span>' : 
        '<span class="badge bg-success">BÌNH THƯỜNG</span>';
    
    const confidence = item.confidence ? item.confidence.replace('Độ tin cậy: ', '').replace('%', '') : '0';
    
    row.innerHTML = `
        <td class="fw-bold">${index}</td>
        <td>${item.timestamp || 'N/A'}</td>
        <td class="text-truncate" style="max-width: 200px;" title="${item.filename || 'Unknown'}">${item.filename || 'Unknown'}</td>
        <td>${resultBadge}</td>
        <td>
            <div class="d-flex align-items-center">
                <div class="progress me-2" style="width: 60px; height: 20px;">
                    <div class="progress-bar ${item.result === 'VIÊM PHỔI' ? 'bg-danger' : 'bg-success'}" 
                         style="width: ${confidence}%"></div>
                </div>
                <span class="small">${confidence}%</span>
            </div>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="viewHistoryDetail(${index - 1})" title="Xem chi tiết">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteHistoryItem(${index - 1})" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

function renderPagination() {
    const pagination = document.getElementById('historyPagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Trước</a>`;
    pagination.appendChild(prevLi);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
            pagination.appendChild(li);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = '<span class="page-link">...</span>';
            pagination.appendChild(li);
        }
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Sau</a>`;
    pagination.appendChild(nextLi);
}

function changePage(page) {
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderHistoryTable();
    renderPagination();
}

function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        if (searchTerm === '') {
            filteredHistory = [...allHistory];
        } else {
            filteredHistory = allHistory.filter(item => 
                (item.filename || '').toLowerCase().includes(searchTerm) ||
                (item.result || '').toLowerCase().includes(searchTerm) ||
                (item.timestamp || '').toLowerCase().includes(searchTerm)
            );
        }
        
        currentPage = 1;
        renderHistoryTable();
        renderPagination();
    });
}

function updateStatistics() {
    const totalCount = allHistory.length;
    const normalCount = allHistory.filter(item => item.result === 'BÌNH THƯỜNG').length;
    const pneumoniaCount = allHistory.filter(item => item.result === 'VIÊM PHỔI').length;
    
    let avgConfidence = 0;
    if (totalCount > 0) {
        const totalConfidence = allHistory.reduce((sum, item) => {
            const confidence = item.confidence ? parseFloat(item.confidence.replace('Độ tin cậy: ', '').replace('%', '')) : 0;
            return sum + confidence;
        }, 0);
        avgConfidence = Math.round(totalConfidence / totalCount);
    }
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('normalCount').textContent = normalCount;
    document.getElementById('pneumoniaCount').textContent = pneumoniaCount;
    document.getElementById('avgConfidence').textContent = avgConfidence + '%';
}

function viewHistoryDetail(index) {
    const item = filteredHistory[index];
    currentDetailItem = item;
    
    const modalBody = document.getElementById('historyDetailBody');
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted mb-2">Thông tin chẩn đoán:</h6>
                <p><strong>Ngày giờ:</strong> ${item.timestamp || 'N/A'}</p>
                <p><strong>Tên file:</strong> ${item.filename || 'N/A'}</p>
                <p><strong>Kết quả:</strong> 
                    <span class="badge ${item.result === 'VIÊM PHỔI' ? 'bg-danger' : 'bg-success'} fs-6">
                        ${item.result || 'N/A'}
                    </span>
                </p>
                <p><strong>Độ tin cậy:</strong> ${item.confidence || 'N/A'}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted mb-2">Khuyến nghị:</h6>
                <div class="alert ${item.result === 'VIÊM PHỔI' ? 'alert-danger' : 'alert-success'}">
                    ${getRecommendation(item.result, item.confidence)}
                </div>
            </div>
        </div>
        <hr>
        <div class="alert alert-warning">
            <strong>Lưu ý:</strong> Kết quả này chỉ mang tính chất tham khảo. 
            Cần có sự xác nhận từ bác sĩ chuyên khoa.
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('historyDetailModal'));
    modal.show();
}

function getRecommendation(result, confidenceText) {
    const confidence = confidenceText ? parseFloat(confidenceText.replace('Độ tin cậy: ', '').replace('%', '')) : 0;
    
    if (result === 'VIÊM PHỔI') {
        if (confidence >= 90) {
            return `
                <strong>Khả năng cao có viêm phổi (${confidence}%)</strong><br>
                • Khuyến nghị khám và điều trị ngay lập tức<br>
                • Thực hiện các xét nghiệm bổ sung<br>
                • Theo dõi sát tình trạng bệnh nhân
            `;
        } else if (confidence >= 70) {
            return `
                <strong>Có dấu hiệu viêm phổi (${confidence}%)</strong><br>
                • Cần khám thêm để xác định chính xác<br>
                • Có thể cần chụp X-quang bổ sung<br>
                • Theo dõi triệu chứng lâm sàng
            `;
        } else {
            return `
                <strong>Nghi ngờ có viêm phổi (${confidence}%)</strong><br>
                • Cần đánh giá lại với bác sĩ chuyên khoa<br>
                • Xem xét chụp lại ảnh X-quang<br>
                • Kết hợp với triệu chứng lâm sàng
            `;
        }
    } else {
        if (confidence >= 90) {
            return `
                <strong>Phổi bình thường (${confidence}%)</strong><br>
                • Không phát hiện dấu hiệu viêm phổi<br>
                • Tiếp tục theo dõi định kỳ<br>
                • Duy trì lối sống lành mạnh
            `;
        } else {
            return `
                <strong>Có thể bình thường (${confidence}%)</strong><br>
                • Cần đánh giá thêm để chắc chắn<br>
                • Xem xét chụp lại nếu có triệu chứng<br>
                • Theo dõi tình trạng sức khỏe
            `;
        }
    }
}

function deleteHistoryItem(index) {
    if (confirm('Bạn có chắc chắn muốn xóa kết quả này?')) {
        allHistory.splice(index, 1);
        localStorage.setItem('diagnosisHistory', JSON.stringify(allHistory));
        
        // Update filtered history
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm === '') {
            filteredHistory = [...allHistory];
        } else {
            filteredHistory = allHistory.filter(item => 
                (item.filename || '').toLowerCase().includes(searchTerm) ||
                (item.result || '').toLowerCase().includes(searchTerm) ||
                (item.timestamp || '').toLowerCase().includes(searchTerm)
            );
        }
        
        // Adjust current page if necessary
        const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        if (allHistory.length === 0) {
            showNoHistory();
        } else {
            renderHistoryTable();
            renderPagination();
        }
        
        updateStatistics();
        showAlert('Đã xóa kết quả thành công!', 'success');
    }
}

function clearHistory() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử? Hành động này không thể hoàn tác.')) {
        localStorage.removeItem('diagnosisHistory');
        allHistory = [];
        filteredHistory = [];
        currentPage = 1;
        showNoHistory();
        updateStatistics();
        showAlert('Đã xóa toàn bộ lịch sử!', 'success');
    }
}

function exportHistory() {
    if (allHistory.length === 0) {
        showAlert('Không có dữ liệu để xuất!', 'warning');
        return;
    }
    
    // Create CSV content
    let csvContent = "STT,Ngày giờ,Tên file,Kết quả,Độ tin cậy\n";
    
    allHistory.forEach((item, index) => {
        const result = item.result || 'N/A';
        const confidence = item.confidence ? item.confidence.replace('Độ tin cậy: ', '') : 'N/A';
        const filename = (item.filename || 'N/A').replace(/,/g, ';'); // Replace commas to avoid CSV issues
        const timestamp = item.timestamp || 'N/A';
        
        csvContent += `${index + 1},"${timestamp}","${filename}","${result}","${confidence}"\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lich_su_chan_doan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('Đã xuất file Excel thành công!', 'success');
}

function printHistoryItem() {
    if (!currentDetailItem) return;
    
    const printWindow = window.open('', '_blank');
    const confidence = currentDetailItem.confidence ? 
        currentDetailItem.confidence.replace('Độ tin cậy: ', '').replace('%', '') : '0';
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Chi tiết Kết quả Chẩn đoán</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .content { margin: 20px 0; }
                .result { padding: 15px; border: 2px solid #ddd; margin: 10px 0; background-color: #f9f9f9; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
                .badge { padding: 5px 10px; border-radius: 5px; color: white; font-weight: bold; }
                .bg-danger { background-color: #dc3545; }
                .bg-success { background-color: #28a745; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>HỆ THỐNG CHẨN ĐOÁN VIÊM PHỔI</h2>
                <h3>AI MEDICAL ASSISTANT</h3>
                <p>Chi tiết Kết quả Phân tích Ảnh X-quang</p>
            </div>
            
            <div class="result">
                <h3>Thông tin chẩn đoán:</h3>
                <p><strong>Ngày giờ:</strong> ${currentDetailItem.timestamp || 'N/A'}</p>
                <p><strong>Tên file:</strong> ${currentDetailItem.filename || 'N/A'}</p>
                <p><strong>Kết quả:</strong> 
                    <span class="badge ${currentDetailItem.result === 'VIÊM PHỔI' ? 'bg-danger' : 'bg-success'}">
                        ${currentDetailItem.result || 'N/A'}
                    </span>
                </p>
                <p><strong>Độ tin cậy:</strong> ${currentDetailItem.confidence || 'N/A'}</p>
                
                <h3>Khuyến nghị:</h3>
                <div style="padding: 10px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
                    ${getRecommendation(currentDetailItem.result, currentDetailItem.confidence)}
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Lưu ý quan trọng:</strong> Kết quả này chỉ mang tính chất tham khảo và hỗ trợ. 
                Cần có sự đánh giá và xác nhận từ bác sĩ chuyên khoa trước khi đưa ra quyết định điều trị.</p>
                <p><strong>In lúc:</strong> ${new Date().toLocaleString('vi-VN')}</p>
                <p><strong>Người thực hiện:</strong> _________________________ 
                   <strong>Chữ ký:</strong> _________________________</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}
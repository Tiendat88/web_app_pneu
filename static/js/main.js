// Main JavaScript for Pneumonia Detection App

document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');
    const resultsContainer = document.getElementById('resultsContainer');

    // File input change handler
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff'];
            if (!allowedTypes.includes(file.type)) {
                showAlert('Định dạng file không được hỗ trợ. Vui lòng chọn file PNG, JPG, JPEG, BMP hoặc TIFF.', 'warning');
                this.value = '';
                return;
            }

            // Validate file size (16MB = 16 * 1024 * 1024 bytes)
            if (file.size > 16 * 1024 * 1024) {
                showAlert('File quá lớn. Vui lòng chọn file nhỏ hơn 16MB.', 'warning');
                this.value = '';
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
        }
    });

    // Form submit handler
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) {
            showAlert('Vui lòng chọn file ảnh.', 'warning');
            return;
        }

        uploadAndAnalyze(file);
    });

    function uploadAndAnalyze(file) {
        const formData = new FormData();
        formData.append('file', file);

        // Show loading
        showLoading(true);
        hideResults();

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            showLoading(false);
            
            if (data.success) {
                displayResults(data);
                showAlert('Phân tích thành công!', 'success');
            } else {
                showAlert(data.error || 'Có lỗi xảy ra khi phân tích ảnh.', 'danger');
            }
        })
        .catch(error => {
            showLoading(false);
            console.error('Error:', error);
            showAlert('Có lỗi xảy ra khi kết nối với máy chủ.', 'danger');
        });
    }

    function displayResults(data) {
        // Update analysis info
        document.getElementById('analysisTime').textContent = data.timestamp;
        document.getElementById('fileName').textContent = data.filename.substring(0, 30) + '...';

        // Update diagnosis result
        const resultText = data.result === 'PNEUMONIA' ? 'VIÊM PHỔI' : 'BÌNH THƯỜNG';
        const resultClass = data.result === 'PNEUMONIA' ? 'text-danger' : 'text-success';
        const resultIcon = data.result === 'PNEUMONIA' ? 
            '<i class="fas fa-exclamation-triangle fa-2x text-danger"></i>' : 
            '<i class="fas fa-check-circle fa-2x text-success"></i>';

        document.getElementById('resultText').textContent = resultText;
        document.getElementById('resultText').className = `h5 mb-1 ${resultClass}`;
        document.getElementById('resultIcon').innerHTML = resultIcon;
        document.getElementById('confidenceText').textContent = `Độ tin cậy: ${data.confidence}%`;

        // Update confidence bar
        const confidenceBar = document.getElementById('confidenceBar');
        confidenceBar.style.width = `${data.confidence}%`;
        confidenceBar.className = `progress-bar ${data.result === 'PNEUMONIA' ? 'bg-danger' : 'bg-success'}`;
        confidenceBar.textContent = `${data.confidence}%`;

        // Update recommendations
        updateRecommendations(data.result, data.confidence);

        // Show results
        showResults();
    }

    function updateRecommendations(result, confidence) {
        const recommendations = document.getElementById('recommendations');
        let content = '';

        if (result === 'PNEUMONIA') {
            if (confidence >= 90) {
                content = `
                    <strong>Khả năng cao có viêm phổi (${confidence}%)</strong><br>
                    • Khuyến nghị khám và điều trị ngay lập tức<br>
                    • Thực hiện các xét nghiệm bổ sung<br>
                    • Theo dõi sát tình trạng bệnh nhân
                `;
                recommendations.className = 'alert alert-danger';
            } else if (confidence >= 70) {
                content = `
                    <strong>Có dấu hiệu viêm phổi (${confidence}%)</strong><br>
                    • Cần khám thêm để xác định chính xác<br>
                    • Có thể cần chụp X-quang bổ sung<br>
                    • Theo dõi triệu chứng lâm sàng
                `;
                recommendations.className = 'alert alert-warning';
            } else {
                content = `
                    <strong>Nghi ngờ có viêm phổi (${confidence}%)</strong><br>
                    • Cần đánh giá lại với bác sĩ chuyên khoa<br>
                    • Xem xét chụp lại ảnh X-quang<br>
                    • Kết hợp với triệu chứng lâm sàng
                `;
                recommendations.className = 'alert alert-warning';
            }
        } else {
            if (confidence >= 90) {
                content = `
                    <strong>Phổi bình thường (${confidence}%)</strong><br>
                    • Không phát hiện dấu hiệu viêm phổi<br>
                    • Tiếp tục theo dõi định kỳ<br>
                    • Duy trì lối sống lành mạnh
                `;
                recommendations.className = 'alert alert-success';
            } else {
                content = `
                    <strong>Có thể bình thường (${confidence}%)</strong><br>
                    • Cần đánh giá thêm để chắc chắn<br>
                    • Xem xét chụp lại nếu có triệu chứng<br>
                    • Theo dõi tình trạng sức khỏe
                `;
                recommendations.className = 'alert alert-info';
            }
        }

        recommendations.innerHTML = content;
    }

    function showLoading(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
        analyzeBtn.disabled = show;
        
        if (show) {
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang phân tích...';
        } else {
            analyzeBtn.innerHTML = '<i class="fas fa-microscope me-2"></i>Phân tích ảnh';
        }
    }

    function showResults() {
        noResults.style.display = 'none';
        resultsContainer.style.display = 'block';
    }

    function hideResults() {
        noResults.style.display = 'block';
        resultsContainer.style.display = 'none';
    }

    function showAlert(message, type) {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
});

// Global functions
function saveResult() {
    const resultData = {
        result: document.getElementById('resultText').textContent,
        confidence: document.getElementById('confidenceText').textContent,
        timestamp: document.getElementById('analysisTime').textContent,
        filename: document.getElementById('fileName').textContent
    };

    // Save to localStorage for history
    let history = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');
    history.unshift(resultData);
    
    // Keep only last 50 results
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('diagnosisHistory', JSON.stringify(history));

    // Show success message
    showAlert('Kết quả đã được lưu vào lịch sử.', 'success');
}

function printResult() {
    const printWindow = window.open('', '_blank');
    const resultText = document.getElementById('resultText').textContent;
    const confidenceText = document.getElementById('confidenceText').textContent;
    const analysisTime = document.getElementById('analysisTime').textContent;
    const fileName = document.getElementById('fileName').textContent;
    const recommendations = document.getElementById('recommendations').textContent;

    printWindow.document.write(`
        <html>
        <head>
            <title>Kết quả Chẩn đoán Viêm phổi</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .result { padding: 20px; border: 1px solid #ddd; margin: 10px 0; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>HỆ THỐNG CHẨN ĐOÁN VIÊM PHỔI - AI MEDICAL ASSISTANT</h2>
                <p>Kết quả Phân tích Ảnh X-quang</p>
            </div>
            
            <div class="result">
                <h3>Thông tin phân tích:</h3>
                <p><strong>Ngày giờ:</strong> ${analysisTime}</p>
                <p><strong>Tệp tin:</strong> ${fileName}</p>
                
                <h3>Kết quả chẩn đoán:</h3>
                <p><strong>Chẩn đoán:</strong> ${resultText}</p>
                <p><strong>${confidenceText}</strong></p>
                
                <h3>Khuyến nghị:</h3>
                <p>${recommendations}</p>
            </div>
            
            <div class="footer">
                <p><strong>Lưu ý:</strong> Kết quả này chỉ mang tính chất tham khảo. Cần có sự xác nhận từ bác sĩ chuyên khoa.</p>
                <p>In lúc: ${new Date().toLocaleString('vi-VN')}</p>
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
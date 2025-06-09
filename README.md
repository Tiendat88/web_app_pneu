# AI Medical Assistant - Web Application

🩺 **Ứng dụng web AI hỗ trợ chẩn đoán viêm phổi từ ảnh X-quang phổi**

## 📋 Mô tả

Ứng dụng web được xây dựng bằng Flask và TensorFlow, cho phép upload ảnh X-quang phổi và tự động phát hiện dấu hiệu viêm phổi bằng mô hình DenseNet121.

## ✨ Tính năng

- 🔍 **Phát hiện viêm phổi tự động** từ ảnh X-quang
- 📊 **Hiển thị độ tin cậy** của kết quả dự đoán
- 🖼️ **Hỗ trợ nhiều định dạng ảnh**: PNG, JPG, JPEG, BMP, TIFF
- 📱 **Giao diện responsive** thân thiện với người dùng
- ⚡ **Xử lý nhanh chóng** với fallback handling
- 🔧 **API endpoints** cho tích hợp hệ thống

## 🛠️ Công nghệ sử dụng

- **Backend**: Flask (Python)
- **AI/ML**: TensorFlow, Keras
- **Image Processing**: PIL
- **Frontend**: HTML5, CSS3, JavaScript
- **Model**: DenseNet121 Transfer Learning

## 📦 Cài đặt

### Yêu cầu hệ thống
- Python 3.7+
- 4GB+ RAM (khuyến nghị)

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd web_app
```

### Bước 2: Tạo virtual environment
```bash
# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Hoặc sử dụng script setup cho macOS:
chmod +x setup_macos.sh
./setup_macos.sh
```

### Bước 3: Cài đặt dependencies
```bash
# Cho Linux/Windows:
pip install -r requirements.txt

# Cho macOS:
pip install -r requirements_macos.txt
```

### Bước 4: Cấu trúc thư mục

```
web_app/
├── app.py                          # File chính của ứng dụng Flask
├── lung.ipynb                      # Jupyter Notebook huấn luyện mô hình AI
├── pneumonia_detection_model.h5    # File mô hình AI đã huấn luyện
├── requirements.txt                # Dependencies cho Linux/Windows
├── requirements_macos.txt          # Dependencies cho macOS
├── setup_macos.sh                  # Script setup cho macOS
├── README.md
├── .venv/                          # Virtual environment Python
├── binh_thuong/                    # Thư mục ảnh mẫu (bình thường)
├── viem_phoi/                      # Thư mục ảnh mẫu (viêm phổi)
├── uploads/                        # Thư mục lưu ảnh upload
├── templates/                      # HTML templates
└── static/                         # Static files
    ├── css/
    │   └── style.css
    └── js/
        ├── main.js
        └── history.js
```

### Bước 5: Cấu hình đường dẫn mô hình
Cập nhật đường dẫn mô hình trong `app.py`:
```python
# Thay đổi đường dẫn cho phù hợp với máy của bạn
model_path = '/path/to/your/web_app/pneumonia_detection_model.h5'
```

## 🚀 Chạy ứng dụng

### Development mode
```bash
# Kích hoạt virtual environment
source venv/bin/activate  # macOS/Linux

# Chạy ứng dụng
python app.py
```

Ứng dụng sẽ chạy tại: `http://localhost:5001`

### Production mode
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## 🔧 API Endpoints

### Upload và phân tích ảnh
```http
POST /upload
Content-Type: multipart/form-data

Response:
{
    "success": true,
    "result": "PNEUMONIA|NORMAL",
    "confidence": 85.67,
    "image_data": "base64_encoded_image",
    "filename": "20231201_143022_xray.jpg",
    "timestamp": "2023-12-01 14:30:22"
}
```

### Thông tin mô hình
```http
GET /api/model-info
```

### Reload mô hình
```http
POST /api/reload-model
```

## 📁 Files cấu hình

### requirements.txt (Linux/Windows)
```txt
Flask==2.3.3
tensorflow==2.13.0
Pillow==10.0.1
numpy==1.24.3
Werkzeug==2.3.7
gunicorn==21.2.0
```

### requirements_macos.txt (macOS)
```txt
Flask==2.3.3
tensorflow-macos==2.13.0
Pillow==10.0.1
numpy==1.24.3
Werkzeug==2.3.7
gunicorn==21.2.0
```

## 🔍 Cách sử dụng

1. **Khởi động ứng dụng**: `python app.py`
2. **Truy cập web**: Mở `http://localhost:5001`
3. **Test với dữ liệu mẫu**: 
   - Upload ảnh từ thư mục `binh_thuong/` (kết quả: NORMAL)
   - Upload ảnh từ thư mục `viem_phoi/` (kết quả: PNEUMONIA)
4. **Upload ảnh X-quang**: Click "Chọn file" và chọn ảnh X-quang phổi
5. **Xem kết quả**: Hệ thống sẽ hiển thị kết quả và độ tin cậy

## 🛡️ Bảo mật

- ✅ Kiểm tra định dạng file upload
- ✅ Giới hạn kích thước file (16MB)
- ✅ Secure filename handling
- ✅ Input validation
- ⚠️ **Lưu ý**: Cần thêm authentication cho production

## 🐛 Xử lý lỗi

Ứng dụng có hệ thống fallback handling:
- Model loading với nhiều phương pháp
- Dummy prediction khi mô hình không load được
- Error responses chi tiết

## 📊 Hiệu suất

- **Thời gian xử lý**: ~2-5 giây/ảnh
- **Kích thước mô hình**: ~100MB
- **RAM sử dụng**: ~1-2GB

## ⚠️ Disclaimer

**QUAN TRỌNG**: Ứng dụng này chỉ mang tính chất hỗ trợ và demo. Kết quả dự đoán **KHÔNG THAY THẾ** được chẩn đoán của bác sĩ chuyên khoa.

## 📄 License

Dự án này được phân phối dưới giấy phép MIT.

---

**Phiên bản**: 1.0  
**Cập nhật lần cuối**: June 2025
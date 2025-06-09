#!/bin/bash

# ========================================
# AI Medical Assistant - Setup Script for macOS
# ========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo "🍎 =========================================="
echo "   AI Medical Assistant Setup for macOS"
echo "========================================== 🍎"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only!"
    exit 1
fi

print_success "✅ Running on macOS"

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    print_warning "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    print_success "✅ Homebrew is already installed"
fi

# Check Python installation
if ! command -v python3 &> /dev/null; then
    print_warning "Python3 not found. Installing Python via Homebrew..."
    brew install python
else
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "✅ Python3 is installed (version: $PYTHON_VERSION)"
fi

# Create project directory
PROJECT_NAME="ai-medical-assistant"
if [ -d "$PROJECT_NAME" ]; then
    print_warning "Directory $PROJECT_NAME already exists"
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_NAME"
        print_success "✅ Removed existing directory"
    else
        print_error "❌ Setup cancelled"
        exit 1
    fi
fi

mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME"
print_success "✅ Created project directory: $PROJECT_NAME"

# Create directory structure
print_status "Creating directory structure..."
mkdir -p templates static/css static/js uploads
print_success "✅ Directory structure created"

# Create requirements.txt
print_status "Creating requirements.txt..."
cat > requirements.txt << 'EOF'
Flask==3.0.0
tensorflow==2.15.0
Pillow==10.1.0
numpy==1.24.3
Werkzeug==3.0.1
Jinja2==3.1.2
MarkupSafe==2.1.3
itsdangerous==2.1.2
click==8.1.7
blinker==1.7.0
EOF
print_success "✅ requirements.txt created"

# Create Python virtual environment
print_status "Creating Python virtual environment..."
python3 -m venv venv
print_success "✅ Virtual environment created"

# Activate virtual environment and install packages
print_status "Activating virtual environment and installing packages..."
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install packages
pip install -r requirements.txt
print_success "✅ All packages installed successfully"

# Create starter app.py file
print_status "Creating app.py template..."
cat > app.py << 'EOF'
from flask import Flask, render_template, request, jsonify, url_for
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os
from werkzeug.utils import secure_filename
import datetime
import base64
from io import BytesIO
from PIL import Image
import json

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff'}

# Image dimensions for the model
IMG_HEIGHT = 224
IMG_WIDTH = 224

# Try to load the model on startup
try:
    model = tf.keras.models.load_model('pneumonia_detection_model.h5')
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("⚠️  Please ensure 'pneumonia_detection_model.h5' is in the project root directory")
    model = None

@app.route('/')
def index():
    return "<h1>🍎 AI Medical Assistant</h1><p>Please add your HTML templates and model file to complete the setup.</p>"

if __name__ == '__main__':
    # Check if model file exists
    if not os.path.exists('pneumonia_detection_model.h5'):
        print("⚠️  WARNING: Model file 'pneumonia_detection_model.h5' not found!")
        print("📁 Please copy your trained model file to the project directory")
    
    print("🚀 Starting Flask server...")
    print("🌐 Open your browser and go to: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
EOF
print_success "✅ app.py template created"

# Create start script
print_status "Creating startup script..."
cat > start_app.sh << 'EOF'
#!/bin/bash
echo "🍎 Starting AI Medical Assistant..."
cd "$(dirname "$0")"
source venv/bin/activate
python app.py
EOF
chmod +x start_app.sh
print_success "✅ Startup script created (start_app.sh)"

# Create README for next steps
print_status "Creating setup instructions..."
cat > NEXT_STEPS.md << 'EOF'
# 🎯 Next Steps to Complete Setup

## 1. Add Your Files
Copy these files to the project directory:

### Model File (Required)
- `pneumonia_detection_model.h5` → Root directory

### HTML Templates → `templates/` folder
- `index.html` - Main diagnosis page
- `history.html` - History page  
- `about.html` - About page

### CSS File → `static/css/` folder
- `style.css` - Custom styles

### JavaScript Files → `static/js/` folder
- `main.js` - Main page logic
- `history.js` - History page logic

## 2. Start the Application
```bash
# Option 1: Use the startup script
./start_app.sh

# Option 2: Manual start
source venv/bin/activate
python app.py
```

## 3. Open in Browser
Visit: http://localhost:5000

## 4. File Structure Should Look Like:
```
ai-medical-assistant/
├── app.py
├── requirements.txt
├── start_app.sh
├── pneumonia_detection_model.h5  ← Add this
├── venv/
├── uploads/
├── templates/
│   ├── index.html      ← Add this
│   ├── history.html    ← Add this
│   └── about.html      ← Add this
└── static/
    ├── css/
    │   └── style.css   ← Add this
    └── js/
        ├── main.js     ← Add this
        └── history.js  ← Add this
```

## 5. Development Tips
- Use VS Code: `code .`
- Activate venv: `source venv/bin/activate`
- Deactivate venv: `deactivate`
- View logs: Check terminal output
- Stop server: Press Ctrl+C

## 6. Troubleshooting
- Model not found: Copy .h5 file to root directory
- Port in use: Change port in app.py or kill existing process
- Permission denied: Run `chmod +x start_app.sh`
EOF

print_success "✅ Setup instructions created (NEXT_STEPS.md)"

# Final summary
echo ""
echo "🎉 =========================================="
echo "     Setup Complete!"  
echo "========================================== 🎉"
echo ""
print_success "✅ Project directory created: $(pwd)"
print_success "✅ Virtual environment set up"
print_success "✅ Dependencies installed"
print_success "✅ Startup script ready"
echo ""
print_warning "📋 NEXT STEPS:"
echo "   1. Copy your model file: pneumonia_detection_model.h5"
echo "   2. Add HTML templates to templates/ folder"
echo "   3. Add CSS/JS files to static/ folders"
echo "   4. Run: ./start_app.sh"
echo ""
print_status "📖 Read NEXT_STEPS.md for detailed instructions"
echo ""

# Ask if user wants to open the directory
read -p "🔍 Do you want to open the project directory in Finder? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open .
fi

# Ask if user wants to open in VS Code
if command -v code &> /dev/null; then
    read -p "💻 Do you want to open the project in VS Code? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        code .
    fi
fi

echo "🚀 Happy coding! Your AI Medical Assistant is almost ready!"
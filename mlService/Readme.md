# ML Service Setup

## Installation

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

## Running the Service

```bash
uvicorn main:app --reload
```

The server runs at: http://127.0.0.1:8000

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ocr-status` | GET | Check if OCR (Tesseract) is available |
| `/test-ocr` | POST | Test OCR with a PDF file |
| `/parse-resume` | POST | Upload PDF resume, returns structured profile |
| `/parse-resume-text` | POST | Parse plain text resume content |
| `/match-job` | POST | Match skills to job description |
| `/recommend-jobs` | POST | Rank jobs for a student |
| `/rank-candidates` | POST | Rank candidates for a job |
| `/predict-placement` | POST | Placement probability and recommendations |
| `/api/predict-placement` | POST | Placement probability and recommendations (alias) |
| `/ws/proctor` | WebSocket | Proctoring stream (frames in, alerts out) |

## OCR Setup (Windows)

1. Download Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
2. Download Poppler: https://github.com/oschwartz10612/poppler-windows/releases/
3. Add both to PATH, or set environment variables:
   - `TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe`
   - `POPPLER_PATH=C:\Program Files\poppler-25.12.0\Library\bin`

## Environment Variables

Copy `.env.example` to `.env` and configure if needed (optional - defaults work on most systems).

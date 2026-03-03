from fastapi import FastAPI, UploadFile, File
from resume_parser.parser import extract_resume_data
from schemas import ProfileData
import PyPDF2
import io
from fastapi import HTTPException
from profile_builder.builder import build_profile
from job_matching.matcher import calculate_match
from schemas import JobMatchRequest, JobMatchResponse
from job_matching.ranking import rank_jobs_for_student
from schemas import JobRankingRequest, JobRankingResponse
from job_matching.ranking import rank_candidates_for_job
from schemas import CandidateRankingRequest, CandidateRankingResponse
from resume_parser.ocr_utils import extract_text_with_ocr, preprocess_ocr_text, is_scanned_pdf, OCR_AVAILABLE, OCR_ERROR
from utils import validate_cgpa, validate_experience_years, validate_email, validate_phone
import sys

app = FastAPI(title="Recruitment ML Service")

@app.get("/ocr-status")
def get_ocr_status():
    """Check OCR availability and configuration"""
    return {
        "ocr_available": OCR_AVAILABLE,
        "error": OCR_ERROR,
        "tesseract_path": r'C:\Program Files\Tesseract-OCR\tesseract.exe' if OCR_AVAILABLE else None
    }

@app.post("/test-ocr")
async def test_ocr(file: UploadFile = File(...)):
    """Test endpoint to debug OCR issues"""
    contents = await file.read()
    
    # First try regular PDF extraction
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    
    result = {
        "pdf_extraction": {
            "text_length": len(text),
            "text_preview": text[:200] if text else "(empty)",
            "is_scanned": is_scanned_pdf(text) if text else True
        },
        "ocr_available": OCR_AVAILABLE,
        "ocr_error": OCR_ERROR
    }
    
    # Try OCR if available
    if OCR_AVAILABLE:
        try:
            ocr_text = extract_text_with_ocr(contents)
            result["ocr_result"] = {
                "text_length": len(ocr_text) if ocr_text else 0,
                "text_preview": ocr_text[:200] if ocr_text else "(empty)",
                "success": bool(ocr_text and ocr_text.strip())
            }
        except Exception as e:
            result["ocr_exception"] = str(e)
            print(f"OCR Exception: {str(e)}", file=sys.stderr)
    
    return result

@app.post("/parse-resume", response_model=ProfileData)
async def parse_resume(file: UploadFile = File(...)):

    contents = await file.read()

    # Convert PDF bytes → text
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))

    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""

    # If text extraction fails or returns minimal content, try OCR
    if not text.strip() or is_scanned_pdf(text):
        ocr_text = extract_text_with_ocr(contents)
        if ocr_text:
            text = preprocess_ocr_text(ocr_text)
        elif not text.strip():
            # Try OCR even if we have minimal text (might be scanned with headers)
            ocr_text = extract_text_with_ocr(contents)
            if ocr_text:
                text = preprocess_ocr_text(ocr_text)
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from PDF. Please upload a text-based resume or ensure the scanned document is clear."
                )

    parsed = extract_resume_data(text)

    profile = build_profile(parsed)

    return profile

@app.post("/match-job", response_model=JobMatchResponse)
def match_job(data: JobMatchRequest):
    # Validate inputs
    valid_cgpa = validate_cgpa(data.cgpa)
    valid_experience = validate_experience_years(data.experience_years)
    
    result = calculate_match(
        resume_skills=data.skills,
        job_description=data.job_description,
        experience_years=valid_experience,
        cgpa=valid_cgpa
    )

    return result

@app.post("/recommend-jobs", response_model=JobRankingResponse)
def recommend_jobs(data: JobRankingRequest):
    # Validate student profile
    student = data.student
    valid_cgpa = validate_cgpa(student.cgpa)
    valid_experience = validate_experience_years(student.experience_years)
    
    student_profile = {
        "skills": student.skills,
        "experience_years": valid_experience,
        "cgpa": valid_cgpa
    }

    ranked = rank_jobs_for_student(
        student_profile=student_profile,
        jobs=[job.dict() for job in data.jobs]
    )

    return {"jobs": ranked}

@app.post("/rank-candidates", response_model=CandidateRankingResponse)
def rank_candidates(data: CandidateRankingRequest):
    # Validate job description
    valid_cgpa = None
    
    ranked = rank_candidates_for_job(
        job=data.job.dict(),
        candidates=[c.dict() for c in data.candidates]
    )

    return {"candidates": ranked}
from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
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
from resume_parser.ocr_utils import OCR_AVAILABLE, OCR_ERROR, TESSERACT_CMD
from predictor import predict_student_placement
from pydantic import BaseModel
from typing import Optional, List
import sys

app = FastAPI(title="Recruitment ML Service")


class ResumeTextRequest(BaseModel):
    text: str


class PlacementPredictionRequest(BaseModel):
    cgpa: Optional[float] = None
    skills: List[str] = []
    projects: Optional[int] = 0
    internships: Optional[int] = 0
    experience_years: Optional[float] = None
    dsa_score: Optional[int] = None
    webdev_score: Optional[int] = None
    aptitude_score: Optional[int] = None
    comm_skills: Optional[int] = None
    CGPA: Optional[float] = None
    DSA_Score: Optional[int] = None
    WebDev_Score: Optional[int] = None
    Aptitude_Score: Optional[int] = None
    Comm_Skills: Optional[int] = None
    Internships: Optional[int] = None
    Projects: Optional[int] = None

@app.get("/ocr-status")
def get_ocr_status():
    """Check OCR availability and configuration"""
    return {
        "ocr_available": OCR_AVAILABLE,
        "error": OCR_ERROR,
        "tesseract_path": TESSERACT_CMD
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


@app.post("/parse-resume-text", response_model=ProfileData)
def parse_resume_text(payload: ResumeTextRequest):
    text = payload.text or ""

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text is empty. Please provide plain text content."
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
    print(f"DEBUG: Input Student Profile: {student_profile}")

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


@app.post("/predict-placement")
def predict_placement(payload: PlacementPredictionRequest):
    data = payload.dict(exclude_none=True)

    cgpa = data.get("cgpa") or data.get("CGPA") or 0
    internships = data.get("internships") or data.get("Internships") or 0
    projects = data.get("projects") or data.get("Projects") or 0
    skills = data.get("skills") or []
    if isinstance(skills, str):
        skills = [skills]
    experience_years = data.get("experience_years") or 0
    if not experience_years and isinstance(data.get("experience"), str):
        import re
        match = re.search(r"(\d+(\.\d+)?)", data.get("experience"))
        if match:
            experience_years = float(match.group(1))

    skills_lower = [s.lower() for s in skills if isinstance(s, str)]

    dsa_score = data.get("dsa_score") or data.get("DSA_Score")
    webdev_score = data.get("webdev_score") or data.get("WebDev_Score")
    aptitude_score = data.get("aptitude_score") or data.get("Aptitude_Score")
    comm_skills = data.get("comm_skills") or data.get("Comm_Skills")

    if dsa_score is None:
        dsa_score = 85 if any(k in skills_lower for k in ["dsa", "data structures", "algorithms"]) else 65
    if webdev_score is None:
        webdev_score = 85 if any(k in skills_lower for k in ["react", "node", "angular", "vue", "django", "flask", "fastapi"]) else 65
    if aptitude_score is None:
        aptitude_score = 70
    if comm_skills is None:
        comm_skills = 3

    # Slightly boost scores for real-world experience
    if experience_years and experience_years >= 1:
        dsa_score = min(100, dsa_score + 5)
        webdev_score = min(100, webdev_score + 5)

    prediction_input = {
        "CGPA": float(cgpa) if cgpa is not None else 0,
        "DSA_Score": int(dsa_score),
        "WebDev_Score": int(webdev_score),
        "Aptitude_Score": int(aptitude_score),
        "Comm_Skills": int(comm_skills),
        "Internships": int(internships),
        "Projects": int(projects),
    }

    prediction_result = predict_student_placement(prediction_input)

    probability = prediction_result.get("placement_probability")
    if isinstance(probability, (int, float)) and probability > 1:
        prediction_result["placement_percent"] = probability
        prediction_result["placement_probability"] = round(probability / 100, 4)

    return prediction_result


@app.post("/api/predict-placement")
def predict_placement_alias(payload: PlacementPredictionRequest):
    return predict_placement(payload)


@app.post("/predict")
def predict_alias(payload: PlacementPredictionRequest):
    return predict_placement(payload)


@app.websocket("/ws/proctor")
async def proctor_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        import base64
        import json
        import numpy as np
        import cv2
        from proctor_service.proctor_engine import analyze_frame

        while True:
            data = await websocket.receive_text()

            if "," in data:
                data = data.split(",")[1]

            img_bytes = base64.b64decode(data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is not None:
                result = analyze_frame(frame)
                await websocket.send_text(json.dumps(result))
            else:
                await websocket.send_text(json.dumps({"error": "Failed to decode frame"}))

    except WebSocketDisconnect:
        print("Client disconnected from proctoring session.")
    except Exception as e:
        print(f"Error: {e}")

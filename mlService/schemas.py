from pydantic import BaseModel
from typing import List, Optional


class EducationItem(BaseModel):
    raw_text: Optional[str]
    degree: Optional[str]
    institution: Optional[str]
    start_year: Optional[str]
    end_year: Optional[str]
    cgpa: Optional[float] = None


class ProfileData(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    skills: List[str]
    education: List[EducationItem]
    experience: List[str]
    experience_years: Optional[float]
    cgpa: Optional[float] = None

class JobMatchRequest(BaseModel):
    skills: list[str]
    job_description: str
    experience_years: float = 0
    cgpa: Optional[float] = None


class JobMatchResponse(BaseModel):
    match_score: float
    skill_score: float
    experience_score: float
    cgpa_score: float
    text_similarity: float
    matched_skills: list[str]
    missing_skills: list[str]
    recommendation: str

class Job(BaseModel):
    title: str
    description: str


class StudentProfile(BaseModel):
    skills: List[str]
    experience_years: float = 0
    cgpa: Optional[float] = None


class JobRankingRequest(BaseModel):
    student: StudentProfile
    jobs: List[Job]


class JobRankingItem(BaseModel):
    job_title: str
    match_score: float
    skill_score: float
    experience_score: float
    cgpa_score: float
    recommendation: str


class JobRankingResponse(BaseModel):
    jobs: List[JobRankingItem]


class Candidate(BaseModel):
    name: str
    skills: List[str]
    experience_years: float = 0
    cgpa: Optional[float] = None


class CandidateRankingRequest(BaseModel):
    job: Job
    candidates: List[Candidate]


class CandidateRankingItem(BaseModel):
    name: str
    match_score: float
    skill_score: float
    experience_score: float
    cgpa_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    recommendation: str


class CandidateRankingResponse(BaseModel):
    candidates: List[CandidateRankingItem]
from job_matching.matcher import calculate_match


# -------------------------------
# STUDENT → JOB RECOMMENDATION
# -------------------------------
def rank_jobs_for_student(student_profile, jobs):

    ranked_jobs = []

    for job in jobs:

        result = calculate_match(
            resume_skills=student_profile.skills or [],
            job_description=job.description or "",
            experience_years=student_profile.experience_years or 0,
            cgpa=student_profile.cgpa
        )

        ranked_jobs.append({
            "jobId": job.jobId,
            "job_title": job.title or "Unknown",
            "match_score": result["match_score"],
            "skill_score": result.get("skill_score", 0),
            "experience_score": result.get("experience_score", 0),
            "cgpa_score": result.get("cgpa_score", 0),
            "recommendation": result["recommendation"]
        })

    ranked_jobs.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return ranked_jobs


# -------------------------------
# RECRUITER → CANDIDATE RANKING
# -------------------------------
def rank_candidates_for_job(job, candidates):

    ranked_candidates = []

    for student in candidates:

        result = calculate_match(
            resume_skills=student.skills or [],
            job_description=job.description or "",
            experience_years=student.experience_years or 0,
            cgpa=student.cgpa
        )

        ranked_candidates.append({
            "studentId": student.studentId,
            "name": student.name or "Unknown",
            "match_score": result["match_score"],
            "skill_score": result.get("skill_score", 0),
            "experience_score": result.get("experience_score", 0),
            "cgpa_score": result.get("cgpa_score", 0),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "recommendation": result["recommendation"]
        })

    ranked_candidates.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return ranked_candidates

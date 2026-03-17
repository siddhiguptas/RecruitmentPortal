from job_matching.matcher import calculate_match


# -------------------------------
# STUDENT → JOB RECOMMENDATION
# -------------------------------
def rank_jobs_for_student(student_profile, jobs):

    ranked_jobs = []

    for job in jobs:

        result = calculate_match(
            resume_skills=student_profile.get("skills", []),
            job_description=job.get("description", ""),
            experience_years=student_profile.get("experience_years", 0),
            cgpa=student_profile.get("cgpa")
        )

        ranked_jobs.append({
            "jobId": job.get("jobId"),
            "job_title": job.get("title", "Unknown"),
            "match_score": result.get("match_score", 0),
            "skill_score": result.get("skill_score", 0),
            "experience_score": result.get("experience_score", 0),
            "cgpa_score": result.get("cgpa_score", 0),
            "recommendation": result.get("recommendation", "")
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
            resume_skills=student.get("skills", []),
            job_description=job.get("description", ""),
            experience_years=student.get("experience_years", 0),
            cgpa=student.get("cgpa")
        )

        ranked_candidates.append({
            "studentId": student.get("studentId"),
            "name": student.get("name", "Unknown"),
            "match_score": result.get("match_score", 0),
            "skill_score": result.get("skill_score", 0),
            "experience_score": result.get("experience_score", 0),
            "cgpa_score": result.get("cgpa_score", 0),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "recommendation": result.get("recommendation", "")
        })

    ranked_candidates.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return ranked_candidates

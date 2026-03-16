from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Comprehensive tech skills database
TECH_SKILLS = {
    # Programming Languages
    "python", "java", "c", "c++", "c#", "csharp", "javascript", "typescript",
    "go", "golang", "rust", "ruby", "php", "swift", "kotlin", "scala", "r",
    
    # Web Development
    "react", "reactjs", "vue", "vuejs", "angular", "node", "nodejs", "express",
    "nextjs", "next.js", "django", "flask", "fastapi", "spring", "asp.net",
    "html", "css", "tailwind", "bootstrap", "sass", "less",
    
    # Databases
    "mongodb", "mysql", "postgresql", "redis", "elasticsearch", "sql",
    "dbms", "oracle", "firebase", "dynamodb", "cassandra",
    
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "jenkins", "terraform", "ansible", "ci/cd", "devops", "linux",
    
    # AI/ML & Data Science
    "machine learning", "deep learning", "neural network", "nlp", 
    "natural language processing", "computer vision", "tensorflow", "pytorch",
    "keras", "pandas", "numpy", "scipy", "matplotlib", "seaborn",
    "data science", "data analysis", "data engineering", "etl",
    "tableau", "powerbi", "hadoop", "spark", "hive",
    
    # Mobile
    "android", "ios", "react native", "flutter", "xamarin",
    
    # Tools & Platforms
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "rest api", "graphql", "grpc", "microservices", "api",
    
    # Concepts
    "data structures", "algorithms", "dsa", "oops", "object oriented",
    "system design", "design patterns", "agile", "scrum", "waterfall",
    "testing", "unit testing", "integration testing", "selenium",
    "cybersecurity", "security", "blockchain", "iot"
}


def extract_job_skills(job_description):
    """
    Extract skills from job description using comprehensive keyword matching.
    Also handles skill variations and synonyms.
    """
    text_lower = job_description.lower()
    words = set(text_lower.split())
    
    # Extract single-word skills
    found_skills = [w for w in words if w in TECH_SKILLS]
    
    # Extract multi-word skills
    multi_word_skills = [
        "machine learning", "deep learning", "natural language processing",
        "computer vision", "data science", "data analysis", "data engineering",
        "object oriented", "system design", "rest api", "google cloud",
        "unit testing", "integration testing", "react native"
    ]
    
    for skill in multi_word_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return list(set(found_skills))


def calculate_cgpa_score(cgpa: float) -> float:
    """
    Calculate CGPA score (0-1 scale).
    Assumes CGPA is on a 10-point scale.
    """
    if cgpa is None:
        return 0.0
        
    try:
        cgpa_val = float(cgpa)
    except (ValueError, TypeError):
        return 0.0

    # If CGPA is on a 100-point scale or percentage, convert it to 10-point scale
    if cgpa_val > 10.0:
        cgpa_val = cgpa_val / 10.0
        if cgpa_val > 10.0: # e.g., if it was 1000
            cgpa_val = 10.0
    
    # Convert 10-point scale to 0-1 score
    # 10 = 1.0, 7 = 0.7, 5 = 0.5, below 5 = 0
    if cgpa_val >= 9:
        return 1.0
    elif cgpa >= 8:
        return 0.9
    elif cgpa >= 7:
        return 0.8
    elif cgpa >= 6:
        return 0.6
    elif cgpa >= 5:
        return 0.4
    else:
        return 0.2


def calculate_match(resume_skills, job_description, experience_years=0, cgpa=None):

    # Flatten and securely parse the resume_skills which might contain comma-separated strings like ["React, Node, Mongo"]
    flattened_resume_skills = []
    for s in (resume_skills or []):
        flattened_resume_skills.extend([skill.strip() for skill in str(s).lower().split(",")])

    resume_skills = set(flattened_resume_skills)
    job_skills = set(extract_job_skills(str(job_description or "")))

    # Convert experience to a float safely
    try:
        exp_val = float(experience_years)
    except (ValueError, TypeError):
        exp_val = 0.0

    # ---------- SKILL SCORE (MAIN SIGNAL) ----------
    # Improved check: Check if resume skill is a substring of job skill or vice-versa
    matched_skills = []
    for j_skill in job_skills:
        for r_skill in resume_skills:
            if j_skill in r_skill or r_skill in j_skill:
                matched_skills.append(j_skill)
                break
    
    matched_skills = list(set(matched_skills))

    if len(job_skills) == 0:
        skill_score = 0
    else:
        skill_score = len(matched_skills) / len(job_skills)

    missing_skills = list(job_skills - resume_skills)

    # ---------- TEXT SIMILARITY (SECONDARY) ----------
    resume_text = " ".join(resume_skills)
    job_text = str(job_description or "").lower()
    
    if not resume_text.strip() or not job_text.strip():
        text_similarity = 0.0
    else:
        try:
            docs = [resume_text, job_text]
            vectorizer = TfidfVectorizer(stop_words="english")
            tfidf = vectorizer.fit_transform(docs)

            text_similarity = cosine_similarity(
                tfidf[0:1],
                tfidf[1:2]
            )[0][0]
        except ValueError: # Catch empty vocabulary error
            text_similarity = 0.0

    # ---------- EXPERIENCE SCORE ----------
    if exp_val >= 3:
        experience_score = 1.0
    elif exp_val >= 1:
        experience_score = 0.7
    elif exp_val > 0:
        experience_score = 0.4
    else:
        experience_score = 0.2

    # ---------- CGPA SCORE ----------
    cgpa_score = calculate_cgpa_score(cgpa)

    # ---------- FINAL WEIGHTED SCORE ----------
    final_score = (
        0.5 * skill_score +
        0.2 * text_similarity +
        0.15 * experience_score +
        0.15 * cgpa_score
    )

    # ---------- LABEL ----------
    if final_score > 0.7:
        recommendation = "Strong Match - Highly Recommended"
    elif final_score > 0.55:
        recommendation = "Good Match - Recommended"
    elif final_score > 0.4:
        recommendation = "Moderate Match"
    else:
        recommendation = "Low Match - Consider Other Options"

    return {
        "match_score": round(final_score, 3),
        "skill_score": round(skill_score, 3),
        "experience_score": round(experience_score, 3),
        "cgpa_score": round(cgpa_score, 3),
        "text_similarity": round(text_similarity, 3),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendation": recommendation
    }
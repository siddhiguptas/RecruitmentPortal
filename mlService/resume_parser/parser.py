import spacy
import re
from utils import extract_cgpa, normalize_skills
from utils import extract_cgpa, normalize_skills

# Load spaCy NLP model (loads once when server starts)
nlp = spacy.load("en_core_web_sm")

# -------- Skill Database --------
SKILLS_DB = [
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
]


def extract_resume_data(text: str):
    """
    Extract structured information from resume text.
    Hybrid approach:
    - Rule-based extraction (name/email/phone/skills)
    - Line-based extraction (education/experience)
    """

    # ---------- Clean Raw Text ----------
    text = text.replace("\xa0", " ")
    text = text.replace("♂", "")
    text = text.strip()

    doc = nlp(text)

    # ---------- NAME EXTRACTION ----------
    # Usually first meaningful line is name
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    name =None
    

    if lines:
        header = lines[0]

        # split on common separators used in resumes
        parts = re.split(r"[·|\-|,]", header)

        if parts:
            name = parts[0].strip()

    # ---------- EMAIL EXTRACTION ----------
   
    email_match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    email = email_match.group(0) if email_match else None

    # Remove common PDF prefix noise
    if email:
        # remove leading non-letter characters
        email = re.sub(r"^[^a-zA-Z]+", "", email)

        # fix common icon artifacts like 'pe' prefix
        if email.startswith("pe") and "@" in email:
            email = email[2:]
    # ---------- PHONE EXTRACTION ----------
    phone_match = re.search(
        r"\+?\d[\d\s\-]{8,}\d",
        text
    )
    phone = phone_match.group(0) if phone_match else None

    # ---------- SKILL EXTRACTION ----------
    text_lower = text.lower()
    skills = []

    for skill in SKILLS_DB:
        if skill in text_lower:
            skills.append(skill)

    # Normalize skills and remove duplicates
    skills = normalize_skills(skills)

    # ---------- EDUCATION EXTRACTION ----------
    education_keywords = [
        "bachelor", "b.tech", "btech",
        "master", "degree",
        "university", "college",
        "cgpa", "intermediate"
    ]

    education = []

    for line in text.split("\n"):
        clean_line = line.strip()
        if any(word in clean_line.lower() for word in education_keywords):
            if len(clean_line) > 15:
                education.append(clean_line)

    # Remove duplicates
    education = list(set(education))

    # ---------- EXPERIENCE EXTRACTION ----------
    experience_keywords = [
        "intern", "project", "hackathon",
        "experience", "developer",
        "mentor", "built", "implemented"
    ]

    experience = []

    for line in text.split("\n"):
        clean_line = line.strip()
        if any(word in clean_line.lower() for word in experience_keywords):
            if len(clean_line) > 25:
                experience.append(clean_line)

    experience = list(set(experience))

    # ---------- CGPA EXTRACTION ----------
    cgpa = extract_cgpa(text)

    # ---------- FINAL STRUCTURED OUTPUT ----------
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "education": education,
        "experience": experience,
        "cgpa": cgpa
    }
"""
Shared utilities for the ML Service
Contains common functions used across multiple modules
"""
import re
from typing import List, Optional


# ============================================================================
# CGPA EXTRACTION
# ============================================================================

def extract_cgpa(text: str) -> Optional[float]:
    """
    Extract CGPA from text.
    Looks for patterns like:
    - CGPA: 8.5
    - CGPA: 8.5/10
    - GPA: 8.5
    - 8.5 CGPA
    - Overall CGPA: 8.9
    
    Args:
        text: Text to search for CGPA
        
    Returns:
        CGPA value as float, or None if not found
    """
    cgpa_values = []
    
    # Pattern 1: CGPA or GPA followed by colon/slash and number
    cgpa_pattern1 = re.findall(
        r"(?:cgpa|gpa|overall\s+cgpa)\s*[:/]\s*(\d+\.?\d*)",
        text.lower()
    )
    
    # Pattern 2: Number followed by CGPA/GPA (e.g., "8.5 CGPA")
    cgpa_pattern2 = re.findall(
        r"(\d+\.?\d*)\s*(?:/10)?\s*(?:cgpa|gpa)",
        text.lower()
    )
    
    # Pattern 3: Number with /10 scale explicitly (e.g., "8.5/10")
    cgpa_pattern3 = re.findall(
        r"(\d+\.?\d*)\s*/\s*10",
        text
    )
    
    all_cgpa_values = cgpa_pattern1 + cgpa_pattern2 + cgpa_pattern3
    
    # Filter valid CGPA values (typically between 0 and 10)
    for val in all_cgpa_values:
        try:
            cgpa_float = float(val)
            if 0 <= cgpa_float <= 10:
                cgpa_values.append(cgpa_float)
        except ValueError:
            continue
    
    # Return highest CGPA if multiple found, else None
    if cgpa_values:
        return max(cgpa_values)
    return None


# ============================================================================
# SKILLS NORMALIZATION
# ============================================================================

# Skill alias mapping - maps variations to canonical forms
SKILL_ALIASES = {
    # JavaScript frameworks
    "reactjs": "react",
    "react.js": "react",
    "vuejs": "vue",
    "vue.js": "vue",
    "angularjs": "angular",
    "angular.js": "angular",
    
    # Node.js
    "nodejs": "node",
    "node.js": "node",
    
    # Python frameworks
    "django": "django",
    "flask": "flask",
    "fastapi": "fastapi",
    
    # Java
    "springboot": "spring",
    "spring boot": "spring",
    "springboot": "spring",
    
    # .NET
    "asp.net": "asp.net",
    "aspnet": "asp.net",
    "csharp": "c#",
    
    # Cloud
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "aws": "aws",
    "azure": "azure",
    
    # Mobile
    "react native": "react native",
    "flutter": "flutter",
    
    # Data Science
    "machine learning": "machine learning",
    "ml": "machine learning",
    "deep learning": "deep learning",
    "dl": "deep learning",
    "nlp": "nlp",
    "natural language processing": "nlp",
    "computer vision": "computer vision",
    "cv": "computer vision",
    
    # DevOps
    "k8s": "kubernetes",
    "ci cd": "ci/cd",
    "cicd": "ci/cd",
    
    # Database
    "postgresql": "postgresql",
    "postgres": "postgresql",
    "mongodb": "mongodb",
    "mongo": "mongodb",
    "mysql": "mysql",
    
    # General
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "python": "python",
    "py": "python",
    "java": "java",
    "c++": "c++",
    "cpp": "c++",
    "dsa": "data structures",
    "oops": "object oriented",
}


def normalize_skill(skill: str) -> str:
    """
    Normalize a skill name to its canonical form.
    
    Args:
        skill: Raw skill name (e.g., "reactjs", "ReactJS")
        
    Returns:
        Normalized skill name
    """
    # Lowercase and strip whitespace
    normalized = skill.lower().strip()
    
    # Check if it's in our alias map
    if normalized in SKILL_ALIASES:
        return SKILL_ALIASES[normalized]
    
    return normalized


def normalize_skills(skills: List[str]) -> List[str]:
    """
    Normalize a list of skills and remove duplicates.
    
    Args:
        skills: List of raw skill names
        
    Returns:
        List of normalized unique skills
    """
    normalized_set = set()
    
    for skill in skills:
        if skill:  # Skip empty strings
            normalized = normalize_skill(skill)
            if normalized:
                normalized_set.add(normalized)
    
    return sorted(list(normalized_set))


# ============================================================================
# INPUT VALIDATION
# ============================================================================

def validate_cgpa(cgpa: Optional[float]) -> Optional[float]:
    """
    Validate and normalize CGPA value.
    
    Args:
        cgpa: CGPA value to validate
        
    Returns:
        Validated CGPA or None
    """
    if cgpa is None:
        return None
    
    # Ensure it's a number
    try:
        cgpa = float(cgpa)
    except (TypeError, ValueError):
        return None
    
    # Return None for invalid range, otherwise return normalized value
    if cgpa < 0 or cgpa > 10:
        return None
    
    return round(cgpa, 2)


def validate_experience_years(years: Optional[float]) -> float:
    """
    Validate and normalize experience years.
    
    Args:
        years: Experience in years
        
    Returns:
        Validated experience (0 if invalid or negative)
    """
    if years is None:
        return 0.0
    
    try:
        years = float(years)
    except (TypeError, ValueError):
        return 0.0
    
    # Return 0 for negative values
    if years < 0:
        return 0.0
    
    return round(years, 1)


def validate_email(email: Optional[str]) -> Optional[str]:
    """
    Validate email format.
    
    Args:
        email: Email string
        
    Returns:
        Validated email or None
    """
    if not email:
        return None
    
    # Basic email regex
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if re.match(email_pattern, email.strip()):
        return email.strip()
    
    return None


def validate_phone(phone: Optional[str]) -> Optional[str]:
    """
    Validate phone number format.
    
    Args:
        phone: Phone number string
        
    Returns:
        Validated phone or None
    """
    if not phone:
        return None
    
    # Remove common formatting characters
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Check if it contains only valid characters and has reasonable length
    if re.match(r'^\+?\d{8,15}$', cleaned):
        return cleaned
    
    return None

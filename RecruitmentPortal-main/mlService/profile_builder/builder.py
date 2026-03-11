import re
from datetime import datetime
from utils import extract_cgpa as utils_extract_cgpa

def calculate_experience_years(experience_list):

    total_months = 0
    current_year = datetime.now().year

    for exp in experience_list:

        match = re.search(r'(\d{4}).*(\d{4}|present|now)', exp.lower())

        if match:
            start = int(match.group(1))

            if match.group(2) in ["present", "now"]:
                end = current_year
            else:
                end = int(match.group(2))

            total_months += (end - start) * 12

    return round(total_months / 12, 1)

def build_profile(parsed_data):
    profile = {}

    # ---------- BASIC INFO ----------
    profile["name"] = parsed_data.get("name")
    profile["email"] = parsed_data.get("email")
    profile["phone"] = parsed_data.get("phone")
    profile["skills"] = parsed_data.get("skills", [])
    profile["experience_years"] = calculate_experience_years(
        parsed_data.get("experience", [])
    )

    # ---------- EDUCATION STRUCTURING ----------
    structured_education = []

    for edu in parsed_data.get("education", []):

        # Fix merged words from PDF
        edu = re.sub(r"([a-z])([A-Z])", r"\1 \2", edu)

        # -------- YEARS --------
        year_match = re.search(r"(\d{4}).*(\d{4})", edu)
        start_year = year_match.group(1) if year_match else None
        end_year = year_match.group(2) if year_match else None

        # -------- DEGREE --------
        degree_match = re.search(
            r"(Bachelor[^,]*|Master[^,]*|B\.Tech[^,]*|M\.Tech[^,]*)",
            edu,
            re.IGNORECASE
        )
        degree = degree_match.group(0) if degree_match else None

        # -------- INSTITUTION --------
        institution_match = re.search(
            r"(University|College|Institute)[^,]*",
            edu,
            re.IGNORECASE
        )

        institution = institution_match.group(0) if institution_match else None

        # -------- CGPA --------
        cgpa = utils_extract_cgpa(edu)

        structured_education.append({
            "raw_text": edu,
            "degree": degree,
            "institution": institution,
            "start_year": start_year,
            "end_year": end_year,
            "cgpa": cgpa
        })

    profile["education"] = structured_education

    # ---------- EXPERIENCE ----------
    profile["experience"] = parsed_data.get("experience", [])

    # ---------- CGPA ----------
    # Get CGPA from parsed_data (extracted by parser.py) or from education
    profile["cgpa"] = parsed_data.get("cgpa")
    
    # If not in parsed_data, try to extract from education
    if not profile["cgpa"]:
        for edu in parsed_data.get("education", []):
            extracted_cgpa = utils_extract_cgpa(edu)
            if extracted_cgpa:
                profile["cgpa"] = extracted_cgpa
                break

    return profile
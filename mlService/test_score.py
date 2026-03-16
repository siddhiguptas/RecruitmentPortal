import sys
from job_matching.matcher import calculate_match

# Data extracted straight from the student's MongoDB profile via check_profiles.ts
student_skills = ["algorithms", "api", "c", "c++", "computer vision", "css", "data structures", "git", "github", "go", "html", "java", "javascript", "linux", "machine learning", "matplotlib", "node", "numpy", "pandas", "python", "r", "scala", "sql"]
job_description = "We are seeking a talented Python developer with experience in machine learning and data structures, and who is proficient with pandas, numpy, and git."
cgpa = 9.85
exp = 0

score = calculate_match(student_skills, job_description, exp, cgpa)
print("FINAL ML ENGINE SCORE:")
print(score)

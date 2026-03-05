import re

def extract_skills(text: str) -> list:
    """
    Extracts predefined skills from the resume text.
    Uses an expanded list to better demonstrate the skill gap feature.
    """
    predefined_skills = [
        "python", "java", "react", "sql", "mongodb", "aws", "html", "css",
        "machine learning", "javascript", "spark", "hadoop", "tableau",
        "docker", "kubernetes", "c++", "ui/ux", "project management",
        "node.js", "express", "ruby", "django", "flask", "tensorflow", "pytorch"
    ]
    extracted_skills = set()
    
    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()
    
    for skill in predefined_skills:
        # Check if skill exists as an exact word in the text using regex
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            # Format nicely for the output
            upper_skills = ["sql", "aws", "html", "css", "ui/ux"]
            title_skill = skill.upper() if skill in upper_skills else skill.title()
            extracted_skills.add(title_skill)
            
    return list(extracted_skills)

def analyze_skill_gap(resume_text: str, job_description: str) -> dict:
    """
    Solves the Research Gap: Actionable Feedback.
    Compares resume skills against job requirements.
    """
    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_description))
    
    missing_skills = job_skills - resume_skills
    match_percentage = (len(resume_skills.intersection(job_skills)) / len(job_skills)) * 100 if job_skills else 0
    
    return {
        "matched": list(resume_skills.intersection(job_skills)),
        "missing": list(missing_skills),
        "match_score": round(match_percentage, 2)
    }

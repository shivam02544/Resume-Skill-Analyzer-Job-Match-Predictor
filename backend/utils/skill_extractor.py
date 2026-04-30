import re
import json
import os

# Load skills dictionary from JSON
def load_skills_data():
    try:
        dict_path = os.path.join(os.path.dirname(__file__), "skills_dictionary.json")
        with open(dict_path, "r") as f:
            return json.load(f)
    except Exception:
        return {"skills": [], "categories": []}

SKILLS_DATA = load_skills_data()

def extract_skills(text: str) -> list:
    """
    Extracts skills using synonym-aware matching from the JSON dictionary.
    """
    text_lower = text.lower()
    extracted_skills = set()
    
    for skill_info in SKILLS_DATA.get("skills", []):
        name = skill_info["name"]
        synonyms = skill_info.get("synonyms", [name.lower()])
        
        for synonym in synonyms:
            if re.search(r'\b' + re.escape(synonym.lower()) + r'\b', text_lower):
                extracted_skills.add(name)
                break
                
    return list(extracted_skills)

def extract_experience(text: str) -> float:
    """
    Extracts total years of experience using regex patterns.
    """
    # Patterns like "5 years", "3.5 years", "10+ years"
    exp_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\b',
        r'(\d+(?:\.\d+)?)\+\s*(?:years?|yrs?)\b'
    ]
    
    total_exp = 0.0
    for pattern in exp_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            total_exp = max(total_exp, float(match))
            
    return total_exp

def analyze_skill_gap(resume_text: str, job_description: str) -> dict:
    """
    Compares resume skills against job requirements and provides categories/resources.
    """
    resume_skills = set(extract_skills(resume_text))
    
    # Extract job skills from JD
    job_skills_data = []
    text_lower = job_description.lower()
    for skill_info in SKILLS_DATA.get("skills", []):
        name = skill_info["name"]
        synonyms = skill_info.get("synonyms", [name.lower()])
        for synonym in synonyms:
            if re.search(r'\b' + re.escape(synonym.lower()) + r'\b', text_lower):
                job_skills_data.append(skill_info)
                break
    
    job_skill_names = {s["name"] for s in job_skills_data}
    matched_skills = resume_skills.intersection(job_skill_names)
    missing_skills_data = [s for s in job_skills_data if s["name"] not in resume_skills]
    
    match_percentage = (len(matched_skills) / len(job_skill_names)) * 100 if job_skill_names else 0
    
    # Calculate category scores for radar chart
    categories = SKILLS_DATA.get("categories", [])
    cat_scores = {cat: 0 for cat in categories}
    cat_counts = {cat: 0 for cat in categories}
    
    for s in SKILLS_DATA["skills"]:
        cat = s.get("category", "Other")
        if cat in cat_counts:
            cat_counts[cat] += 1
            if s["name"] in resume_skills:
                cat_scores[cat] += 1
                
    radar_data = [
        {"subject": cat, "value": (cat_scores[cat] / cat_counts[cat] * 100) if cat_counts[cat] > 0 else 0}
        for cat in categories
    ]
    
    return {
        "matched": list(matched_skills),
        "missing": [s["name"] for s in missing_skills_data],
        "resources": {s["name"]: s.get("resource_url", "#") for s in missing_skills_data},
        "match_score": round(match_percentage, 2),
        "radar_data": radar_data
    }

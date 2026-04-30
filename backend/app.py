import os
import io
import logging
import pickle
import pymongo
from traceback import format_exc
from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from datetime import datetime
import numpy as np

# Import customized utility scripts
from utils.preprocessing import clean_resume_text
from utils.skill_extractor import extract_skills, analyze_skill_gap, extract_experience

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask App
app = Flask(__name__)
# Enable CORS for frontend requests
CORS(app)

# MongoDB Configuration using standard pymongo wrapper
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

def get_db_connection():
    """ Establish and return MongoDB connection """
    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info() # Trigger connection check
        db = client["resume_db"]
        return db["resumes"]
    except Exception as e:
        logger.error(f"MongoDB Connection Failure: {e}")
        return None

resumes_collection = get_db_connection()

# Define global variables for models
model = None
tfidf = None
label_encoder = None

def load_models():
    """ 
    Module to load the trained Naive Bayes model, TF-IDF vectorizer, 
    and Label Encoder from the local filesystem. 
    """
    global model, tfidf, label_encoder
    try:
        with open("model/resume_model.pkl", "rb") as f:
            model = pickle.load(f)
        with open("model/tfidf.pkl", "rb") as f:
            tfidf = pickle.load(f)
        with open("model/label_encoder.pkl", "rb") as f:
            label_encoder = pickle.load(f)
        logger.info("Successfully loaded ML models from disk.")
    except Exception as e:
        logger.error(f"Error loading models (Did you run train.py?): {e}")

# Call load_models at initialization
load_models()

def extract_text_from_pdf(file_stream) -> str:
    """ 
    Service function: Reads PDF text from an uploaded file stream using PyPDF2.
    
    Args:
        file_stream: BytesIO stream of the PDF file.
        
    Returns:
        str: Extracted text from the PDF pages.
    """
    try:
        reader = PdfReader(file_stream)
        text = " ".join([page.extract_text() or "" for page in reader.pages])
        return text.strip()
    except Exception as e:
        logger.error(f"PDF Extraction Error: {e}")
        return ""

def process_resume_prediction(resume_text):
    """
    Service function: Handles NLP preprocessing and model prediction logic.
    """
    cleaned_text = clean_resume_text(resume_text)
    features = tfidf.transform([cleaned_text]).toarray()
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = float(max(probabilities))
    predicted_category = label_encoder.inverse_transform([prediction])[0]
    skills = extract_skills(resume_text)
    experience = extract_experience(resume_text)
    
    # Get top 3 predicted categories for alternative options
    top_indices = np.argsort(probabilities)[-3:][::-1]
    top_roles = [
        {
            "role": label_encoder.inverse_transform([idx])[0],
            "confidence": float(probabilities[idx])
        }
        for idx in top_indices
    ]
    
    return predicted_category, confidence, skills, top_roles, experience

@app.route("/predict", methods=["POST"])
def predict_job_role():
    """ 
    API Controller: Handle resume uploads, extract text, predict job role, 
    and save data to MongoDB.
    """
    if "file" not in request.files:
        logger.warning("Upload failed: No file uploaded.")
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files["file"]
    name = request.form.get("name", file.filename)
    job_description = request.form.get("job_description", "")
    
    if file.filename == "":
        logger.warning("Upload failed: Empty filename provided.")
        return jsonify({"error": "Empty filename provided"}), 400
    
    if model is None or tfidf is None:
        logger.error("Prediction failed: Model not loaded securely.")
        return jsonify({"error": "ML Model is not loaded. Please contact admin."}), 500
        
    try:
        # File parsing
        if file.filename.lower().endswith(".pdf"):
            resume_text = extract_text_from_pdf(io.BytesIO(file.read()))
        elif file.filename.lower().endswith(".txt"):
            resume_text = file.read().decode("utf-8", errors="ignore")
        else:
            return jsonify({"error": "Unsupported file format. Please upload PDF or TXT"}), 400
            
        if not resume_text:
            logger.warning("Upload failed: Could not extract text from file.")
            return jsonify({"error": "Could not extract text from file"}), 400

        logger.info(f"Successfully digested resume text for {name}. Running prediction...")
        
        # Machine learning inference
        predicted_category, confidence, skills, top_roles, experience = process_resume_prediction(resume_text)
        
        logger.info(f"Prediction Success: {name} -> {predicted_category} ({confidence:.2f})")
        
        # Skill Gap Analysis
        gap_analysis = None
        if job_description:
            gap_analysis = analyze_skill_gap(resume_text, job_description)
        
        # Save record to MongoDB Database
        if resumes_collection is not None:
            record = {
                "name": name,
                "skills": skills,
                "experience": experience,
                "job_role": predicted_category,
                "confidence": confidence,
                "top_roles": top_roles,
                "gap_analysis": gap_analysis,
                "timestamp": datetime.utcnow()
            }
            resumes_collection.insert_one(record)
            logger.info("Successfully saved record to MongoDB.")
        else:
            logger.warning("MongoDB not active. Skipping DB insert step.")
        
        # Format API Response
        response_data = {
            "job_role": predicted_category,
            "skills": skills,
            "experience": f"{experience} Years" if experience > 0 else "Not Found",
            "confidence": f"{confidence * 100:.2f}%",
            "top_roles": top_roles
        }
        
        if gap_analysis:
            response_data["gap_analysis"] = gap_analysis

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Internal Server Error: {format_exc()}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@app.route("/history", methods=["GET"])
def get_history():
    """ 
    API Controller: Retrieve all earlier predictions safely stored within MongoDB 
    """
    if resumes_collection is None:
        return jsonify({"error": "Database connection offline"}), 503
        
    try:
        records = resumes_collection.find().sort("timestamp", -1)
        history = []
        
        for record in records:
            conf_val = record.get('confidence', 0)
            formatted_confidence = f"{conf_val * 100:.2f}%" if isinstance(conf_val, float) else "0%"
            
            history.append({
                "id": str(record["_id"]),
                "name": record.get("name", "Unknown"),
                "job_role": record.get("job_role", ""),
                "skills": record.get("skills", []),
                "confidence": formatted_confidence,
                "timestamp": record.get("timestamp", "").isoformat() if hasattr(record.get("timestamp", ""), "isoformat") else record.get("timestamp", "")
            })
            
        return jsonify(history), 200

    except Exception as e:
        logger.error(f"Failed to fetch history: {format_exc()}")
        return jsonify({"error": f"Failed to fetch history: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

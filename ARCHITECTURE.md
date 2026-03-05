# Resume Skill Analyzer - Architecture Overview

This document outlines how the application works, from uploading a resume to getting an AI prediction.

## 1. Frontend (Next.js)

The user interface where applicants upload their resumes.

- **Upload Form (`app/page.js`)**: Users can upload `.pdf` or `.txt` resumes, and enter their name and a job description.
- **Results View (`app/page.js`)**: Displays the AI's predicted job role, match confidence, and extracted skills. If a job description was provided, it also shows a skill gap analysis (matched vs. missing skills).
- **History Page (`app/history/page.js`)**: A simple table view showing previously analyzed resumes, fetched directly from the database.

## 2. API Backend (Flask)

The central server that receives requests from the frontend and processes them.

- **`POST /predict` (`backend/app.py`)**:
  - Receives the uploaded resume file.
  - Extracts raw text using PyPDF2 (if PDF).
  - Passes the text to the Machine Learning model.
  - Returns the predicted role, confidence score, and extracted skills.
  - Calculates the skill gap if a job description is provided.
  - Saves the record to MongoDB.
- **`GET /history` (`backend/app.py`)**:
  - Retrieves all past analysis records from MongoDB and sends them to the History page.

## 3. Machine Learning Model

The intelligence engine that classifies the resume.

Random Forest Classifier algorithm.

- **Text Processing**: The resume text is cleaned (removing special characters, converting to lowercase) and tokenized using NLTK.
- **Feature Extraction (TF-IDF)**: The cleaned text is converted into numerical vectors using a pre-trained TF-IDF Vectorizer (`tfidf_vectorizer.pkl`).
- **Prediction (Random Forest)**: A Random Forest Classifier (`random_forest_model.pkl`) trained on a dataset of known resumes takes the TF-IDF vectors and predicts the most likely job category.
- **Skill Extraction**: A custom script scans the resume against a predefined dictionary of tech skills (e.g., Python, React, SQL) to identify present skills.

## 4. Database (MongoDB)

The permanent storage for the application.

- **Database Name**: `resume_analyzer`
- **Collection**: `predictions`
- **Stored Data**: Every time a resume is analyzed, we store the applicant's name, predicted role, confidence score, extracted skills, and a timestamp.

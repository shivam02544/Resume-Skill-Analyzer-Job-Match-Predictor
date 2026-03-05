import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import pickle
import os

from utils.preprocessing import clean_resume_text
from utils.skill_extractor import extract_skills, analyze_skill_gap

def train_model():
    print("Loading dataset...")
    df = pd.read_csv('dataset/resume.csv')
    
    # Drop rows with missing text or labels to prevent errors
    df = df.dropna(subset=['Resume', 'Category'])
    
    print("Cleaning resume text...")
    df['cleaned_resume'] = df['Resume'].apply(clean_resume_text)
    
    label_encoder = LabelEncoder()
    df['Category_Encoded'] = label_encoder.fit_transform(df['Category'])
    
    # You can tune max_features depending on your requirement
    tfidf = TfidfVectorizer(max_features=1500)
    X = tfidf.fit_transform(df['cleaned_resume']).toarray()
    y = df['Category_Encoded'].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Naive Bayes Model...")
    model = MultinomialNB()
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained successfully! Accuracy: {accuracy * 100:.2f}%")
    
    # Save the models
    os.makedirs('model', exist_ok=True)
    with open('model/resume_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('model/tfidf.pkl', 'wb') as f:
        pickle.dump(tfidf, f)
    with open('model/label_encoder.pkl', 'wb') as f:
        pickle.dump(label_encoder, f)
    print("Models saved in 'model/' directory.")

def train_and_test_with_gap_analysis():
    # Call the training function first
    train_model()
    
    # Sample Test for your Research Gap Documentation
    sample_resume = "Data Scientist experienced in Python, SQL, and Machine Learning."
    sample_jd = "Required: Python, SQL, Machine Learning, AWS, and Spark."
    
    print("\n--- Solving Research Gap: Skill-Gap Analysis ---")
    analysis = analyze_skill_gap(sample_resume, sample_jd)
    
    print(f"Match Score: {analysis['match_score']}%")
    print(f"Skills Found: {analysis['matched']}")
    print(f"Actionable Feedback (Missing Skills): {analysis['missing']}")

if __name__ == '__main__':
    train_and_test_with_gap_analysis()
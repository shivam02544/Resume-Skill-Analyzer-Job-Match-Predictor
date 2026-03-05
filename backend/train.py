import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from imblearn.over_sampling import SMOTE
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
    
    # Filter out categories that only have 1 sample, as they break splitting and SMOTE
    counts = df['Category'].value_counts()
    valid_categories = counts[counts >= 2].index
    df = df[df['Category'].isin(valid_categories)]
    
    print("Cleaning resume text...")
    df['cleaned_resume'] = df['Resume'].apply(clean_resume_text)
    
    label_encoder = LabelEncoder()
    df['Category_Encoded'] = label_encoder.fit_transform(df['Category'])
    
    # Enhance feature extraction: use bigrams, filter very common/rare words
    tfidf = TfidfVectorizer(max_features=3000, ngram_range=(1, 2), max_df=0.95, min_df=2)
    X = tfidf.fit_transform(df['cleaned_resume']).toarray()
    y = df['Category_Encoded'].values
    
    print("Applying SMOTE to balance dataset...")
    # There are very few samples for some classes (like 2), so k_neighbors must be smaller than the smallest class size
    smote = SMOTE(sampling_strategy='auto', k_neighbors=1, random_state=42)
    X_sm, y_sm = smote.fit_resample(X, y)
    
    X_train, X_test, y_train, y_test = train_test_split(X_sm, y_sm, test_size=0.2, random_state=42)
    
    print("Training LinearSVC Model on balanced data...")
    model = LinearSVC(random_state=42, dual=False)
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
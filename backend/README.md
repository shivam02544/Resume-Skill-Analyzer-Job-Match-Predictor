# ML Model Training Code Data & Algorithm

## Overview

This repository contains the backend codebase for training our Resume Screening machine learning model. The main script responsible for training the model and extracting actionable skill-gap feedback is `train.py`.

## Data

- **Source:** The model is trained on the dataset located at `dataset/resume.csv`.
- **Preprocessing:**
  Before training, the resume text undergoes rigorous preprocessing using our custom function `clean_resume_text` via `utils/preprocessing.py`. This steps involves:
  - Converting the text fully to lowercase.
  - Removing URLs, hashtags, mentions (@), "RT" and "cc".
  - Removing extra punctuation and non-ASCII characters.
  - Filtering out English stopwords using NLTK (`nltk.corpus.stopwords`).
  - Eliminating excessive whitespaces and numeric digits.

## Algorithm

- **Classifier:** The classification algorithm we are utilizing is **Naive Bayes** (specifically `MultinomialNB` from `scikit-learn`).
  - Naive Bayes works exceptionally well on document classification tasks, such as determining a candidate's job category based on textual resume data.
- **Vectorization:** To translate our `cleaned_resume` text into numerical features the algorithm can ingest, we utilize `TfidfVectorizer` (Term Frequency-Inverse Document Frequency) restricted to a maximum of `1500` features (`max_features=1500`).
- **Labels:** We encode our categorical job categories into standard numeric variables using Scikit-Learn's `LabelEncoder`.

## Evaluation & Accuracy

- **Data Split:** The dataset is split into `80%` training data and `20%` testing data (`test_size=0.2`) using a seeded random state (`random_state=42`) for reproducibility.
- **Model Evaluation Metric:** The evaluation metric used is straightforward `accuracy_score`.
- **Current Accuracy:** The model is currently achieving an accuracy of **65.91%** on our testing split.

## Models Export

Upon successful training, the script serializes three crucial models into the `model/` directory for deployment usage later (i.e. to be utilized by `app.py`):

1. `resume_model.pkl` - The trained Naive Bayes Classifier.
2. `tfidf.pkl` - The fitted TF-IDF Vectorizer.
3. `label_encoder.pkl` - The fitted category mapping Label Encoder.

## Running the Training Script

To re-train the model anytime, run:

```bash
python train.py
```

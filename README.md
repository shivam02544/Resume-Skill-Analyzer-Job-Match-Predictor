# Resume Skill Analyzer - Quick Start Guide

This project consists of a Python Flask backend serving a Machine Learning REST API and a React frontend for the UI.

## Prerequisites

Before running the application, make sure you have the following installed on your system:

- **Python 3.x**
- **Node.js**
- **MongoDB** (running locally on port `27017`)

---

## 🚀 How to Run the Project

You will need to open **two separate terminal windows**.

### Step 1: Start the Backend (Flask + ML API)

In your first terminal window, navigate to the `backend` folder, activate the virtual environment, and run the server:

```powershell
cd backend
venv\Scripts\activate
python app.py
```

_(Note: If you get a script execution policy error using PowerShell, first run: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process`)_

The backend will start and listen for connections on `http://127.0.0.1:5000`.

### Step 2: Start the Frontend (React UI)

In your second terminal window, navigate to the `frontend` folder and start the Vite development server:

```powershell
cd frontend
npm run dev
```

The frontend will start instantly.

### Step 3: Access the Application

Open your web browser and go to:
**👉 http://localhost:5173**

---

## 🧪 How to Retrain the AI (Optional)

If you ever add new resumes to the `backend/dataset/resume.csv` file and want to retrain the Machine Learning model, simply run:

```powershell
cd backend
venv\Scripts\activate
python train.py
```

This will automatically generate new `.pkl` model files using the updated dataset!

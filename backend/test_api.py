import requests
import os

API_URL = "http://127.0.0.1:5000"

def create_sample_resume():
    """ Creates a temporary dummy resume file for testing purposes. """
    content = "I am a skilled Java Developer with experience in Python, AWS, HTML, CSS, React, SQL, and MongoDB. " * 10
    filename = "sample_resume_test.txt"
    with open(filename, "w") as f:
        f.write(content)
    return filename

def test_prediction(filename):
    """ Test the /predict endpoint by uploading the sample resume """
    print("------------------------------------------")
    print(f"Testing /predict API with {filename}...")
    url = f"{API_URL}/predict"
    
    try:
        with open(filename, "rb") as f:
            files = {"file": (filename, f, "text/plain")}
            data = {"name": "Test User Automator"}
            response = requests.post(url, files=files, data=data)
            
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            json_target = response.json()
            print("Response JSON Layout Validation:")
            print(f"- job_role: {json_target.get('job_role')} (Type: {type(json_target.get('job_role')).__name__})")
            print(f"- skills: {json_target.get('skills')} (Type: {type(json_target.get('skills')).__name__})")
            print(f"- confidence: {json_target.get('confidence')} (Type: {type(json_target.get('confidence')).__name__})")
            
            # Validate required schema keys exist
            if 'job_role' in json_target and 'skills' in json_target and 'confidence' in json_target:
                print("PASS: Schema Validation Passed")
            else:
                print("FAIL: Schema Validation Failed: Missing required keys")
                
        else:
             print(f"FAIL: API Error Response: {response.text}")
             
    except Exception as e:
        print(f"FAIL: Server unreachable or error occurred: {e}")

def test_history():
    """ Test the /history endpoint """
    print("------------------------------------------")
    print("Testing /history Database API...")
    url = f"{API_URL}/history"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            history_data = response.json()
            if isinstance(history_data, list):
                print(f"PASS: Extracted {len(history_data)} records from MongoDB successfully.")
            else:
                print("FAIL: History schema invalid: Should return a JSON array list.")
        else:
             print(f"FAIL: API Error Response: {response.text}")
             
    except Exception as e:
        print(f"FAIL: Server unreachable or error occurred: {e}")

if __name__ == "__main__":
    print("Running API Integration Verification Tests...")
    
    test_file = create_sample_resume()
    
    try:
        test_prediction(test_file)
        test_history()
    finally:
        # Cleanup automatically
        if os.path.exists(test_file):
            os.remove(test_file)
            print("------------------------------------------")
            print("Cleanup: Deleted temporary test files.")
            
    print("Audit testing complete.")

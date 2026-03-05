import os
import re
import csv
import docx

def get_job_role(filename):
    name = filename.lower()
    if 'java' in name:
        return 'Java Developer'
    elif 'hadoop' in name:
        return 'Hadoop Developer'
    elif 'pm' in name.split() or 'pm' in name.split('_') or 'project manager' in name or 'manager' in name:
        return 'Project Manager'
    elif 'ba' in name.split() or 'ba' in name.split('_') or 'ba-' in name or 'business analyst' in name:
        return 'Business Analyst'
    elif 'bsa' in name:
        return 'Business Systems Analyst'
    elif 'qa' in name or 'testing' in name or 'tester' in name:
        return 'QA Tester'
    elif 'php' in name:
        return 'PHP Developer'
    elif 'health' in name:
        return 'Healthcare Professional'
    else:
        return 'Software Engineer' # Default fallback


def extract_text_from_docx(file_path):
    try:
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return '\n'.join(full_text)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""


def main():
    directory = 'dataset/Resumes'
    output_csv = 'dataset/resume.csv'
    
    if not os.path.exists(directory):
        print(f"Directory {directory} not found.")
        return

    data = []
    
    print(f"Scanning directory {directory}...")
    for filename in os.listdir(directory):
        if filename.endswith(".docx"):
            filepath = os.path.join(directory, filename)
            text = extract_text_from_docx(filepath)
            
            # Basic cleanup of newlines to keep CSV clean
            text = text.replace('\n', ' ').replace('\r', ' ')
            text = re.sub(' +', ' ', text).strip()
            
            if text:
                role = get_job_role(filename)
                data.append({'Category': role, 'Resume': text})
                print(f"Processed {filename} -> {role}")
    
    print(f"Writing {len(data)} records to {output_csv}...")
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['Category', 'Resume'])
        writer.writeheader()
        for row in data:
            writer.writerow(row)
            
    print("Done! You can now run `train.py`.")

if __name__ == '__main__':
    main()

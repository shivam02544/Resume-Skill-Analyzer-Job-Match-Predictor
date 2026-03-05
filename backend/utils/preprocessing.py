import re
import nltk
from nltk.corpus import stopwords

# Download stopwords automatically
nltk.download('stopwords', quiet=True)

def clean_resume_text(text: str) -> str:
    """
    Cleans the input resume text by removing symbols, numbers, and stopwords.
    Converts text to lowercase.
    """
    # Convert text to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+\s*', ' ', text)
    
    # Remove RT and cc
    text = re.sub(r'rt|cc', ' ', text)
    
    # Remove hashtags
    text = re.sub(r'#\S+', '', text)
    
    # Remove mentions
    text = re.sub(r'@\S+', '  ', text)
    
    # Remove punctuation and special symbols
    text = re.sub('[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""), ' ', text)
    
    # Remove non-ASCII characters
    text = re.sub(r'[^\x00-\x7f]', r' ', text)
    
    # Remove numbers
    text = re.sub(r'\d+', ' ', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    words = text.split()
    cleaned_words = [word for word in words if word not in stop_words]
    
    return ' '.join(cleaned_words)

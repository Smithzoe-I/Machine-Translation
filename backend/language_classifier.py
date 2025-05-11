import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from fastapi import HTTPException

# Global variables for model and vectorizer
model = None
vectorizer = None

def load_language_model(model_path='svm_language_classification_model.h5', 
                        vectorizer_path='tfidf_vectorizer_lang.pkl'):
    """
    Load language classification model and vectorizer
    
    Args:
        model_path (str): Path to the saved SVM model
        vectorizer_path (str): Path to the saved TF-IDF vectorizer
    
    Returns:
        tuple: Loaded model and vectorizer
    """
    global model, vectorizer
    try:
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        return model, vectorizer
    except Exception as e:
        print(f"Error loading language classification model: {e}")
        return None, None

def classify_language(text: str):
    """
    Classify the input text language
    
    Args:
        text (str): Input text to classify
    
    Returns:
        tuple: Predicted language and confidence score
    
    Raises:
        HTTPException: If model is not loaded or classification fails
    """
    global model, vectorizer
    
    # Ensure model is loaded
    if model is None or vectorizer is None:
        model, vectorizer = load_language_model()
    
    # Check if model loading was successful
    if not model or not vectorizer:
        raise HTTPException(status_code=500, detail="Language classification model not loaded")
    
    # Vectorize input
    input_vector = vectorizer.transform([text])
    
    # Predict language
    predicted_label = model.predict(input_vector)[0]
    
    # Get confidence score
    try:
        decision = model.decision_function(input_vector)
        confidence = abs(decision[0])
    except:
        confidence = None
    
    # Apply low-confidence override
    if confidence is not None and confidence < 0.4:
        predicted_label = "English"
    
    return predicted_label, confidence

def detect_language(text: str) -> str:
    """
    Detect language with a fallback method
    
    Args:
        text (str): Input text to detect language
    
    Returns:
        str: Detected language code ('my' or 'en')
    """
    try:
        language, _ = classify_language(text)
        return language.lower()
    except HTTPException:
        # Fallback to manual detection
        return "my" if any('\u1000' <= char <= '\u109F' for char in text) else "en"
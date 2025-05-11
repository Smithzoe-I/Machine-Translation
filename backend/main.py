from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from unicode_converter import detect_and_convert
from language_classifier import classify_language, detect_language

app = FastAPI()

# Placeholder model function (to simulate translation)
def mock_translate(text: str, source_lang: str, target_lang: str) -> str:
    """
    Simulate translation. Replace this with the actual model later.
    """
    return f"[Translated from {source_lang} to {target_lang}]: {text}"

# Allow frontend (Netlify) to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace '*' with your Netlify URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route for testing
@app.get("/")
def read_root():
    return {"message": "Translation backend is running."}

# Translation route
@app.post("/translate")
async def translate(request: Request):
    data = await request.json()
    user_input = data.get("text", "")
    source_lang = data.get("source_lang", "")
    target_lang = data.get("target_lang", "")
    
    # Validate input
    if not user_input:
        raise HTTPException(status_code=400, detail="No text provided")
    
    # Detect language if not specified
    if not source_lang:
        try:
            source_lang, confidence = classify_language(user_input)
        except HTTPException:
            # Fallback to manual language detection
            source_lang = detect_language(user_input)
    
    # Convert Zawgyi to Unicode if needed
    normalized_text = detect_and_convert(user_input)
    
    # Validate source and target languages
    valid_langs = ["my", "en"]
    if source_lang not in valid_langs or target_lang not in valid_langs:
        raise HTTPException(status_code=400, detail=f"Invalid language. Supported languages are: {valid_langs}")
    
    # Use the mock translation function
    translated_text = mock_translate(normalized_text, source_lang=source_lang, target_lang=target_lang)
    
    return {
        "result": translated_text,
        "source_lang": source_lang,
        "target_lang": target_lang
    }

# Language classification route
@app.post("/classify")
async def classify(request: Request):
    data = await request.json()
    text = data.get("text", "")
    
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    try:
        language, confidence = classify_language(text)
        return {
            "language": language,
            "confidence": confidence
        }
    except HTTPException as e:
        raise e

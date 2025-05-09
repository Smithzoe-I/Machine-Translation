from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from unicode_converter import detect_and_convert

app = FastAPI()

# Allow frontend ( Netlify) to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Later, replace * with Netlify URL
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

    # Convert Zawgyi to Unicode if needed
    normalized_text = detect_and_convert(user_input)

    # Placeholder for model call (I’ll replace this later)
    translated_text = f"Translated: {normalized_text}"

    return {"result": translated_text}
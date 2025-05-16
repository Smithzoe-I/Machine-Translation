const express = require('express');
const cors = require('cors');
const { ZawgyiDetector } = require('myanmar-tools');

const app = express();
const detector = new ZawgyiDetector();

app.use(cors());
app.use(express.json());

// Mock translation function (placeholder)
function mockTranslate(text, sourceLang, targetLang) {
    return `[Translated from ${sourceLang} to ${targetLang}]: ${text}`;
}

// Detect language based on Myanmar characters
function detectLanguage(text) {
    return /[\u1000-\u109F]/.test(text) ? 'my' : 'en';
}

app.get('/', (req, res) => {
    res.json({ message: "Translation backend is running." });
});

app.post('/translate', (req, res) => {
    const { text, source_lang, target_lang } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: "No text provided" });
    }
    
    // Detect language if not specified
    const sourceLang = source_lang || detectLanguage(text);
    const targetLang = target_lang || (sourceLang === 'my' ? 'en' : 'my');
    
    // Convert Zawgyi to Unicode if needed
    const zawgyiProbability = detector.getZawgyiProbability(text);
    const normalizedText = zawgyiProbability > 0.5 ? text : text; // Add proper conversion here
    
    // Use mock translation for now
    const translatedText = mockTranslate(normalizedText, sourceLang, targetLang);
    
    res.json({
        result: translatedText,
        source_lang: sourceLang,
        target_lang: targetLang
    });
});

app.post('/classify', (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: "No text provided" });
    }
    
    const language = detectLanguage(text);
    res.json({
        language: language === 'my' ? 'Myanmar' : 'English',
        confidence: 1.0
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
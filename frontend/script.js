document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const sourceLangInfo = document.getElementById('source-language-info');
    const targetLangInfo = document.getElementById('target-language-info');
    const languageSwapButton = document.getElementById('language-swap-btn');
    const charCount = document.getElementById('char-count');
    const copyButton = document.getElementById('copy-button');

    // API base URL
    const API_URL = 'http://localhost:3000';

    // Debounce function to limit translation frequency
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Copy to clipboard functionality
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(outputText.value);
            copyButton.textContent = '✅ Copied!';
            setTimeout(() => {
                copyButton.textContent = '📋 Copy';
            }, 1500);
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Failed to copy text');
        }
    });

    // Character count tracking
    inputText.addEventListener('input', () => {
        const currentLength = inputText.value.length;
        charCount.textContent = currentLength;
        
        // Optional: Add warning for high character count
        if (currentLength > 4000) {
            charCount.style.color = 'red';
        } else {
            charCount.style.color = '';
        }

        // Always perform real-time translation
        debouncedTranslate();
    });

    // Language swap functionality
    languageSwapButton.addEventListener('click', () => {
        // Swap text
        const tempText = inputText.value;
        inputText.value = outputText.value;
        outputText.value = tempText;

        // Extract current language information
        const currentSourceLang = sourceLangInfo.textContent.replace('Detected Language: ', '');
        const currentTargetLang = targetLangInfo.textContent.replace('Translation to: ', '');

        // Swap language info with correct formatting
        sourceLangInfo.textContent = `Detected Language: ${currentTargetLang}`;
        targetLangInfo.textContent = `Translation to: ${currentSourceLang}`;

        // Update character count
        charCount.textContent = inputText.value.length;

        // Trigger translation
        debouncedTranslate();
    });

    async function classifyLanguage(text) {
        try {
            const response = await fetch(`${API_URL}/classify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) {
                throw new Error('Language classification failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Classification error:', error);
            return null;
        }
    }

    async function translateText(text) {
        // Determine source and target languages
        let sourceLang = 'my';
        let targetLang = 'en';

        const classification = await classifyLanguage(text);
        
        if (classification) {
            // Update language info
            sourceLang = classification.language.toLowerCase() === 'myanmar' ? 'my' : 'en';
            targetLang = sourceLang === 'my' ? 'en' : 'my';

            sourceLangInfo.textContent = `Detected Language: ${classification.language}`;
            targetLangInfo.textContent = `Translation to: ${targetLang === 'my' ? 'Myanmar' : 'English'}`;
        } else {
            // Fallback detection
            sourceLang = /[\u1000-\u109F]/.test(text) ? 'my' : 'en';
            targetLang = sourceLang === 'my' ? 'en' : 'my';

            sourceLangInfo.textContent = `Detected Language: ${sourceLang === 'my' ? 'Myanmar' : 'English'}`;
            targetLangInfo.textContent = `Translation to: ${sourceLang === 'my' ? 'English' : 'Myanmar'}`;
        }

        try {
            const response = await fetch(`${API_URL}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    source_lang: sourceLang,
                    target_lang: targetLang
                })
            });

            if (!response.ok) {
                throw new Error('Translation request failed');
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            throw new Error('Translation failed');
        }
    }

    // Debounced translation function
    const debouncedTranslate = debounce(async () => {
        const text = inputText.value.trim();
        
        // Input validation
        if (!text) {
            outputText.value = '';
            return;
        }

        if (text.length > 5000) {
            alert('Text exceeds maximum length of 5000 characters');
            return;
        }

        try {
            const translatedText = await translateText(text);
            outputText.value = translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            alert('Failed to translate. Please try again.');
            sourceLangInfo.textContent = 'Detecting Language';
            targetLangInfo.textContent = 'Myanmar, English';
            outputText.value = '';
        }
    }, 500); // 500ms debounce delay
});
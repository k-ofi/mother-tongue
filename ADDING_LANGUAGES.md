# Adding New Languages to Mother-Tongue

This guide explains how to easily add new Watson-supported languages to Mother-Tongue.

## Overview

Mother-Tongue uses a configuration-driven approach that makes adding new languages simple. All language configurations are centralized in [`backend/config/languages.js`](backend/config/languages.js).

## Prerequisites

The language you want to add must be:
1. Supported by IBM Watson Language Translator
2. Have a valid language code (e.g., 'es' for Spanish, 'ar' for Arabic)

Check [IBM Watson Language Translator documentation](https://cloud.ibm.com/docs/language-translator) for supported languages.

## Steps to Add a New Language

### 1. Add Language Configuration

Open [`backend/config/languages.js`](backend/config/languages.js) and add a new entry to the `SUPPORTED_LANGUAGES` object:

```javascript
swahili: {
  code: 'swahili',                    // Unique identifier (lowercase, no spaces)
  name: 'Swahili',                    // English name
  nativeName: 'Kiswahili',            // Native language name
  flag: '🇰🇪',                        // Flag emoji
  provider: 'watson',                 // 'watson' for IBM translator, 'google' for Twi
  watsonCode: 'sw',                   // Watson language code
  voiceCode: 'sw-KE',                 // Browser voice recognition code
  isPrimary: false,                   // Only Twi should be true
  description: 'IBM-compatible NLP flow using Watson Language Translator',
  placeholder: 'Nataka kuunda function...', // Placeholder text
  examples: [                         // Example prompts (optional)
    'Nataka kuunda function ya kukokotoa wastani',
    'Unda function ya kukokotoa kozi zilizobaki'
  ],
  inputLabel: '💬 Eleza unachotaka kujenga kwa Kiswahili',
  explanationLabel: '🇰🇪 Maelezo kwa Kiswahili'
},
```

### 2. That's It!

No other code changes needed! The system will automatically:
- ✅ Load the new language on startup
- ✅ Display it in the language selector
- ✅ Handle translation using Watson Language Translator
- ✅ Generate code and explanations
- ✅ Support voice input (if browser supports the language)

### 3. Test the New Language

1. Restart the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Open the frontend in your browser

3. The new language should appear in the language selector

4. Select it and test with a sample prompt

## Language Configuration Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `code` | Yes | Unique identifier (lowercase) | `'swahili'` |
| `name` | Yes | English name of the language | `'Swahili'` |
| `nativeName` | Yes | Native name of the language | `'Kiswahili'` |
| `flag` | Yes | Flag emoji representing the language | `'🇰🇪'` |
| `provider` | Yes | Translation provider: `'watson'` or `'google'` | `'watson'` |
| `watsonCode` | Yes* | Watson language code | `'sw'` |
| `googleCode` | Yes** | Google Translate code | `'tw'` |
| `voiceCode` | Yes | Browser voice recognition code | `'sw-KE'` |
| `isPrimary` | Yes | Whether this is the primary language | `false` |
| `description` | Yes | Description shown in UI | `'IBM-compatible NLP flow...'` |
| `placeholder` | Yes | Textarea placeholder text | `'Nataka kuunda...'` |
| `examples` | No | Array of example prompts | `['Example 1', 'Example 2']` |
| `inputLabel` | Yes | Label for input section | `'💬 Describe...'` |
| `explanationLabel` | Yes | Label for explanation section | `'🇰🇪 Explanation...'` |

\* Required if `provider` is `'watson'`  
\** Required if `provider` is `'google'`

## Finding Language Codes

### Watson Language Codes
Check the [Watson Language Translator API documentation](https://cloud.ibm.com/apidocs/language-translator) for supported language codes.

Common codes:
- Spanish: `es`
- French: `fr`
- German: `de`
- Arabic: `ar`
- Chinese (Simplified): `zh`
- Japanese: `ja`
- Korean: `ko`
- Portuguese: `pt`
- Italian: `it`
- Hindi: `hi`
- Swahili: `sw`

### Voice Recognition Codes
Use BCP 47 language tags for voice recognition:
- Format: `language-REGION`
- Examples: `es-ES` (Spanish-Spain), `ar-SA` (Arabic-Saudi Arabia), `sw-KE` (Swahili-Kenya)

Check [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang) for supported codes.

## Example: Adding Russian

```javascript
russian: {
  code: 'russian',
  name: 'Russian',
  nativeName: 'Русский',
  flag: '🇷🇺',
  provider: 'watson',
  watsonCode: 'ru',
  voiceCode: 'ru-RU',
  isPrimary: false,
  description: 'IBM-compatible NLP flow using Watson Language Translator',
  placeholder: 'Я хочу создать функцию...',
  examples: [
    'Я хочу создать функцию для расчета среднего балла',
    'Создать функцию для расчета оставшихся курсов'
  ],
  inputLabel: '💬 Опишите, что вы хотите создать на русском языке',
  explanationLabel: '🇷🇺 Объяснение на русском языке'
}
```

## Removing a Language

To remove a language, simply delete its entry from [`backend/config/languages.js`](backend/config/languages.js) and restart the server.

## Important Notes

1. **Twi is Primary**: The Twi language uses Google Translate and should always have `isPrimary: true`. All other languages should have `isPrimary: false`.

2. **Watson Credentials**: Ensure you have valid Watson Language Translator credentials in your `.env` file:
   ```env
   LANGUAGE_TRANSLATOR_API_KEY=your_api_key
   LANGUAGE_TRANSLATOR_URL=https://api.us-south.language-translator.watson.cloud.ibm.com
   ```

3. **Voice Input**: Voice recognition availability depends on the browser and operating system. Not all languages may be supported.

4. **Translation Quality**: Watson Language Translator quality varies by language pair. Test thoroughly with your target language.

## Troubleshooting

### Language not appearing in UI
- Check that the server restarted successfully
- Verify the language configuration syntax is correct
- Check browser console for errors

### Translation errors
- Verify Watson Language Translator supports the language code
- Check that your Watson credentials are valid
- Ensure the `watsonCode` matches Watson's language code exactly

### Voice input not working
- Verify the `voiceCode` is correct for your language
- Check browser support for the language
- Try a different browser (Chrome/Edge have best support)

## Currently Supported Languages

Mother-Tongue currently supports:

**Primary (Google Translate):**
- 🇬🇭 Twi (Akan)

**IBM Watson Languages:**
- 🇫🇷 French
- 🇪🇸 Spanish
- 🇸🇦 Arabic
- 🇩🇪 German
- 🇵🇹 Portuguese
- 🇮🇹 Italian
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇨🇳 Chinese (Simplified)
- 🇮🇳 Hindi

## Need Help?

If you encounter issues adding a new language:
1. Check the [Watson Language Translator documentation](https://cloud.ibm.com/docs/language-translator)
2. Verify your language code is correct
3. Test the language code directly with Watson API
4. Check server logs for detailed error messages

---

**Adding languages is now as simple as editing one configuration file!** 🎉
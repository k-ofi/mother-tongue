# Testing Guide for IBM Language Translator Integration

## Overview

This guide helps you test both translation paths in Mother-Tongue:
1. **Primary Twi Flow** (Google Translate) - Default
2. **IBM-Compatible Flow** (Watson Language Translator) - French mode

## Prerequisites

### For Twi Mode (Default)
- No additional setup required
- Works out of the box with existing Watsonx credentials

### For French Mode (IBM Watson)
You need IBM Watson Language Translator credentials:

1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Create a **Language Translator** service instance
3. Get your credentials:
   - API Key
   - Service URL (usually: `https://api.us-south.language-translator.watson.cloud.ibm.com`)
4. Add to your `.env` file:
   ```env
   LANGUAGE_TRANSLATOR_API_KEY=your_api_key_here
   LANGUAGE_TRANSLATOR_URL=https://api.us-south.language-translator.watson.cloud.ibm.com
   ```

## Testing Steps

### 1. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend (if using http-server)
cd frontend
npx http-server -p 5500
```

Or simply open `frontend/index.html` in your browser.

### 2. Test Twi Mode (Primary Flow)

1. **Ensure Twi mode is selected** (should be default - blue button)
2. **Enter a Twi request** or click an example:
   ```
   Me pɛ sɛ wɔyɛ function bi a ɛde student CGPA ne target classification to mu
   ```
3. **Click "Generate Code"**
4. **Verify the flow**:
   - ✅ Input is in Twi
   - ✅ English Intent shows translated and refined intent
   - ✅ Generated Code appears
   - ✅ Explanation is in Twi

**Expected Result**: Code generation with Twi explanation using Google Translate

### 3. Test French Mode (IBM Watson)

1. **Click the "🇫🇷 French (IBM Watson)" button** to switch modes
2. **Verify UI updates**:
   - Input label changes to French
   - Example prompts change to French
   - Placeholder text changes
3. **Enter a French request** or click an example:
   ```
   Je veux créer une fonction qui prend le CGPA d'un étudiant et une classification cible
   ```
4. **Click "Generate Code"**
5. **Verify the flow**:
   - ✅ Input is in French
   - ✅ English Intent shows "translated by IBM Watson"
   - ✅ Generated Code appears
   - ✅ Explanation is in French

**Expected Result**: Code generation with French explanation using Watson Language Translator

### 4. Test Voice Input

#### Twi Mode
1. Select Twi mode
2. Click the microphone button (🎤)
3. Allow microphone access
4. Speak in Twi
5. Verify transcription appears in the text area

#### French Mode
1. Select French mode
2. Click the microphone button (🎤)
3. Speak in French
4. Verify transcription appears in the text area

**Note**: Voice recognition works best in Chrome/Edge browsers.

## Verification Checklist

### Backend Verification
- [ ] `ibm-watson` package installed (check `package.json`)
- [ ] Environment variables set in `.env`
- [ ] Server starts without errors
- [ ] No console errors when making requests

### Frontend Verification
- [ ] Language mode toggle buttons appear
- [ ] Clicking toggle updates UI labels
- [ ] Example prompts change based on mode
- [ ] Placeholder text changes based on mode
- [ ] Mode description updates correctly

### API Verification
- [ ] Twi mode returns `twiExplanation` in response
- [ ] French mode returns `frenchExplanation` in response
- [ ] Both modes return `englishIntent` and `generatedCode`
- [ ] Response includes `languageMode` field

## Troubleshooting

### French Mode Not Working

**Error**: "Watson Language Translator not configured"
- **Solution**: Add `LANGUAGE_TRANSLATOR_API_KEY` and `LANGUAGE_TRANSLATOR_URL` to `.env`

**Error**: "Watson Language Translator failed"
- **Solution**: Verify your API key is correct and service is active in IBM Cloud

### Twi Mode Issues

**Error**: "Google Translate failed"
- **Solution**: Check internet connection (Google Translate requires external API access)

### Voice Input Not Working

- **Browser**: Use Chrome or Edge
- **Permissions**: Allow microphone access
- **Language**: Ensure correct language mode is selected

## Architecture Verification

### Twi Flow (Primary)
```
Twi Input → Google Translate (tw→en) → Granite (intent) → Bob (code) → Granite (explanation) → Google Translate (en→tw) → Twi Output
```

### French Flow (IBM-Compatible)
```
French Input → Watson Translator (fr→en) → Granite (intent) → Bob (code) → Granite (explanation) → Watson Translator (en→fr) → French Output
```

## Sample Test Cases

### Test Case 1: Twi - GPA Calculator Function
**Input**: `Me pɛ sɛ wɔyɛ function bi a ɛde student CGPA ne target classification to mu`
**Expected**: JavaScript function that calculates required grades

### Test Case 2: French - GPA Calculator Function
**Input**: `Je veux créer une fonction qui prend le CGPA d'un étudiant et une classification cible`
**Expected**: Same JavaScript function with French explanation

### Test Case 3: Twi - Remaining Courses Calculator
**Input**: `Me pɛ sɛ wɔyɛ Calculator RemainingCourses dwumadie`
**Expected**: Function to calculate remaining courses

### Test Case 4: French - Remaining Courses Calculator
**Input**: `Créer une fonction pour calculer les cours restants`
**Expected**: Same function with French explanation

## Success Criteria

✅ Both translation modes work independently
✅ Twi mode uses Google Translate (primary flow)
✅ French mode uses Watson Language Translator (IBM-compatible flow)
✅ Code generation works for both modes
✅ Explanations return in the correct language
✅ UI updates correctly when switching modes
✅ Voice input adapts to selected language
✅ No errors in browser console or server logs

## Notes

- The Twi flow is the **primary** and **default** mode
- French mode demonstrates **IBM-compatible NLP** capabilities
- Both modes use the same Bob code generation engine
- The implementation keeps both flows completely separate
- French mode is optional and requires additional credentials

---

**Built with ❤️ for demonstrating IBM's NLP capabilities**
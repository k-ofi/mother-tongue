const axios = require('axios');
const dotenv = require('dotenv');
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
const { getLanguageConfig } = require('../config/languages');
dotenv.config();

// Token cache to avoid unnecessary API calls
let tokenCache = {
  token: null,
  expiresAt: null
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {string} operationName - Name for logging
 * @param {number} retries - Current retry count
 * @returns {Promise<any>}
 */
async function retryWithBackoff(fn, operationName, retries = 0) {
  try {
    return await fn();
  } catch (error) {
    if (retries >= RETRY_CONFIG.maxRetries) {
      console.error(`${operationName} failed after ${RETRY_CONFIG.maxRetries} retries:`, error.message);
      throw error;
    }

    // Check if error is retryable
    const isRetryable =
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.response?.status >= 500 ||
      error.response?.status === 429;

    if (!isRetryable) {
      throw error;
    }

    const delay = Math.min(
      RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retries),
      RETRY_CONFIG.maxDelay
    );

    console.log(`${operationName} failed, retrying in ${delay}ms (attempt ${retries + 1}/${RETRY_CONFIG.maxRetries})`);
    await sleep(delay);

    return retryWithBackoff(fn, operationName, retries + 1);
  }
}

// Validate required environment variables
function validateEnvVariables() {
  const required = ['WATSONX_API_KEY', 'WATSONX_PROJECT_ID', 'WATSONX_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Initialize IBM Watson Language Translator (optional - for IBM-compatible NLP flow)
let languageTranslator = null;
function getLanguageTranslator() {
  if (!languageTranslator && process.env.LANGUAGE_TRANSLATOR_API_KEY && process.env.LANGUAGE_TRANSLATOR_URL) {
    languageTranslator = new LanguageTranslatorV3({
      version: '2018-05-01',
      authenticator: new IamAuthenticator({
        apikey: process.env.LANGUAGE_TRANSLATOR_API_KEY,
      }),
      serviceUrl: process.env.LANGUAGE_TRANSLATOR_URL,
    });
  }
  return languageTranslator;
}

/**
 * Get IBM Cloud access token with caching and retry logic
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
  try {
    // Return cached token if still valid (with 5 minute buffer)
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt && tokenCache.expiresAt > now + 300000) {
      return tokenCache.token;
    }

    validateEnvVariables();
    
    const response = await retryWithBackoff(async () => {
      return await axios.post(
        'https://iam.cloud.ibm.com/identity/token',
        new URLSearchParams({
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: process.env.WATSONX_API_KEY
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000 // 30 second timeout
        }
      );
    }, 'Token fetch');

    // Validate response structure
    if (!response.data?.access_token) {
      throw new Error('Invalid token response structure');
    }

    // Cache token (IBM tokens valid for 1 hour)
    tokenCache.token = response.data.access_token;
    tokenCache.expiresAt = now + 3600000; // 1 hour from now

    return tokenCache.token;
  } catch (error) {
    console.error('Token fetch error:', error);
    // Clear cache on error
    tokenCache.token = null;
    tokenCache.expiresAt = null;
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

// New function to translate using Google Translate unofficial free endpoint
async function translateWithGoogle(text, fromLang, toLang) {
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodedText}`;
    
    const response = await axios.get(url, {
      timeout: 30000 // 30 second timeout
    });
    
    // Validate response structure
    if (!Array.isArray(response.data?.[0])) {
      throw new Error('Invalid Google Translate response structure');
    }
    
    // Extract translated text from response
    const translatedText = response.data[0].map(segment => segment[0]).join('');
    
    if (!translatedText || translatedText.trim().length === 0) {
      throw new Error('Translation returned empty result');
    }
    
    return translatedText;
  } catch (error) {
    console.error('Google Translate error:', error);
    throw new Error(`Google Translate failed: ${error.message}`);
  }
}

/**
 * IBM-COMPATIBLE NLP FLOW: Translate using Watson Language Translator
 * Supports multiple language pairs (French, Spanish, Arabic, German, etc.)
 * This is an additional translation path alongside the primary Twi flow
 */
async function translateWithWatson(text, watsonSourceCode, watsonTargetCode) {
  try {
    const translator = getLanguageTranslator();
    
    if (!translator) {
      throw new Error('Watson Language Translator not configured. Please set LANGUAGE_TRANSLATOR_API_KEY and LANGUAGE_TRANSLATOR_URL in .env');
    }

    const translateParams = {
      text: [text],
      source: watsonSourceCode,
      target: watsonTargetCode,
    };

    const response = await translator.translate(translateParams);
    
    if (!response.result?.translations?.[0]?.translation) {
      throw new Error('Invalid Watson Language Translator response structure');
    }

    return response.result.translations[0].translation;
  } catch (error) {
    console.error('Watson Language Translator error:', error);
    throw new Error(`Watson Language Translator failed: ${error.message}`);
  }
}

/**
 * IBM-COMPATIBLE NLP FLOW: Translate any Watson-supported language to English intent
 * This demonstrates the IBM-only translation path for multiple languages
 * @param {string} input - Text in the source language
 * @param {string} languageCode - Language code (e.g., 'french', 'spanish', 'arabic')
 */
async function translateToIntent(input, languageCode) {
  try {
    // Get language configuration
    const langConfig = getLanguageConfig(languageCode);
    if (!langConfig) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }

    if (langConfig.provider !== 'watson') {
      throw new Error(`Language ${languageCode} does not use Watson translator`);
    }

    // Sanitize input to prevent prompt injection
    const sanitizedInput = input.replace(/[<>{}]/g, '').substring(0, 1000);
    
    // Use Watson Language Translator to translate to English
    const englishTranslation = await translateWithWatson(
      sanitizedInput,
      langConfig.watsonCode,
      'en'
    );
    
    // Use Granite to refine the translation into a clear programming intent
    const token = await getAccessToken();
    
    const prompt = `You are a software engineer. A developer wants to build a JavaScript function.

Their request (translated from ${langConfig.name}): "${englishTranslation}"

Your task: Rewrite this as ONE clear, specific English sentence describing the exact JavaScript function they want to build.

Guidelines:
- Be specific about what the function should do
- Mention function names if obvious from context
- Focus on programming intent
- Write only ONE sentence
- Do NOT write code
- Do NOT provide multiple options

Programming intent:`;

    const response = await axios.post(
      `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        model_id: 'ibm/granite-3-8b-instruct',
        input: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.3
        },
        project_id: process.env.WATSONX_PROJECT_ID
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Validate response structure
    if (!response.data?.results?.[0]?.generated_text) {
      throw new Error('Invalid Granite API response structure');
    }

    const result = response.data.results[0].generated_text.trim();
    
    if (!result || result.length < 3) {
      throw new Error('AI returned empty response');
    }

    return result;

  } catch (error) {
    console.error(`${languageCode} translation error:`, error);
    throw new Error(`Translation failed for ${languageCode}: ${error.message}`);
  }
}

/**
 * DEPRECATED: Use translateToIntent() instead
 * Kept for backward compatibility
 */
async function translateFrenchToIntent(frenchInput) {
  return translateToIntent(frenchInput, 'french');
}

/**
 * UNIVERSAL TRANSLATION FLOW: Use Google Translate for all languages
 * This handles Twi and all other languages using Google Translate
 * Language detection is automatic based on the languageMode parameter
 */
async function translateTwiToIntent(input, languageCode = 'tw') {
  try {
    // Sanitize input to prevent prompt injection
    const sanitizedInput = input.replace(/[<>{}]/g, '').substring(0, 1000);
    
    // Use Google Translate to translate any language to English
    // Default to Twi (tw) for backward compatibility
    const englishTranslation = await translateWithGoogle(sanitizedInput, languageCode, 'en');
    
    // Use Granite to refine the translation into a clear programming intent
    const token = await getAccessToken();
    
    const languageName = languageCode === 'tw' ? 'Twi' : 'another language';
    const prompt = `You are a software engineer. A developer wants to build a JavaScript function.

Their request (translated from ${languageName}): "${englishTranslation}"

Your task: Rewrite this as ONE clear, specific English sentence describing the exact JavaScript function they want to build.

Guidelines:
- Be specific about what the function should do
- Mention function names if obvious from context
- Focus on programming intent
- Write only ONE sentence
- Do NOT write code
- Do NOT provide multiple options

Programming intent:`;

    const response = await axios.post(
      `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        model_id: 'ibm/granite-3-8b-instruct',
        input: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.3
        },
        project_id: process.env.WATSONX_PROJECT_ID
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Validate response structure
    if (!response.data?.results?.[0]?.generated_text) {
      throw new Error('Invalid Granite API response structure');
    }

    const result = response.data.results[0].generated_text.trim();
    
    if (!result || result.length < 3) {
      throw new Error('AI returned empty response');
    }

    return result;

  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

/**
 * Cleans Twi explanation by keeping only the first 2 sentences
 * and removing any English words that appear after Twi text
 */
function cleanTwiExplanation(twiText) {
  // Split by sentence endings (period followed by space or end of string)
  const sentences = twiText.split(/\.\s+/);
  
  // Keep only first 2 sentences
  let cleanedText = sentences.slice(0, 2).join('. ');
  
  // Add period if not present
  if (cleanedText && !cleanedText.endsWith('.')) {
    cleanedText += '.';
  }
  
  // Remove common English words/phrases that might leak through
  // This regex removes English explanatory text that often appears after Twi
  const englishPatterns = [
    /\s*Explanation in multiple languages:?\s*/gi,
    /\s*Translation:?\s*/gi,
    /\s*In English:?\s*/gi,
    /\s*Note:?\s*/gi,
    /\s*\(English:.*?\)/gi,
    /\s*\[English:.*?\]/gi,
    /\s*English version:?\s*/gi,
    /\s*Nkyerεkyerεmu.*$/gi, // Remove repetitive Twi headers
    /\s*dwumadie no yɛ adesua.*$/gi // Remove repetitive explanations
  ];
  
  englishPatterns.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });
  
  return cleanedText.trim();
}

/**
 * IBM-COMPATIBLE NLP FLOW: Generate English explanation, then translate using Watson
 * This demonstrates the IBM-only explanation path for multiple languages
 * @param {string} code - Generated code
 * @param {string} englishIntent - English intent description
 * @param {string} languageCode - Target language code (e.g., 'french', 'spanish')
 */
async function explainInLanguage(code, englishIntent, languageCode) {
  try {
    // Get language configuration
    const langConfig = getLanguageConfig(languageCode);
    if (!langConfig) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }

    if (langConfig.provider !== 'watson') {
      throw new Error(`Language ${languageCode} does not use Watson translator`);
    }

    const token = await getAccessToken();

    // Step 1: Use Granite to generate a clean, simple English explanation with STRICT constraints
    const prompt = `You are explaining code to a developer.

What the code does: ${englishIntent}

Your task: Write EXACTLY 2 sentences in simple English explaining what this code does.

CRITICAL RULES - YOU MUST FOLLOW THESE:
- Write EXACTLY 2 sentences only
- Stop immediately after the second sentence ends with a full stop
- Use simple, everyday language
- Explain the purpose, not implementation details
- Do NOT write code
- Do NOT use technical terms like "javascript" or "function"
- Do NOT include any code snippets
- Do NOT repeat any phrase
- Maximum 60 words total
- Each sentence must end with a full stop

Explanation:`;

    const response = await axios.post(
      `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        model_id: 'ibm/granite-3-8b-instruct',
        input: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.3,
          min_new_tokens: 20
        },
        project_id: process.env.WATSONX_PROJECT_ID
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Validate response structure
    if (!response.data?.results?.[0]?.generated_text) {
      throw new Error('Invalid Granite API response structure');
    }

    let englishExplanation = response.data.results[0].generated_text.trim();
    
    if (!englishExplanation || englishExplanation.length < 3) {
      throw new Error('AI returned empty explanation');
    }

    // Additional cleanup: ensure we only have 2 sentences max
    const sentences = englishExplanation.split(/\.\s+/);
    if (sentences.length > 2) {
      englishExplanation = sentences.slice(0, 2).join('. ') + '.';
    }

    // Step 2: Translate the clean English explanation to target language using Watson
    const translatedExplanation = await translateWithWatson(
      englishExplanation,
      'en',
      langConfig.watsonCode
    );

    return translatedExplanation;

  } catch (error) {
    console.error(`${languageCode} explanation error:`, error);
    throw new Error(`Explanation failed for ${languageCode}: ${error.message}`);
  }
}

/**
 * DEPRECATED: Use explainInLanguage() instead
 * Kept for backward compatibility
 */
async function explainInFrench(code, englishIntent) {
  return explainInLanguage(code, englishIntent, 'french');
}

/**
 * LEGACY: IBM-COMPATIBLE NLP FLOW for French (kept for reference)
 * Use explainInLanguage(code, englishIntent, 'french') instead
 */
async function explainInFrenchLegacy(code, englishIntent) {
  try {
    const token = await getAccessToken();

    // Step 1: Use Granite to generate a clean, simple English explanation with STRICT constraints
    const prompt = `You are explaining code to a developer.

What the code does: ${englishIntent}

Your task: Write EXACTLY 2 sentences in simple English explaining what this code does.

CRITICAL RULES - YOU MUST FOLLOW THESE:
- Write EXACTLY 2 sentences only
- Stop immediately after the second sentence ends with a full stop
- Use simple, everyday language
- Explain the purpose, not implementation details
- Do NOT write code
- Do NOT use technical terms like "javascript" or "function"
- Do NOT include any code snippets
- Do NOT repeat any phrase
- Maximum 60 words total
- Each sentence must end with a full stop

Explanation:`;

    const response = await axios.post(
      `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        model_id: 'ibm/granite-3-8b-instruct',
        input: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.3,
          min_new_tokens: 20
        },
        project_id: process.env.WATSONX_PROJECT_ID
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Validate response structure
    if (!response.data?.results?.[0]?.generated_text) {
      throw new Error('Invalid Granite API response structure');
    }

    let englishExplanation = response.data.results[0].generated_text.trim();
    
    if (!englishExplanation || englishExplanation.length < 3) {
      throw new Error('AI returned empty explanation');
    }

    // Additional cleanup: ensure we only have 2 sentences max
    const sentences = englishExplanation.split(/\.\s+/);
    if (sentences.length > 2) {
      englishExplanation = sentences.slice(0, 2).join('. ') + '.';
    }

    // Step 2: Translate the clean English explanation to French using Watson Language Translator
    const frenchExplanation = await translateWithWatson(englishExplanation, 'en', 'fr');

    return frenchExplanation;

  } catch (error) {
    console.error('French explanation error:', error);
    throw new Error(`French explanation failed: ${error.message}`);
  }
}

/**
 * PRIMARY TWI FLOW: Generate English explanation with Granite, then translate to Twi with Google Translate
 * This is the main explanation path for the Twi-based UX
 */
async function explainInTwi(code, englishIntent) {
  try {
    const token = await getAccessToken();

    // Step 1: Use Granite to generate a clean, simple English explanation with STRICT constraints
    const prompt = `You are explaining code to a developer.

What the code does: ${englishIntent}

Your task: Write EXACTLY 2 sentences in simple English explaining what this code does.

CRITICAL RULES - YOU MUST FOLLOW THESE:
- Write EXACTLY 2 sentences only
- Stop immediately after the second sentence ends with a full stop
- Use simple, everyday language
- Explain the purpose, not implementation details
- Do NOT write code
- Do NOT use technical terms like "javascript" or "function"
- Do NOT include any code snippets
- Do NOT repeat any phrase
- Maximum 60 words total
- Each sentence must end with a full stop

Explanation:`;

    const response = await axios.post(
      `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        model_id: 'ibm/granite-3-8b-instruct',
        input: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.3,
          min_new_tokens: 20
        },
        project_id: process.env.WATSONX_PROJECT_ID
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Validate response structure
    if (!response.data?.results?.[0]?.generated_text) {
      throw new Error('Invalid Granite API response structure');
    }

    let englishExplanation = response.data.results[0].generated_text.trim();
    
    if (!englishExplanation || englishExplanation.length < 3) {
      throw new Error('AI returned empty explanation');
    }

    // Additional cleanup: ensure we only have 2 sentences max
    const sentences = englishExplanation.split(/\.\s+/);
    if (sentences.length > 2) {
      englishExplanation = sentences.slice(0, 2).join('. ') + '.';
    }

    // Step 2: Translate the clean English explanation to Twi using Google Translate
    const twiExplanation = await translateWithGoogle(englishExplanation, 'en', 'tw');

    // Step 3: Clean the Twi explanation to remove any English leakage or repetition
    const cleanedTwiExplanation = cleanTwiExplanation(twiExplanation);

    return cleanedTwiExplanation;

  } catch (error) {
    console.error('Twi explanation error:', error);
    throw new Error(`Twi explanation failed: ${error.message}`);
  }
}

module.exports = {
  // Primary Twi flow (Google Translate)
  translateTwiToIntent,
  explainInTwi,
  // IBM-compatible NLP flow (Watson Language Translator) - Multi-language support
  translateToIntent,
  explainInLanguage,
  translateWithWatson,
  // Backward compatibility
  translateFrenchToIntent,
  explainInFrench,
  // Shared utilities
  getAccessToken
};

// Made with Bob

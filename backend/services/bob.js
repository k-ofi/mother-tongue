const axios = require('axios');
const { getAccessToken } = require('./watsonx');
const { generateCodePrompt, getCleaningPatterns } = require('./promptGenerator');
const dotenv = require('dotenv');
dotenv.config();

// Configuration constants
const MAX_CODE_TOKENS = 800; // Allows ~200 lines of code
const CODE_TEMPERATURE = 0.2; // Low temperature for deterministic code generation
const REQUEST_TIMEOUT = 60000; // 60 seconds for code generation

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 2000,
  maxDelay: 8000,
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

/**
 * Cleans generated code using language-specific patterns
 * @param {string} code - Generated code to clean
 * @param {string} language - Programming language
 * @returns {string} Cleaned code
 */
function cleanGeneratedCode(code, language = 'javascript') {
  let cleanedCode = code;

  // Apply language-specific cleaning patterns
  const patterns = getCleaningPatterns(language);
  patterns.forEach(pattern => {
    cleanedCode = cleanedCode.replace(pattern, '');
  });

  // Clean up any excessive blank lines left by removals
  cleanedCode = cleanedCode.replace(/\n\s*\n\s*\n/g, '\n\n');

  return cleanedCode.trim();
}

/**
 * Generate context-aware code using IBM Granite model with dynamic prompts
 * @param {string} englishIntent - The programming intent in English
 * @param {string} repoContext - Repository context (legacy string format)
 * @param {object} projectAnalysis - Optional project analysis object for dynamic prompts
 * @returns {Promise<string>} Generated code in the project's primary language
 */
async function generateContextAwareCode(englishIntent, repoContext, projectAnalysis = null) {
  try {
    // Input validation
    if (!englishIntent || typeof englishIntent !== 'string') {
      throw new Error('Invalid intent: must be a non-empty string');
    }

    // Sanitize input to prevent prompt injection
    const sanitizedIntent = englishIntent.replace(/[<>{}]/g, '').substring(0, 500);

    const token = await getAccessToken();

    let prompt;
    let language = 'javascript'; // Default for backward compatibility

    // Use dynamic prompt if project analysis is provided
    if (projectAnalysis && projectAnalysis.primaryLanguage) {
      language = projectAnalysis.primaryLanguage;
      prompt = generateCodePrompt(sanitizedIntent, projectAnalysis, repoContext);
      console.log(`Generating ${language} code with dynamic prompt`);
    } else {
      // Fallback to legacy hardcoded prompt for backward compatibility
      const sanitizedContext = repoContext ? repoContext.substring(0, 5000) : 'No additional context provided';
      prompt = `You are an expert JavaScript developer working on a University of Ghana GPA Calculator.

Existing codebase context:
${sanitizedContext}

The developer wants to: ${sanitizedIntent}

CRITICAL - DO NOT RE-DECLARE EXISTING GLOBALS:
- gradeTable - ALREADY EXISTS as a global variable - DO NOT redeclare it
- degreeClassification - ALREADY EXISTS as a global variable - DO NOT redeclare it
- showNotification() - ALREADY EXISTS as a global function - call it directly, DO NOT redefine it
- calculateCGPA() - ALREADY EXISTS as a global function - call it directly, DO NOT redefine it

These are ALL available as global variables in the browser scope. Just use them directly.

Important rules:
- Use the existing gradeTable object for grade to GPA conversion
- Use the existing degreeClassification array for classification logic
- Use showNotification(message, type) for user feedback
- Follow camelCase naming convention
- Use vanilla JavaScript only
- Use calculateCGPA() to get current GPA data
- Write ONLY the new function - nothing else
- Assume all existing functions and objects are already available in scope

Write ONLY the JavaScript function. No explanation. No markdown. Just the code.`;
      console.log('Using legacy hardcoded prompt (no project analysis provided)');
    }

    const response = await retryWithBackoff(async () => {
      return await axios.post(
        `${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
        {
          model_id: 'ibm/granite-3-8b-instruct',
          input: prompt,
          parameters: {
            max_new_tokens: MAX_CODE_TOKENS,
            temperature: CODE_TEMPERATURE
          },
          project_id: process.env.WATSONX_PROJECT_ID
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: REQUEST_TIMEOUT
        }
      );
    }, 'Code generation');

    // Validate response structure
    if (!response.data?.results?.[0]?.generated_text) {
      throw new Error('Invalid API response structure');
    }

    const generatedCode = response.data.results[0].generated_text.trim();

    // Validate that we got actual code back
    if (!generatedCode || generatedCode.length === 0) {
      throw new Error('AI returned empty response');
    }

    // Clean up the generated code using language-specific patterns
    const cleanedCode = cleanGeneratedCode(generatedCode, language);

    return cleanedCode;

  } catch (error) {
    console.error('Code generation error:', error);
    throw new Error(`Code generation failed: ${error.message}`);
  }
}

module.exports = { generateContextAwareCode };
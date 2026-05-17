const express = require('express');
const router = express.Router();
const {
  translateTwiToIntent,
  explainInTwi
} = require('../services/watsonx');
const { generateContextAwareCode } = require('../services/bob');
const { getLanguageConfig } = require('../config/languages');
const {
  getCachedAnalysis,
  validateRepositoryPath,
  getProjectDescription
} = require('../services/repositoryAnalyzer');

// Input validation constants
const VALIDATION_RULES = {
  INPUT_MIN_LENGTH: 3,
  INPUT_MAX_LENGTH: 1000,
  CONTEXT_MAX_LENGTH: 10000
};

// XSS prevention - sanitize HTML special characters
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate input string
function validateInput(input, fieldName, minLength, maxLength) {
  if (!input) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof input !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} is too long (max ${maxLength} characters)` };
  }

  return { valid: true, value: trimmed };
}

router.post('/analyze', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { twiInput, repoContext, repoPath, languageMode } = req.body;

    // Validate input
    const inputValidation = validateInput(
      twiInput,
      'Input',
      VALIDATION_RULES.INPUT_MIN_LENGTH,
      VALIDATION_RULES.INPUT_MAX_LENGTH
    );
    
    if (!inputValidation.valid) {
      return res.status(400).json({ error: inputValidation.error });
    }

    const sanitizedInput = sanitizeInput(inputValidation.value);

    // Handle repository analysis (new feature)
    let projectAnalysis = null;
    let contextToUse = repoContext || '';
    
    if (repoPath) {
      // Validate repository path
      const pathValidation = validateRepositoryPath(repoPath);
      if (!pathValidation.valid) {
        return res.status(400).json({ error: pathValidation.error });
      }
      
      try {
        console.log(`Analyzing repository: ${pathValidation.path}`);
        projectAnalysis = await getCachedAnalysis(pathValidation.path);
        contextToUse = projectAnalysis.contextSummary;
        console.log(`Project detected: ${getProjectDescription(projectAnalysis)}`);
      } catch (error) {
        console.error('Repository analysis failed:', error);
        return res.status(400).json({
          error: 'Failed to analyze repository',
          details: error.message
        });
      }
    } else if (repoContext) {
      // Legacy: Validate manual repo context if provided
      if (typeof repoContext !== 'string') {
        return res.status(400).json({
          error: 'Repository context must be a string'
        });
      }
      
      if (repoContext.length > VALIDATION_RULES.CONTEXT_MAX_LENGTH) {
        return res.status(400).json({
          error: `Repository context is too long (max ${VALIDATION_RULES.CONTEXT_MAX_LENGTH} characters)`
        });
      }
    }

    // Validate language mode
    const mode = languageMode || 'twi'; // Default to Twi (primary flow)
    
    if (typeof mode !== 'string' || !/^[a-z]+$/.test(mode)) {
      return res.status(400).json({
        error: 'Invalid language mode format'
      });
    }
    
    // Get language configuration
    const langConfig = getLanguageConfig(mode);
    if (!langConfig) {
      return res.status(400).json({
        error: `Unsupported language mode: ${mode}`,
        supportedLanguages: ['twi', 'french', 'spanish', 'arabic', 'german', 'portuguese', 'italian', 'japanese', 'korean', 'chinese', 'hindi']
      });
    }

    // Log request (without sensitive data)
    console.log(`[${new Date().toISOString()}] Analysis request - Language: ${mode}, Input length: ${sanitizedInput.length}`);
    if (projectAnalysis) {
      console.log(`Using dynamic analysis: ${projectAnalysis.primaryLanguage} / ${projectAnalysis.primaryStack}`);
    }

    // All languages now use the same flow with Google Translate
    // Get the Google Translate language code from config
    const googleLangCode = langConfig.googleCode || 'tw';
    
    // Step 1: Translate to English intent (Google Translate for all languages)
    const englishIntent = await translateTwiToIntent(sanitizedInput, googleLangCode);

    // Step 2: Generate code using intent + repo context from Bob
    // Pass projectAnalysis for dynamic prompt generation
    const generatedCode = await generateContextAwareCode(
      englishIntent,
      contextToUse,
      projectAnalysis
    );

    // Step 3: Explain generated code back in the source language (Google Translate for all)
    const explanation = await explainInTwi(generatedCode, englishIntent, googleLangCode);

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Analysis completed - Language: ${mode}, Time: ${processingTime}ms`);

    // Build response with consistent field names
    const inputLabel = 'twiInput'; // Keep for backward compatibility
    const explanationLabel = 'twiExplanation'; // Keep for backward compatibility

    const response = {
      success: true,
      languageMode: mode,
      [inputLabel]: sanitizedInput,
      englishIntent,
      generatedCode,
      [explanationLabel]: explanation,
      metadata: {
        processingTime,
        timestamp: new Date().toISOString()
      }
    };

    // Add project information if repository was analyzed
    if (projectAnalysis) {
      response.projectInfo = {
        primaryLanguage: projectAnalysis.primaryLanguage,
        primaryStack: projectAnalysis.primaryStack,
        frameworks: projectAnalysis.frameworks,
        description: getProjectDescription(projectAnalysis),
        totalFiles: projectAnalysis.totalFiles,
        isMonorepo: projectAnalysis.metadata.isMonorepo,
        hasBackend: projectAnalysis.metadata.hasBackend,
        hasFrontend: projectAnalysis.metadata.hasFrontend
      };
    }

    res.json(response);

  } catch (error) {
    // Log full error details server-side for debugging
    const processingTime = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Analysis error after ${processingTime}ms:`, {
      message: error.message,
      stack: error.stack,
      languageMode: req.body.languageMode
    });
    
    // Return appropriate error to client
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Determine status code based on error type
    let statusCode = 500;
    let errorMessage = 'An error occurred while processing your request';
    
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      statusCode = 504;
      errorMessage = 'Request timeout - please try again';
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      statusCode = 429;
      errorMessage = 'Too many requests - please wait a moment';
    } else if (error.message.includes('Invalid') || error.message.includes('validation')) {
      statusCode = 400;
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      ...(isDevelopment && {
        details: error.message,
        processingTime
      })
    });
  }
});

// POST endpoint: Analyze repository structure only (no code generation)
router.post('/analyze-repo', async (req, res) => {
  try {
    const { repoPath } = req.body;

    if (!repoPath) {
      return res.status(400).json({ error: 'Repository path is required' });
    }

    const pathValidation = validateRepositoryPath(repoPath);
    if (!pathValidation.valid) {
      return res.status(400).json({ error: pathValidation.error });
    }

    console.log(`[${new Date().toISOString()}] Repository analysis request: ${pathValidation.path}`);

    const analysis = await getCachedAnalysis(pathValidation.path);

    res.json({
      success: true,
      analysis: {
        path: analysis.path,
        primaryLanguage: analysis.primaryLanguage,
        primaryStack: analysis.primaryStack,
        frameworks: analysis.frameworks,
        languages: analysis.languages,
        totalFiles: analysis.totalFiles,
        description: getProjectDescription(analysis),
        projectStructure: analysis.projectStructure,
        metadata: analysis.metadata
      }
    });

  } catch (error) {
    console.error('Repository analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze repository',
      details: error.message
    });
  }
});

// GET endpoint to fetch available languages
router.get('/languages', (req, res) => {
  try {
    const { getAllLanguages } = require('../config/languages');
    const languages = getAllLanguages();
    
    // Convert to array format for frontend
    const languageList = Object.values(languages).map(lang => ({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag,
      provider: lang.provider,
      isPrimary: lang.isPrimary,
      description: lang.description,
      voiceCode: lang.voiceCode,
      googleCode: lang.googleCode
    }));
    
    res.json({
      success: true,
      languages: languageList
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({
      error: 'Failed to fetch available languages'
    });
  }
});

module.exports = router;
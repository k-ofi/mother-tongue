const { analyzeRepository } = require('./fileAnalyzer');
const { detectFrameworks } = require('./frameworkDetector');
const { generateContextSummary } = require('./promptGenerator');

/**
 * Repository Analyzer Service
 * Comprehensive repository analysis combining file scanning, framework detection,
 * and context generation for code generation
 */

/**
 * Perform comprehensive repository analysis
 * @param {string} repoPath - Path to the repository
 * @param {object} options - Analysis options
 * @returns {Promise<object>} Complete analysis results
 */
async function analyzeRepositoryComprehensive(repoPath, options = {}) {
  const {
    maxDepth = 10,
    maxFileSize = 100000,
    maxFilesToAnalyze = 50,
    includeContent = false
  } = options;
  
  console.log(`Starting comprehensive analysis of: ${repoPath}`);
  const startTime = Date.now();
  
  try {
    // Step 1: Analyze file structure and languages
    console.log('Step 1: Analyzing file structure...');
    const fileAnalysis = await analyzeRepository(repoPath, {
      maxDepth,
      maxFileSize,
      maxFilesToAnalyze,
      includeContent
    });
    
    // Step 2: Detect frameworks and dependencies
    console.log('Step 2: Detecting frameworks...');
    const frameworkAnalysis = await detectFrameworks(repoPath);
    
    // Step 3: Combine results
    const combinedAnalysis = {
      path: repoPath,
      timestamp: new Date().toISOString(),
      analysisTime: Date.now() - startTime,
      
      // File structure
      totalFiles: fileAnalysis.totalFiles,
      analyzedFiles: fileAnalysis.analyzedFiles,
      
      // Languages
      primaryLanguage: fileAnalysis.primaryLanguage,
      languages: fileAnalysis.languages,
      filesByLanguage: fileAnalysis.filesByLanguage,
      
      // Frameworks and stack
      primaryStack: frameworkAnalysis.primaryStack,
      frameworks: frameworkAnalysis.frameworks,
      dependencies: frameworkAnalysis.dependencies,
      
      // Project structure
      projectStructure: frameworkAnalysis.projectStructure,
      manifests: frameworkAnalysis.manifests,
      
      // Code elements
      codeElements: fileAnalysis.codeElements,
      
      // Metadata
      metadata: {
        isMonorepo: frameworkAnalysis.projectStructure.isMonorepo,
        hasBackend: frameworkAnalysis.projectStructure.hasBackend,
        hasFrontend: frameworkAnalysis.projectStructure.hasFrontend,
        hasTypeScript: frameworkAnalysis.manifests.javascript?.hasTypeScript || false,
        buildTools: frameworkAnalysis.manifests.javascript?.buildTools || [],
        testingFrameworks: frameworkAnalysis.manifests.javascript?.testingFrameworks || []
      }
    };
    
    // Step 4: Generate context summary
    console.log('Step 3: Generating context summary...');
    combinedAnalysis.contextSummary = generateContextSummary(combinedAnalysis);
    
    console.log(`Analysis complete in ${combinedAnalysis.analysisTime}ms`);
    console.log(`Primary Language: ${combinedAnalysis.primaryLanguage}`);
    console.log(`Primary Stack: ${combinedAnalysis.primaryStack}`);
    console.log(`Frameworks: ${combinedAnalysis.frameworks.join(', ') || 'None detected'}`);
    
    return combinedAnalysis;
    
  } catch (error) {
    console.error('Repository analysis failed:', error);
    throw new Error(`Failed to analyze repository: ${error.message}`);
  }
}

/**
 * Get a simplified analysis suitable for code generation context
 * @param {string} repoPath - Path to the repository
 * @returns {Promise<object>} Simplified analysis for code generation
 */
async function getCodeGenerationContext(repoPath) {
  const analysis = await analyzeRepositoryComprehensive(repoPath, {
    maxFilesToAnalyze: 30,
    includeContent: false
  });
  
  return {
    primaryLanguage: analysis.primaryLanguage,
    primaryStack: analysis.primaryStack,
    frameworks: analysis.frameworks,
    codeElements: analysis.codeElements,
    projectStructure: analysis.projectStructure,
    contextSummary: analysis.contextSummary
  };
}

/**
 * Cache for repository analyses to avoid repeated scanning
 */
const analysisCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached analysis or perform new analysis
 * @param {string} repoPath - Path to the repository
 * @param {boolean} forceRefresh - Force new analysis even if cached
 * @returns {Promise<object>} Analysis results
 */
async function getCachedAnalysis(repoPath, forceRefresh = false) {
  const cacheKey = repoPath;
  
  // Check cache
  if (!forceRefresh && analysisCache.has(cacheKey)) {
    const cached = analysisCache.get(cacheKey);
    const age = Date.now() - cached.timestamp;
    
    if (age < CACHE_TTL) {
      console.log(`Using cached analysis for ${repoPath} (age: ${Math.round(age / 1000)}s)`);
      return cached.data;
    } else {
      console.log(`Cache expired for ${repoPath}, refreshing...`);
      analysisCache.delete(cacheKey);
    }
  }
  
  // Perform new analysis
  const analysis = await analyzeRepositoryComprehensive(repoPath);
  
  // Cache the result
  analysisCache.set(cacheKey, {
    data: analysis,
    timestamp: Date.now()
  });
  
  return analysis;
}

/**
 * Clear analysis cache
 * @param {string} repoPath - Optional specific path to clear, or clear all if not provided
 */
function clearCache(repoPath = null) {
  if (repoPath) {
    analysisCache.delete(repoPath);
    console.log(`Cleared cache for ${repoPath}`);
  } else {
    analysisCache.clear();
    console.log('Cleared all analysis cache');
  }
}

/**
 * Validate repository path before analysis
 * @param {string} repoPath - Path to validate
 * @returns {object} Validation result
 */
function validateRepositoryPath(repoPath) {
  if (!repoPath || typeof repoPath !== 'string') {
    return {
      valid: false,
      error: 'Repository path must be a non-empty string'
    };
  }
  
  const trimmed = repoPath.trim();
  
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Repository path cannot be empty'
    };
  }
  
  // Security: Prevent path traversal attacks
  if (trimmed.includes('..') || trimmed.includes('~')) {
    return {
      valid: false,
      error: 'Invalid path: path traversal not allowed'
    };
  }
  
  // Check for absolute path (platform-specific)
  const isAbsolute = /^([a-zA-Z]:[\\/]|\/)/i.test(trimmed);
  
  if (!isAbsolute) {
    return {
      valid: false,
      error: 'Repository path must be an absolute path'
    };
  }
  
  return {
    valid: true,
    path: trimmed
  };
}

/**
 * Get project type description for user display
 * @param {object} analysis - Repository analysis
 * @returns {string} Human-readable project description
 */
function getProjectDescription(analysis) {
  const { primaryLanguage, primaryStack, frameworks, projectStructure } = analysis;
  
  let description = '';
  
  // Project type
  if (projectStructure.isMonorepo) {
    description += 'Monorepo ';
  }
  
  if (projectStructure.hasBackend && projectStructure.hasFrontend) {
    description += 'Full-stack ';
  } else if (projectStructure.hasBackend) {
    description += 'Backend ';
  } else if (projectStructure.hasFrontend) {
    description += 'Frontend ';
  }
  
  // Primary stack
  description += `${primaryStack} project`;
  
  // Additional frameworks
  if (frameworks.length > 1) {
    const otherFrameworks = frameworks.slice(1, 3);
    description += ` with ${otherFrameworks.join(', ')}`;
  }
  
  // Language
  description += ` (${primaryLanguage})`;
  
  return description;
}

/**
 * Export analysis to JSON file
 * @param {object} analysis - Repository analysis
 * @param {string} outputPath - Path to save JSON file
 */
async function exportAnalysis(analysis, outputPath) {
  const fs = require('fs').promises;
  
  try {
    const json = JSON.stringify(analysis, null, 2);
    await fs.writeFile(outputPath, json, 'utf-8');
    console.log(`Analysis exported to ${outputPath}`);
  } catch (error) {
    console.error('Failed to export analysis:', error);
    throw new Error(`Export failed: ${error.message}`);
  }
}

module.exports = {
  analyzeRepositoryComprehensive,
  getCodeGenerationContext,
  getCachedAnalysis,
  clearCache,
  validateRepositoryPath,
  getProjectDescription,
  exportAnalysis
};

// Made with Bob

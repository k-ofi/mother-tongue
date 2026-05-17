const fs = require('fs').promises;
const path = require('path');

/**
 * File System Analysis Module
 * Scans directories, detects file types, and analyzes project structure
 */

// File extension to language mapping
const LANGUAGE_MAP = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.kt': 'kotlin',
  '.go': 'go',
  '.rb': 'ruby',
  '.php': 'php',
  '.cs': 'csharp',
  '.cpp': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.hpp': 'cpp',
  '.rs': 'rust',
  '.swift': 'swift',
  '.m': 'objectivec',
  '.scala': 'scala',
  '.r': 'r',
  '.sql': 'sql',
  '.sh': 'shell',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'sass',
  '.vue': 'vue',
  '.dart': 'dart'
};

// Directories to ignore during scanning
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  'dist',
  'build',
  'target',
  'out',
  'bin',
  '__pycache__',
  '.pytest_cache',
  '.venv',
  'venv',
  'env',
  '.idea',
  '.vscode',
  '.DS_Store',
  'coverage',
  '.next',
  '.nuxt',
  'vendor'
]);

// Files to ignore
const IGNORE_FILES = new Set([
  '.gitignore',
  '.dockerignore',
  '.eslintignore',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'Gemfile.lock',
  'Pipfile.lock',
  'poetry.lock'
]);

/**
 * Check if a path exists and is accessible
 */
async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path is a directory
 */
async function isDirectory(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Recursively scan directory and collect file information
 */
async function scanDirectory(dirPath, maxDepth = 10, currentDepth = 0) {
  if (currentDepth >= maxDepth) {
    return [];
  }

  const files = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Skip ignored directories and files
      if (IGNORE_DIRS.has(entry.name) || IGNORE_FILES.has(entry.name)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(fullPath, maxDepth, currentDepth + 1);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const language = LANGUAGE_MAP[ext];
        
        if (language) {
          files.push({
            path: fullPath,
            relativePath: path.relative(dirPath, fullPath),
            name: entry.name,
            extension: ext,
            language,
            directory: path.dirname(fullPath)
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return files;
}

/**
 * Analyze file distribution and primary languages
 */
function analyzeLanguageDistribution(files) {
  const languageCounts = {};
  const languageFiles = {};
  
  for (const file of files) {
    if (!languageCounts[file.language]) {
      languageCounts[file.language] = 0;
      languageFiles[file.language] = [];
    }
    languageCounts[file.language]++;
    languageFiles[file.language].push(file.relativePath);
  }
  
  // Sort languages by file count
  const sortedLanguages = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([lang, count]) => ({
      language: lang,
      fileCount: count,
      percentage: ((count / files.length) * 100).toFixed(1),
      files: languageFiles[lang]
    }));
  
  return {
    totalFiles: files.length,
    languages: sortedLanguages,
    primaryLanguage: sortedLanguages[0]?.language || 'unknown'
  };
}

/**
 * Read file content with size limit
 */
async function readFileContent(filePath, maxSize = 100000) {
  try {
    const stats = await fs.stat(filePath);
    
    // Skip files larger than maxSize (default 100KB)
    if (stats.size > maxSize) {
      return null;
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extract key code elements from files (functions, classes, etc.)
 */
function extractCodeElements(content, language) {
  const elements = {
    functions: [],
    classes: [],
    imports: [],
    exports: []
  };
  
  if (!content) return elements;
  
  try {
    switch (language) {
      case 'javascript':
      case 'typescript':
        // Extract function declarations
        const funcMatches = content.matchAll(/(?:function|const|let|var)\s+(\w+)\s*(?:=\s*)?(?:\([^)]*\)|async)/g);
        for (const match of funcMatches) {
          elements.functions.push(match[1]);
        }
        
        // Extract class declarations
        const classMatches = content.matchAll(/class\s+(\w+)/g);
        for (const match of classMatches) {
          elements.classes.push(match[1]);
        }
        
        // Extract imports
        const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
          elements.imports.push(match[1]);
        }
        break;
        
      case 'python':
        // Extract function definitions
        const pyFuncMatches = content.matchAll(/def\s+(\w+)\s*\(/g);
        for (const match of pyFuncMatches) {
          elements.functions.push(match[1]);
        }
        
        // Extract class definitions
        const pyClassMatches = content.matchAll(/class\s+(\w+)/g);
        for (const match of pyClassMatches) {
          elements.classes.push(match[1]);
        }
        
        // Extract imports
        const pyImportMatches = content.matchAll(/(?:from\s+(\S+)\s+)?import\s+([^#\n]+)/g);
        for (const match of pyImportMatches) {
          elements.imports.push(match[1] || match[2].trim());
        }
        break;
        
      case 'java':
        // Extract method declarations
        const javaMethodMatches = content.matchAll(/(?:public|private|protected)?\s+(?:static\s+)?(?:\w+\s+)+(\w+)\s*\([^)]*\)\s*(?:throws\s+\w+\s*)?{/g);
        for (const match of javaMethodMatches) {
          elements.functions.push(match[1]);
        }
        
        // Extract class declarations
        const javaClassMatches = content.matchAll(/(?:public\s+)?class\s+(\w+)/g);
        for (const match of javaClassMatches) {
          elements.classes.push(match[1]);
        }
        
        // Extract imports
        const javaImportMatches = content.matchAll(/import\s+([^;]+);/g);
        for (const match of javaImportMatches) {
          elements.imports.push(match[1]);
        }
        break;
    }
  } catch (error) {
    console.error('Error extracting code elements:', error.message);
  }
  
  return elements;
}

/**
 * Analyze repository structure and generate summary
 */
async function analyzeRepository(repoPath, options = {}) {
  const {
    maxDepth = 10,
    maxFileSize = 100000,
    includeContent = false,
    maxFilesToAnalyze = 50
  } = options;
  
  // Validate repository path
  if (!await pathExists(repoPath)) {
    throw new Error(`Repository path does not exist: ${repoPath}`);
  }
  
  if (!await isDirectory(repoPath)) {
    throw new Error(`Path is not a directory: ${repoPath}`);
  }
  
  console.log(`Analyzing repository: ${repoPath}`);
  
  // Scan directory structure
  const files = await scanDirectory(repoPath, maxDepth);
  
  if (files.length === 0) {
    throw new Error('No supported source files found in repository');
  }
  
  // Analyze language distribution
  const languageAnalysis = analyzeLanguageDistribution(files);
  
  // Analyze key files (limit to prevent overwhelming the system)
  const filesToAnalyze = files.slice(0, maxFilesToAnalyze);
  const codeElements = {
    functions: new Set(),
    classes: new Set(),
    imports: new Set()
  };
  
  for (const file of filesToAnalyze) {
    const content = await readFileContent(file.path, maxFileSize);
    if (content) {
      const elements = extractCodeElements(content, file.language);
      elements.functions.forEach(f => codeElements.functions.add(f));
      elements.classes.forEach(c => codeElements.classes.add(c));
      elements.imports.forEach(i => codeElements.imports.add(i));
    }
  }
  
  return {
    path: repoPath,
    totalFiles: files.length,
    analyzedFiles: filesToAnalyze.length,
    languages: languageAnalysis.languages,
    primaryLanguage: languageAnalysis.primaryLanguage,
    codeElements: {
      functions: Array.from(codeElements.functions).slice(0, 100),
      classes: Array.from(codeElements.classes).slice(0, 50),
      imports: Array.from(codeElements.imports).slice(0, 50)
    },
    filesByLanguage: languageAnalysis.languages.reduce((acc, lang) => {
      acc[lang.language] = lang.files.slice(0, 20); // Limit files per language
      return acc;
    }, {}),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  scanDirectory,
  analyzeRepository,
  analyzeLanguageDistribution,
  readFileContent,
  extractCodeElements,
  pathExists,
  isDirectory,
  LANGUAGE_MAP
};

// Made with Bob

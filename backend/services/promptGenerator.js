/**
 * Dynamic Prompt Generation Module
 * Generates context-aware prompts based on detected project type, language, and framework
 */

/**
 * Language-specific code generation templates
 */
const LANGUAGE_TEMPLATES = {
  javascript: {
    name: 'JavaScript',
    fileExtension: '.js',
    commentStyle: '//',
    conventions: [
      'Use camelCase for variables and functions',
      'Use PascalCase for classes and components',
      'Use const for immutable values, let for mutable',
      'Prefer arrow functions for callbacks',
      'Use async/await for asynchronous operations'
    ],
    bestPractices: [
      'Handle errors appropriately',
      'Add JSDoc comments for functions',
      'Use meaningful variable names',
      'Keep functions small and focused'
    ]
  },
  
  typescript: {
    name: 'TypeScript',
    fileExtension: '.ts',
    commentStyle: '//',
    conventions: [
      'Use camelCase for variables and functions',
      'Use PascalCase for classes, interfaces, and types',
      'Define explicit types for function parameters and return values',
      'Use interfaces for object shapes',
      'Prefer type inference where obvious'
    ],
    bestPractices: [
      'Use strict type checking',
      'Avoid using "any" type',
      'Define interfaces for complex objects',
      'Use generics for reusable components'
    ]
  },
  
  python: {
    name: 'Python',
    fileExtension: '.py',
    commentStyle: '#',
    conventions: [
      'Use snake_case for variables and functions',
      'Use PascalCase for classes',
      'Use UPPER_CASE for constants',
      'Follow PEP 8 style guide',
      'Use 4 spaces for indentation'
    ],
    bestPractices: [
      'Add docstrings to functions and classes',
      'Use type hints for function signatures',
      'Handle exceptions with try-except blocks',
      'Use list comprehensions where appropriate'
    ]
  },
  
  java: {
    name: 'Java',
    fileExtension: '.java',
    commentStyle: '//',
    conventions: [
      'Use camelCase for variables and methods',
      'Use PascalCase for classes and interfaces',
      'Use UPPER_CASE for constants',
      'One class per file',
      'Follow Java naming conventions'
    ],
    bestPractices: [
      'Use proper access modifiers (private, public, protected)',
      'Add Javadoc comments for public methods',
      'Handle exceptions appropriately',
      'Use interfaces for abstraction',
      'Follow SOLID principles'
    ]
  },
  
  go: {
    name: 'Go',
    fileExtension: '.go',
    commentStyle: '//',
    conventions: [
      'Use camelCase for unexported names',
      'Use PascalCase for exported names',
      'Keep package names short and lowercase',
      'Use gofmt for formatting',
      'Error handling with explicit checks'
    ],
    bestPractices: [
      'Return errors explicitly',
      'Use defer for cleanup',
      'Keep functions small',
      'Use interfaces for abstraction'
    ]
  },
  
  ruby: {
    name: 'Ruby',
    fileExtension: '.rb',
    commentStyle: '#',
    conventions: [
      'Use snake_case for variables and methods',
      'Use PascalCase for classes and modules',
      'Use UPPER_CASE for constants',
      'Use 2 spaces for indentation',
      'Prefer symbols over strings for keys'
    ],
    bestPractices: [
      'Use blocks and iterators',
      'Follow Ruby style guide',
      'Use meaningful method names',
      'Keep methods short'
    ]
  },
  
  php: {
    name: 'PHP',
    fileExtension: '.php',
    commentStyle: '//',
    conventions: [
      'Use camelCase for methods',
      'Use PascalCase for classes',
      'Use snake_case for variables (Laravel convention)',
      'Start with <?php tag',
      'Use namespaces for organization'
    ],
    bestPractices: [
      'Use type declarations',
      'Handle exceptions properly',
      'Use PSR standards',
      'Validate user input'
    ]
  }
};

/**
 * Framework-specific templates
 */
const FRAMEWORK_TEMPLATES = {
  'React': {
    conventions: [
      'Use functional components with hooks',
      'Use PascalCase for component names',
      'Keep components small and focused',
      'Use props for data passing',
      'Use state for component-local data'
    ],
    patterns: [
      'useState for local state',
      'useEffect for side effects',
      'useContext for global state',
      'Custom hooks for reusable logic'
    ]
  },
  
  'Vue.js': {
    conventions: [
      'Use PascalCase for component names',
      'Use kebab-case in templates',
      'Use Composition API for new code',
      'Keep components focused',
      'Use props for parent-child communication'
    ],
    patterns: [
      'ref() for reactive state',
      'computed() for derived state',
      'watch() for side effects',
      'emit() for child-parent communication'
    ]
  },
  
  'Django': {
    conventions: [
      'Follow Django project structure',
      'Use models for database schema',
      'Use views for business logic',
      'Use templates for presentation',
      'Use URL patterns for routing'
    ],
    patterns: [
      'Class-based views for complex logic',
      'Function-based views for simple cases',
      'Django ORM for database queries',
      'Forms for data validation'
    ]
  },
  
  'Flask': {
    conventions: [
      'Use blueprints for organization',
      'Use decorators for routes',
      'Keep routes simple',
      'Use SQLAlchemy for database',
      'Use Jinja2 for templates'
    ],
    patterns: [
      '@app.route() for routing',
      'request object for input',
      'jsonify() for JSON responses',
      'Blueprint for modular apps'
    ]
  },
  
  'Spring Boot': {
    conventions: [
      'Use annotations for configuration',
      'Follow layered architecture',
      'Use dependency injection',
      'Keep controllers thin',
      'Use services for business logic'
    ],
    patterns: [
      '@RestController for REST APIs',
      '@Service for business logic',
      '@Repository for data access',
      '@Autowired for dependency injection'
    ]
  },
  
  'Express.js': {
    conventions: [
      'Use middleware for common logic',
      'Keep routes organized',
      'Use async/await for async operations',
      'Handle errors with middleware',
      'Use routers for modularity'
    ],
    patterns: [
      'app.use() for middleware',
      'Router() for route organization',
      'next() for middleware chaining',
      'Error handling middleware'
    ]
  }
};

/**
 * Generate context-aware prompt for code generation
 */
function generateCodePrompt(intent, projectAnalysis, repoContext = '') {
  const { primaryLanguage, frameworks, codeElements } = projectAnalysis;
  
  // Get language template
  const langTemplate = LANGUAGE_TEMPLATES[primaryLanguage] || LANGUAGE_TEMPLATES.javascript;
  
  // Get framework template if applicable
  const primaryFramework = frameworks && frameworks.length > 0 ? frameworks[0] : null;
  const frameworkTemplate = primaryFramework ? FRAMEWORK_TEMPLATES[primaryFramework] : null;
  
  // Build conventions section
  let conventionsText = langTemplate.conventions.join('\n- ');
  if (frameworkTemplate && frameworkTemplate.conventions) {
    conventionsText += '\n\nFramework-specific conventions:\n- ' + frameworkTemplate.conventions.join('\n- ');
  }
  
  // Build patterns section
  let patternsText = '';
  if (frameworkTemplate && frameworkTemplate.patterns) {
    patternsText = '\n\nCommon patterns:\n- ' + frameworkTemplate.patterns.join('\n- ');
  }
  
  // Build existing code elements section
  let codeElementsText = '';
  if (codeElements) {
    if (codeElements.functions && codeElements.functions.length > 0) {
      codeElementsText += `\n\nExisting functions in codebase:\n${codeElements.functions.slice(0, 20).join(', ')}`;
    }
    if (codeElements.classes && codeElements.classes.length > 0) {
      codeElementsText += `\n\nExisting classes in codebase:\n${codeElements.classes.slice(0, 20).join(', ')}`;
    }
  }
  
  // Build repository context section
  let repoContextText = '';
  if (repoContext && repoContext.trim()) {
    repoContextText = `\n\nAdditional codebase context:\n${repoContext.substring(0, 3000)}`;
  }
  
  // Generate the prompt
  const prompt = `You are an expert ${langTemplate.name} developer${primaryFramework ? ` working with ${primaryFramework}` : ''}.

The developer wants to: ${intent}

Project Information:
- Primary Language: ${langTemplate.name}
${primaryFramework ? `- Framework: ${primaryFramework}` : ''}
- File Extension: ${langTemplate.fileExtension}
${codeElementsText}${repoContextText}

Coding Conventions:
- ${conventionsText}

Best Practices:
- ${langTemplate.bestPractices.join('\n- ')}
${patternsText}

Important Instructions:
1. Write ONLY the code - no explanations, no markdown formatting
2. Follow the project's conventions and patterns
3. Use existing functions/classes where appropriate
4. Keep the code clean, readable, and well-structured
5. Add appropriate comments using ${langTemplate.commentStyle}
6. Handle errors appropriately
7. Make the code production-ready

Generate the ${langTemplate.name} code:`;

  return prompt;
}

/**
 * Generate explanation prompt
 */
function generateExplanationPrompt(code, intent, language) {
  const langTemplate = LANGUAGE_TEMPLATES[language] || LANGUAGE_TEMPLATES.javascript;
  
  return `You are explaining code to a developer.

What the code does: ${intent}

Language: ${langTemplate.name}

Your task: Write EXACTLY 2 sentences in simple English explaining what this code does.

CRITICAL RULES:
- Write EXACTLY 2 sentences only
- Stop immediately after the second sentence ends with a full stop
- Use simple, everyday language
- Explain the purpose, not implementation details
- Do NOT write code
- Do NOT use overly technical jargon
- Do NOT include any code snippets
- Do NOT repeat any phrase
- Maximum 60 words total
- Each sentence must end with a full stop

Explanation:`;
}

/**
 * Generate context summary from project analysis
 */
function generateContextSummary(projectAnalysis) {
  const { 
    primaryLanguage, 
    languages, 
    frameworks, 
    totalFiles,
    codeElements,
    projectStructure 
  } = projectAnalysis;
  
  let summary = `# Project Analysis Summary\n\n`;
  summary += `## Overview\n`;
  summary += `- Total Files: ${totalFiles}\n`;
  summary += `- Primary Language: ${primaryLanguage}\n`;
  
  if (languages && languages.length > 0) {
    summary += `\n## Languages:\n`;
    languages.forEach(lang => {
      summary += `- ${lang.language}: ${lang.fileCount} files (${lang.percentage}%)\n`;
    });
  }
  
  if (frameworks && frameworks.length > 0) {
    summary += `\n## Frameworks & Libraries:\n`;
    frameworks.forEach(fw => {
      summary += `- ${fw}\n`;
    });
  }
  
  if (projectStructure) {
    summary += `\n## Project Structure:\n`;
    if (projectStructure.isMonorepo) summary += `- Monorepo structure detected\n`;
    if (projectStructure.hasBackend) summary += `- Backend/API directory present\n`;
    if (projectStructure.hasFrontend) summary += `- Frontend/Client directory present\n`;
  }
  
  if (codeElements) {
    if (codeElements.functions && codeElements.functions.length > 0) {
      summary += `\n## Key Functions:\n`;
      codeElements.functions.slice(0, 15).forEach(fn => {
        summary += `- ${fn}\n`;
      });
    }
    
    if (codeElements.classes && codeElements.classes.length > 0) {
      summary += `\n## Key Classes:\n`;
      codeElements.classes.slice(0, 10).forEach(cls => {
        summary += `- ${cls}\n`;
      });
    }
  }
  
  return summary;
}

/**
 * Get language-specific code cleaning patterns
 */
function getCleaningPatterns(language) {
  const patterns = {
    javascript: [
      // Remove common re-declarations
      /const\s+\w+\s*=\s*require\([^)]+\);?\s*/g,
      /import\s+.*?from\s+['"][^'"]+['"];?\s*/g
    ],
    python: [
      // Remove import statements
      /^import\s+.*$/gm,
      /^from\s+.*?import\s+.*$/gm
    ],
    java: [
      // Remove import statements
      /^import\s+.*?;$/gm,
      /^package\s+.*?;$/gm
    ]
  };
  
  return patterns[language] || [];
}

module.exports = {
  generateCodePrompt,
  generateExplanationPrompt,
  generateContextSummary,
  getCleaningPatterns,
  LANGUAGE_TEMPLATES,
  FRAMEWORK_TEMPLATES
};

// Made with Bob

/**
 * Supported Technologies Configuration
 * Defines all programming languages, frameworks, and tools that Mother Tongue can work with
 */

const SUPPORTED_LANGUAGES = {
  javascript: {
    name: 'JavaScript',
    extensions: ['.js', '.mjs', '.cjs'],
    category: 'web',
    description: 'Dynamic programming language for web development',
    popularity: 'very-high',
    frameworks: ['React', 'Vue.js', 'Angular', 'Express.js', 'Next.js', 'Nuxt.js', 'Svelte']
  },
  
  typescript: {
    name: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    category: 'web',
    description: 'Typed superset of JavaScript',
    popularity: 'very-high',
    frameworks: ['React', 'Angular', 'NestJS', 'Next.js']
  },
  
  python: {
    name: 'Python',
    extensions: ['.py'],
    category: 'general',
    description: 'High-level programming language for various applications',
    popularity: 'very-high',
    frameworks: ['Django', 'Flask', 'FastAPI', 'Tornado', 'Pyramid']
  },
  
  java: {
    name: 'Java',
    extensions: ['.java'],
    category: 'enterprise',
    description: 'Object-oriented programming language for enterprise applications',
    popularity: 'very-high',
    frameworks: ['Spring Boot', 'Spring Framework', 'Hibernate', 'Jakarta EE']
  },
  
  go: {
    name: 'Go',
    extensions: ['.go'],
    category: 'systems',
    description: 'Statically typed language designed for simplicity and efficiency',
    popularity: 'high',
    frameworks: ['Gin', 'Echo', 'Gorilla Mux', 'Fiber']
  },
  
  ruby: {
    name: 'Ruby',
    extensions: ['.rb'],
    category: 'web',
    description: 'Dynamic programming language focused on simplicity',
    popularity: 'medium',
    frameworks: ['Ruby on Rails', 'Sinatra', 'Hanami']
  },
  
  php: {
    name: 'PHP',
    extensions: ['.php'],
    category: 'web',
    description: 'Server-side scripting language for web development',
    popularity: 'high',
    frameworks: ['Laravel', 'Symfony', 'CakePHP', 'CodeIgniter']
  },
  
  csharp: {
    name: 'C#',
    extensions: ['.cs'],
    category: 'enterprise',
    description: 'Modern object-oriented language for .NET platform',
    popularity: 'high',
    frameworks: ['ASP.NET Core', '.NET', 'Entity Framework']
  },
  
  kotlin: {
    name: 'Kotlin',
    extensions: ['.kt', '.kts'],
    category: 'mobile',
    description: 'Modern language for Android and JVM',
    popularity: 'high',
    frameworks: ['Spring Boot', 'Ktor', 'Android SDK']
  },
  
  swift: {
    name: 'Swift',
    extensions: ['.swift'],
    category: 'mobile',
    description: 'Modern language for iOS and macOS development',
    popularity: 'high',
    frameworks: ['SwiftUI', 'UIKit', 'Vapor']
  },
  
  rust: {
    name: 'Rust',
    extensions: ['.rs'],
    category: 'systems',
    description: 'Systems programming language focused on safety and performance',
    popularity: 'medium',
    frameworks: ['Actix', 'Rocket', 'Tokio']
  },
  
  cpp: {
    name: 'C++',
    extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
    category: 'systems',
    description: 'High-performance systems programming language',
    popularity: 'high',
    frameworks: ['Qt', 'Boost', 'STL']
  },
  
  c: {
    name: 'C',
    extensions: ['.c', '.h'],
    category: 'systems',
    description: 'Low-level programming language',
    popularity: 'high',
    frameworks: []
  }
};

const SUPPORTED_FRAMEWORKS = {
  // JavaScript/TypeScript Frameworks
  'React': {
    language: 'javascript',
    category: 'frontend',
    description: 'JavaScript library for building user interfaces',
    popularity: 'very-high',
    conventions: ['Functional components', 'Hooks', 'JSX']
  },
  
  'Vue.js': {
    language: 'javascript',
    category: 'frontend',
    description: 'Progressive JavaScript framework',
    popularity: 'high',
    conventions: ['Single File Components', 'Composition API', 'Reactive data']
  },
  
  'Angular': {
    language: 'typescript',
    category: 'frontend',
    description: 'Platform for building web applications',
    popularity: 'high',
    conventions: ['Components', 'Services', 'Dependency Injection']
  },
  
  'Next.js': {
    language: 'javascript',
    category: 'fullstack',
    description: 'React framework for production',
    popularity: 'very-high',
    conventions: ['Server-side rendering', 'API routes', 'File-based routing']
  },
  
  'Express.js': {
    language: 'javascript',
    category: 'backend',
    description: 'Fast, unopinionated web framework for Node.js',
    popularity: 'very-high',
    conventions: ['Middleware', 'Routing', 'REST APIs']
  },
  
  'NestJS': {
    language: 'typescript',
    category: 'backend',
    description: 'Progressive Node.js framework',
    popularity: 'high',
    conventions: ['Decorators', 'Dependency Injection', 'Modular architecture']
  },
  
  // Python Frameworks
  'Django': {
    language: 'python',
    category: 'fullstack',
    description: 'High-level Python web framework',
    popularity: 'very-high',
    conventions: ['MVT pattern', 'ORM', 'Admin interface']
  },
  
  'Flask': {
    language: 'python',
    category: 'backend',
    description: 'Lightweight WSGI web application framework',
    popularity: 'high',
    conventions: ['Blueprints', 'Decorators', 'Jinja2 templates']
  },
  
  'FastAPI': {
    language: 'python',
    category: 'backend',
    description: 'Modern, fast web framework for building APIs',
    popularity: 'high',
    conventions: ['Type hints', 'Async/await', 'Automatic documentation']
  },
  
  // Java Frameworks
  'Spring Boot': {
    language: 'java',
    category: 'fullstack',
    description: 'Framework for building production-ready applications',
    popularity: 'very-high',
    conventions: ['Annotations', 'Dependency Injection', 'Auto-configuration']
  },
  
  'Spring Framework': {
    language: 'java',
    category: 'backend',
    description: 'Comprehensive framework for enterprise Java',
    popularity: 'very-high',
    conventions: ['IoC container', 'AOP', 'MVC']
  },
  
  // Ruby Frameworks
  'Ruby on Rails': {
    language: 'ruby',
    category: 'fullstack',
    description: 'Server-side web application framework',
    popularity: 'medium',
    conventions: ['Convention over configuration', 'MVC', 'Active Record']
  },
  
  // PHP Frameworks
  'Laravel': {
    language: 'php',
    category: 'fullstack',
    description: 'PHP framework for web artisans',
    popularity: 'very-high',
    conventions: ['Eloquent ORM', 'Blade templates', 'Artisan CLI']
  },
  
  'Symfony': {
    language: 'php',
    category: 'fullstack',
    description: 'PHP framework for web applications',
    popularity: 'high',
    conventions: ['Bundles', 'Services', 'Twig templates']
  },
  
  // Go Frameworks
  'Gin': {
    language: 'go',
    category: 'backend',
    description: 'HTTP web framework for Go',
    popularity: 'high',
    conventions: ['Middleware', 'Routing', 'JSON validation']
  }
};

const PROJECT_TYPES = {
  'frontend': {
    description: 'Client-side web application',
    commonFiles: ['index.html', 'package.json', 'webpack.config.js', 'vite.config.js'],
    commonDirs: ['src', 'public', 'components', 'pages']
  },
  
  'backend': {
    description: 'Server-side application or API',
    commonFiles: ['server.js', 'app.py', 'main.go', 'pom.xml'],
    commonDirs: ['routes', 'controllers', 'models', 'services', 'api']
  },
  
  'fullstack': {
    description: 'Combined frontend and backend application',
    commonFiles: ['package.json', 'next.config.js'],
    commonDirs: ['client', 'server', 'frontend', 'backend', 'api', 'pages']
  },
  
  'mobile': {
    description: 'Mobile application',
    commonFiles: ['AndroidManifest.xml', 'Info.plist', 'app.json'],
    commonDirs: ['android', 'ios', 'app', 'src']
  },
  
  'library': {
    description: 'Reusable code library or package',
    commonFiles: ['setup.py', 'package.json', 'pom.xml', 'Cargo.toml'],
    commonDirs: ['lib', 'src', 'dist']
  },
  
  'monorepo': {
    description: 'Multiple projects in one repository',
    commonFiles: ['lerna.json', 'nx.json', 'pnpm-workspace.yaml'],
    commonDirs: ['packages', 'apps', 'libs', 'modules']
  }
};

/**
 * Get language information by name
 */
function getLanguageInfo(languageName) {
  return SUPPORTED_LANGUAGES[languageName.toLowerCase()] || null;
}

/**
 * Get framework information by name
 */
function getFrameworkInfo(frameworkName) {
  return SUPPORTED_FRAMEWORKS[frameworkName] || null;
}

/**
 * Get all supported languages
 */
function getAllLanguages() {
  return Object.keys(SUPPORTED_LANGUAGES);
}

/**
 * Get all supported frameworks
 */
function getAllFrameworks() {
  return Object.keys(SUPPORTED_FRAMEWORKS);
}

/**
 * Get frameworks for a specific language
 */
function getFrameworksForLanguage(languageName) {
  const lang = getLanguageInfo(languageName);
  return lang ? lang.frameworks : [];
}

/**
 * Check if a language is supported
 */
function isLanguageSupported(languageName) {
  return languageName.toLowerCase() in SUPPORTED_LANGUAGES;
}

/**
 * Check if a framework is supported
 */
function isFrameworkSupported(frameworkName) {
  return frameworkName in SUPPORTED_FRAMEWORKS;
}

module.exports = {
  SUPPORTED_LANGUAGES,
  SUPPORTED_FRAMEWORKS,
  PROJECT_TYPES,
  getLanguageInfo,
  getFrameworkInfo,
  getAllLanguages,
  getAllFrameworks,
  getFrameworksForLanguage,
  isLanguageSupported,
  isFrameworkSupported
};

// Made with Bob

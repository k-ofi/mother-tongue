const fs = require('fs').promises;
const path = require('path');
const { pathExists } = require('./fileAnalyzer');

/**
 * Framework Detection Module
 * Detects frameworks, libraries, and project types by analyzing manifest files
 */

/**
 * Parse package.json for Node.js/JavaScript projects
 */
async function parsePackageJson(repoPath) {
  const packagePath = path.join(repoPath, 'package.json');
  
  if (!await pathExists(packagePath)) {
    return null;
  }
  
  try {
    const content = await fs.readFile(packagePath, 'utf-8');
    const packageData = JSON.parse(content);
    
    const dependencies = {
      ...packageData.dependencies,
      ...packageData.devDependencies
    };
    
    // Detect frameworks
    const frameworks = [];
    
    if (dependencies['react'] || dependencies['react-dom']) {
      frameworks.push('React');
    }
    if (dependencies['vue']) {
      frameworks.push('Vue.js');
    }
    if (dependencies['@angular/core']) {
      frameworks.push('Angular');
    }
    if (dependencies['next']) {
      frameworks.push('Next.js');
    }
    if (dependencies['nuxt']) {
      frameworks.push('Nuxt.js');
    }
    if (dependencies['express']) {
      frameworks.push('Express.js');
    }
    if (dependencies['fastify']) {
      frameworks.push('Fastify');
    }
    if (dependencies['koa']) {
      frameworks.push('Koa');
    }
    if (dependencies['nest']) {
      frameworks.push('NestJS');
    }
    if (dependencies['svelte']) {
      frameworks.push('Svelte');
    }
    
    // Detect testing frameworks
    const testingFrameworks = [];
    if (dependencies['jest']) testingFrameworks.push('Jest');
    if (dependencies['mocha']) testingFrameworks.push('Mocha');
    if (dependencies['vitest']) testingFrameworks.push('Vitest');
    if (dependencies['cypress']) testingFrameworks.push('Cypress');
    
    // Detect build tools
    const buildTools = [];
    if (dependencies['webpack']) buildTools.push('Webpack');
    if (dependencies['vite']) buildTools.push('Vite');
    if (dependencies['rollup']) buildTools.push('Rollup');
    if (dependencies['parcel']) buildTools.push('Parcel');
    
    // Detect TypeScript
    const hasTypeScript = dependencies['typescript'] !== undefined;
    
    return {
      name: packageData.name,
      version: packageData.version,
      description: packageData.description,
      frameworks,
      testingFrameworks,
      buildTools,
      hasTypeScript,
      dependencies: Object.keys(dependencies),
      scripts: packageData.scripts || {},
      type: packageData.type || 'commonjs'
    };
  } catch (error) {
    console.error('Error parsing package.json:', error.message);
    return null;
  }
}

/**
 * Parse requirements.txt for Python projects
 */
async function parseRequirementsTxt(repoPath) {
  const reqPath = path.join(repoPath, 'requirements.txt');
  
  if (!await pathExists(reqPath)) {
    return null;
  }
  
  try {
    const content = await fs.readFile(reqPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    const dependencies = lines.map(line => {
      const match = line.match(/^([a-zA-Z0-9_-]+)/);
      return match ? match[1].toLowerCase() : null;
    }).filter(Boolean);
    
    // Detect frameworks
    const frameworks = [];
    
    if (dependencies.includes('django')) {
      frameworks.push('Django');
    }
    if (dependencies.includes('flask')) {
      frameworks.push('Flask');
    }
    if (dependencies.includes('fastapi')) {
      frameworks.push('FastAPI');
    }
    if (dependencies.includes('tornado')) {
      frameworks.push('Tornado');
    }
    if (dependencies.includes('pyramid')) {
      frameworks.push('Pyramid');
    }
    if (dependencies.includes('numpy')) {
      frameworks.push('NumPy');
    }
    if (dependencies.includes('pandas')) {
      frameworks.push('Pandas');
    }
    if (dependencies.includes('tensorflow')) {
      frameworks.push('TensorFlow');
    }
    if (dependencies.includes('pytorch') || dependencies.includes('torch')) {
      frameworks.push('PyTorch');
    }
    
    return {
      frameworks,
      dependencies
    };
  } catch (error) {
    console.error('Error parsing requirements.txt:', error.message);
    return null;
  }
}

/**
 * Parse pom.xml for Java/Maven projects
 */
async function parsePomXml(repoPath) {
  const pomPath = path.join(repoPath, 'pom.xml');
  
  if (!await pathExists(pomPath)) {
    return null;
  }
  
  try {
    const content = await fs.readFile(pomPath, 'utf-8');
    
    // Simple XML parsing for common frameworks
    const frameworks = [];
    
    if (content.includes('spring-boot')) {
      frameworks.push('Spring Boot');
    } else if (content.includes('springframework')) {
      frameworks.push('Spring Framework');
    }
    
    if (content.includes('hibernate')) {
      frameworks.push('Hibernate');
    }
    if (content.includes('junit')) {
      frameworks.push('JUnit');
    }
    if (content.includes('maven')) {
      frameworks.push('Maven');
    }
    
    // Extract artifact ID
    const artifactMatch = content.match(/<artifactId>([^<]+)<\/artifactId>/);
    const groupMatch = content.match(/<groupId>([^<]+)<\/groupId>/);
    const versionMatch = content.match(/<version>([^<]+)<\/version>/);
    
    return {
      artifactId: artifactMatch ? artifactMatch[1] : null,
      groupId: groupMatch ? groupMatch[1] : null,
      version: versionMatch ? versionMatch[1] : null,
      frameworks,
      buildTool: 'Maven'
    };
  } catch (error) {
    console.error('Error parsing pom.xml:', error.message);
    return null;
  }
}

/**
 * Parse build.gradle for Java/Gradle projects
 */
async function parseBuildGradle(repoPath) {
  const gradlePath = path.join(repoPath, 'build.gradle');
  const gradleKtsPath = path.join(repoPath, 'build.gradle.kts');
  
  let filePath = null;
  if (await pathExists(gradlePath)) {
    filePath = gradlePath;
  } else if (await pathExists(gradleKtsPath)) {
    filePath = gradleKtsPath;
  }
  
  if (!filePath) {
    return null;
  }
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    const frameworks = [];
    
    if (content.includes('spring-boot')) {
      frameworks.push('Spring Boot');
    } else if (content.includes('springframework')) {
      frameworks.push('Spring Framework');
    }
    
    if (content.includes('hibernate')) {
      frameworks.push('Hibernate');
    }
    if (content.includes('junit')) {
      frameworks.push('JUnit');
    }
    if (content.includes('kotlin')) {
      frameworks.push('Kotlin');
    }
    
    return {
      frameworks,
      buildTool: 'Gradle'
    };
  } catch (error) {
    console.error('Error parsing build.gradle:', error.message);
    return null;
  }
}

/**
 * Parse Gemfile for Ruby projects
 */
async function parseGemfile(repoPath) {
  const gemfilePath = path.join(repoPath, 'Gemfile');
  
  if (!await pathExists(gemfilePath)) {
    return null;
  }
  
  try {
    const content = await fs.readFile(gemfilePath, 'utf-8');
    
    const frameworks = [];
    
    if (content.includes('rails')) {
      frameworks.push('Ruby on Rails');
    }
    if (content.includes('sinatra')) {
      frameworks.push('Sinatra');
    }
    if (content.includes('rspec')) {
      frameworks.push('RSpec');
    }
    
    return {
      frameworks
    };
  } catch (error) {
    console.error('Error parsing Gemfile:', error.message);
    return null;
  }
}

/**
 * Parse composer.json for PHP projects
 */
async function parseComposerJson(repoPath) {
  const composerPath = path.join(repoPath, 'composer.json');
  
  if (!await pathExists(composerPath)) {
    return null;
  }
  
  try {
    const content = await fs.readFile(composerPath, 'utf-8');
    const composerData = JSON.parse(content);
    
    const dependencies = {
      ...composerData.require,
      ...composerData['require-dev']
    };
    
    const frameworks = [];
    
    if (dependencies['laravel/framework']) {
      frameworks.push('Laravel');
    }
    if (dependencies['symfony/symfony']) {
      frameworks.push('Symfony');
    }
    if (dependencies['cakephp/cakephp']) {
      frameworks.push('CakePHP');
    }
    if (dependencies['phpunit/phpunit']) {
      frameworks.push('PHPUnit');
    }
    
    return {
      name: composerData.name,
      frameworks,
      dependencies: Object.keys(dependencies)
    };
  } catch (error) {
    console.error('Error parsing composer.json:', error.message);
    return null;
  }
}

/**
 * Parse go.mod for Go projects
 */
async function parseGoMod(repoPath) {
  const goModPath = path.join(repoPath, 'go.mod');
  
  if (!await pathExists(goModPath)) {
    return null;
  }
  
  try {
    const content = await fs.readFile(goModPath, 'utf-8');
    
    const frameworks = [];
    
    if (content.includes('gin-gonic/gin')) {
      frameworks.push('Gin');
    }
    if (content.includes('gorilla/mux')) {
      frameworks.push('Gorilla Mux');
    }
    if (content.includes('echo')) {
      frameworks.push('Echo');
    }
    
    const moduleMatch = content.match(/module\s+([^\s]+)/);
    
    return {
      module: moduleMatch ? moduleMatch[1] : null,
      frameworks
    };
  } catch (error) {
    console.error('Error parsing go.mod:', error.message);
    return null;
  }
}

/**
 * Detect project type based on directory structure
 */
async function detectProjectStructure(repoPath) {
  const structure = {
    hasBackend: false,
    hasFrontend: false,
    isMonorepo: false,
    directories: []
  };
  
  try {
    const entries = await fs.readdir(repoPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirName = entry.name.toLowerCase();
        structure.directories.push(dirName);
        
        if (['backend', 'server', 'api', 'services'].includes(dirName)) {
          structure.hasBackend = true;
        }
        if (['frontend', 'client', 'web', 'ui', 'app'].includes(dirName)) {
          structure.hasFrontend = true;
        }
        if (['packages', 'apps', 'libs', 'modules'].includes(dirName)) {
          structure.isMonorepo = true;
        }
      }
    }
  } catch (error) {
    console.error('Error detecting project structure:', error.message);
  }
  
  return structure;
}

/**
 * Comprehensive framework detection
 */
async function detectFrameworks(repoPath) {
  const results = {
    javascript: await parsePackageJson(repoPath),
    python: await parseRequirementsTxt(repoPath),
    javaMaven: await parsePomXml(repoPath),
    javaGradle: await parseBuildGradle(repoPath),
    ruby: await parseGemfile(repoPath),
    php: await parseComposerJson(repoPath),
    go: await parseGoMod(repoPath),
    structure: await detectProjectStructure(repoPath)
  };
  
  // Aggregate all detected frameworks
  const allFrameworks = [];
  const allDependencies = [];
  
  Object.values(results).forEach(result => {
    if (result && result.frameworks) {
      allFrameworks.push(...result.frameworks);
    }
    if (result && result.dependencies) {
      allDependencies.push(...result.dependencies);
    }
  });
  
  // Determine primary framework/stack
  let primaryStack = 'Unknown';
  
  if (results.javascript) {
    if (results.javascript.frameworks.includes('React')) {
      primaryStack = 'React';
    } else if (results.javascript.frameworks.includes('Vue.js')) {
      primaryStack = 'Vue.js';
    } else if (results.javascript.frameworks.includes('Angular')) {
      primaryStack = 'Angular';
    } else if (results.javascript.frameworks.includes('Next.js')) {
      primaryStack = 'Next.js';
    } else if (results.javascript.frameworks.includes('Express.js')) {
      primaryStack = 'Node.js/Express';
    } else if (results.javascript.frameworks.includes('NestJS')) {
      primaryStack = 'NestJS';
    } else {
      primaryStack = 'Node.js';
    }
  } else if (results.python) {
    if (results.python.frameworks.includes('Django')) {
      primaryStack = 'Django';
    } else if (results.python.frameworks.includes('Flask')) {
      primaryStack = 'Flask';
    } else if (results.python.frameworks.includes('FastAPI')) {
      primaryStack = 'FastAPI';
    } else {
      primaryStack = 'Python';
    }
  } else if (results.javaMaven || results.javaGradle) {
    const javaResult = results.javaMaven || results.javaGradle;
    if (javaResult.frameworks.includes('Spring Boot')) {
      primaryStack = 'Spring Boot';
    } else if (javaResult.frameworks.includes('Spring Framework')) {
      primaryStack = 'Spring Framework';
    } else {
      primaryStack = 'Java';
    }
  } else if (results.ruby) {
    if (results.ruby.frameworks.includes('Ruby on Rails')) {
      primaryStack = 'Ruby on Rails';
    } else {
      primaryStack = 'Ruby';
    }
  } else if (results.php) {
    if (results.php.frameworks.includes('Laravel')) {
      primaryStack = 'Laravel';
    } else if (results.php.frameworks.includes('Symfony')) {
      primaryStack = 'Symfony';
    } else {
      primaryStack = 'PHP';
    }
  } else if (results.go) {
    primaryStack = 'Go';
  }
  
  return {
    primaryStack,
    frameworks: [...new Set(allFrameworks)],
    dependencies: [...new Set(allDependencies)],
    manifests: results,
    projectStructure: results.structure
  };
}

module.exports = {
  detectFrameworks,
  parsePackageJson,
  parseRequirementsTxt,
  parsePomXml,
  parseBuildGradle,
  parseGemfile,
  parseComposerJson,
  parseGoMod,
  detectProjectStructure
};

// Made with Bob

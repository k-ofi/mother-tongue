# Dynamic Repository Features — Mother-Tongue

> **What changed:** Mother-Tongue can now analyze *any* project on your machine and generate code that fits that specific codebase — instead of always targeting a hardcoded GPA calculator.

---

## Overview

The system now has two modes of operation:

| Mode | When | How |
|------|------|-----|
| **Generic** | No repo path given | Uses language best-practices prompt only |
| **Context-Aware** | Repo path scanned ✅ | Analyzes your project's files, language, frameworks, and existing code elements |

---

## New Backend Modules

### 1. `backend/services/fileAnalyzer.js`
Scans a directory recursively and returns:
- Total file count
- Primary programming language (by file count)
- All detected languages with percentages
- Extracted code elements (function names, class names) from source files

**Key function:**
```js
analyzeRepository(repoPath, options) → Promise<FileAnalysis>
```

---

### 2. `backend/services/frameworkDetector.js`
Reads manifest files (`package.json`, `requirements.txt`, `pom.xml`, `go.mod`, etc.) and detects:
- Primary framework stack (e.g. `React`, `Express.js`, `Django`)
- All dependencies
- Project structure (monorepo, has-backend, has-frontend, TypeScript, build tools)

**Key function:**
```js
detectFrameworks(repoPath) → Promise<FrameworkAnalysis>
```

---

### 3. `backend/services/promptGenerator.js`
Generates dynamic prompts based on the detected project type instead of using hardcoded text.

**Key functions:**
```js
generateCodePrompt(intent, projectAnalysis, repoContext) → string
generateExplanationPrompt(code, intent, language) → string
generateContextSummary(projectAnalysis) → string
getCleaningPatterns(language) → RegExp[]
```

Supports language-specific conventions for: `JavaScript`, `TypeScript`, `Python`, `Java`, `Go`, `Ruby`, `PHP`

---

### 4. `backend/services/repositoryAnalyzer.js`
Ties everything together — combines file analysis + framework detection + context generation. Includes a **5-minute in-memory cache** to avoid re-scanning unchanged repos.

**Key functions:**
```js
getCachedAnalysis(repoPath) → Promise<CombinedAnalysis>
validateRepositoryPath(repoPath) → { valid, path, error }
getProjectDescription(analysis) → string   // e.g. "Full-stack Express.js project (JavaScript)"
```

---

### 5. `backend/config/supportedTechnologies.js`
Central configuration file listing all supported programming languages and frameworks.

**Supported Programming Languages:**
- JavaScript, TypeScript, Python, Java, Go, Ruby, PHP, C#, Kotlin, Swift, Rust, C++, C

**Supported Frameworks:**
- React, Vue.js, Angular, Next.js, Express.js, NestJS *(JS/TS)*
- Django, Flask, FastAPI *(Python)*
- Spring Boot, Spring Framework *(Java)*
- Ruby on Rails *(Ruby)*
- Laravel, Symfony *(PHP)*
- Gin *(Go)*

**Adding a new language** — edit `SUPPORTED_LANGUAGES` in `supportedTechnologies.js`:
```js
myLang: {
  name: 'MyLanguage',
  extensions: ['.ml'],
  category: 'general',
  description: 'Description here',
  popularity: 'medium',
  frameworks: ['MyFramework']
}
```

**Adding a new framework** — edit `SUPPORTED_FRAMEWORKS`:
```js
'MyFramework': {
  language: 'myLang',
  category: 'backend',    // frontend | backend | fullstack | mobile
  description: '...',
  popularity: 'high',
  conventions: ['Convention 1', 'Convention 2']
}
```

---

## Updated API Routes (`backend/routes/analyze.js`)

### `POST /api/analyze` — Code Generation (updated)
Now accepts an optional `repoPath` parameter. If provided, the backend scans the path and uses dynamic context for code generation.

**Request body:**
```json
{
  "twiInput": "Me pɛ sɛ...",
  "languageMode": "twi",
  "repoPath": "C:\\Users\\you\\my-project"   // ← NEW (optional)
}
```

**Response — with repo path:**
```json
{
  "success": true,
  "englishIntent": "...",
  "generatedCode": "...",
  "twiExplanation": "...",
  "projectInfo": {
    "primaryLanguage": "python",
    "primaryStack": "Flask",
    "frameworks": ["Flask", "SQLAlchemy"],
    "description": "Backend Flask project (Python)",
    "totalFiles": 42,
    "isMonorepo": false,
    "hasBackend": true,
    "hasFrontend": false
  }
}
```

---

### `POST /api/analyze-repo` — Repository Analysis Only (new)
Scan a project folder without generating code. Useful for previewing what the system detects.

**Request:**
```json
{ "repoPath": "C:\\Users\\you\\my-project" }
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "path": "C:\\Users\\you\\my-project",
    "primaryLanguage": "typescript",
    "primaryStack": "React",
    "frameworks": ["React", "Next.js"],
    "languages": [
      { "language": "typescript", "fileCount": 34, "percentage": 70 },
      { "language": "javascript", "fileCount": 12, "percentage": 25 }
    ],
    "totalFiles": 48,
    "description": "Frontend React project with Next.js (TypeScript)",
    "projectStructure": {
      "isMonorepo": false,
      "hasBackend": false,
      "hasFrontend": true
    },
    "metadata": {
      "hasTypeScript": true,
      "buildTools": ["Vite"],
      "testingFrameworks": ["Jest"]
    }
  }
}
```

---

### `GET /api/languages` — Available Languages (unchanged)
Returns all configured input languages for the UI.

---

## Frontend Changes

### Repository Path Input Panel
A new input section appears at the top of the left panel. Users can:

1. **Paste or type** the absolute path to their project folder  
   e.g. `C:\Users\you\my-django-api`
2. **Click Scan** (or press **Enter**) to analyze the project
3. A **green badge** appears confirming the project type and file count
4. **Generate Code** now automatically uses that project's context
5. **Click ✕** to clear and reset to generic mode

### How it works end-to-end
```
User types path → clicks Scan
  → POST /api/analyze-repo  (backend scans directory)
  → Badge shows: "Backend Flask project (Python) · 42 files"

User types request → clicks Generate Code
  → POST /api/analyze  (sends repoPath)
  → backend re-uses cached scan
  → generates Python/Flask code matching the project conventions
  → returns code + explanation in user's language
```

---

## Caching

Repository scans are cached in-memory for **5 minutes**. If you make a change to your project and want a fresh scan, simply click **Scan** again — it will detect the cache has expired and re-analyze.

---

## Security

- **Path traversal prevention**: Paths containing `..` or `~` are rejected
- **Absolute paths only**: Relative paths are rejected
- **Input sanitization**: All inputs are sanitized before processing
- **No file content sent to AI**: Only metadata (function names, class names, file counts) is sent — never your actual source code content

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Scan failed: Failed to analyze repository" | Make sure the path exists and is accessible |
| "Repository path must be an absolute path" | Use the full path starting from the drive letter (e.g. `C:\`) |
| "Invalid path: path traversal not allowed" | Remove any `..` from the path |
| Code generated is still in JavaScript | Check that the backend correctly detected your project's language |
| Scan is slow | Large projects (1000+ files) take a few seconds — results are cached afterward |

---

*Built with ❤️ for Ghanaian developers — Mother-Tongue Team*

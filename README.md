# Mother-Tongue 🌍

**Code in the language you think in**

Mother-Tongue is an AI-powered tool that allows Ghanaian developers to describe their coding intentions in Twi (Akan language) and receive context-aware JavaScript code generated specifically for their codebase.

## Features

- 💬 **Natural Language Input**: Describe what you want to build in 11+ languages (text or voice)
- 🎤 **Voice Input**: Speak your requests using the microphone button
- 🤖 **Translation**: Google Translate for all languages (no additional setup needed!)
- 💻 **Context-Aware Code Generation**: IBM Bob generates code that fits your existing codebase
- 🧠 **AI-Powered**: IBM Watsonx.ai (Granite 3 8B Instruct) for intent refinement and explanations
- 🌍 **Multi-Language Support**: Twi, French, Spanish, Arabic, German, Portuguese, Italian, Japanese, Korean, Chinese, Hindi
- 🔧 **Easy Language Addition**: Add new languages by editing one configuration file
- ✅ **Works Out of the Box**: No additional IBM services needed beyond Watsonx.ai

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **AI Services**:
  - IBM Watsonx.ai (Granite 3 8B Instruct model) - Intent refinement & explanations
  - IBM Bob - Context-aware code generation
- **Translation**: Google Translate (all languages) - No additional setup needed

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- IBM Cloud account with Watsonx.ai access
- IBM Watsonx API key and Project ID

**That's it!** No other IBM services needed. Google Translate is used for all language translation.

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd mother-tongue
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your IBM Watsonx credentials:

```env
WATSONX_API_KEY=your_actual_api_key_here
WATSONX_PROJECT_ID=your_actual_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
PORT=3000
```

**Important**: Never commit the `.env` file to version control!

**Note**: You do NOT need Watson Language Translator credentials. The system uses Google Translate for all languages, which works without any additional setup.

### 4. Get IBM Watsonx Credentials

1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Create a Watsonx.ai instance
3. Get your API key from IBM Cloud IAM
4. Get your Project ID from your Watsonx.ai project

**That's all you need!** The system uses Google Translate for all language translation, so no additional IBM services are required.

## Running the Application

### Start the backend server

```bash
cd backend
node server.js
```

The server will start on `http://localhost:3000`

### Start the frontend

Open `frontend/index.html` in your browser, or use a local server:

```bash
# Using Python
cd frontend
python -m http.server 5500

# Using Node.js http-server
npx http-server frontend -p 5500
```

Then open `http://localhost:5500` in your browser.

## Usage

### Choosing Translation Mode

Mother-Tongue supports two translation paths:

1. **🇬🇭 Twi Mode (Primary)**: Uses Google Translate for the best Twi translation quality
   - This is the default and recommended mode for Ghanaian developers
   - Optimized for Akan (Twi) language

2. **🇫🇷 French Mode (IBM Watson)**: Demonstrates IBM-compatible NLP flow
   - Uses IBM Watson Language Translator for French ↔ English
   - Shows full IBM technology stack integration
   - Requires Language Translator credentials in `.env`

Switch between modes using the toggle buttons at the top of the interface.

### Text Input

1. **Enter your request**: Type what you want to build in your chosen language
   - **Twi Example**: "Me pɛ sɛ wɔyɛ function bi a ɛde student CGPA ne target classification to mu"
   - **French Example**: "Je veux créer une fonction qui prend le CGPA d'un étudiant"

### Voice Input 🎤

1. **Click the microphone button** (🎤) next to the text area
2. **Allow microphone access** when prompted by your browser
3. **Speak your request** in your chosen language - the system will transcribe your speech in real-time
4. **Click the microphone again** to stop recording (or it will stop automatically)

**Note**: Voice input uses the Web Speech API and works best in Chrome/Edge browsers. The system automatically adjusts to recognize either Akan (Twi) or French based on your selected mode.

### Generate Code

1. **Click "Generate Code"**: The system will:
   - Translate your Twi input to English intent
   - Generate context-aware JavaScript code
   - Explain the code back to you in Twi

2. **Copy and use the code**: Click the "Copy" button to copy the generated code to your clipboard

### Example Demonstrations

See [`bob_sessions/calculator_remaining_courses_example.md`](bob_sessions/calculator_remaining_courses_example.md) for a complete example of generating a course calculator function using Mother-Tongue.

## Project Structure

```
mother-tongue/
├── backend/
│   ├── routes/
│   │   └── analyze.js          # API route for code generation
│   ├── services/
│   │   ├── watsonx.js          # Watsonx.ai integration
│   │   └── bob.js              # IBM Bob code generation
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Git ignore rules
│   ├── package.json            # Backend dependencies
│   └── server.js               # Express server
├── frontend/
│   ├── index.html              # Main HTML file
│   ├── app.js                  # Frontend JavaScript
│   └── style.css               # Styling
└── README.md                   # This file
```

## API Endpoints

### POST `/api/analyze`

Generate code from Twi input.

**Request Body:**
```json
{
  "twiInput": "Me pɛ sɛ...",
  "repoContext": "Optional codebase context"
}
```

**Response:**
```json
{
  "success": true,
  "twiInput": "Original Twi input",
  "englishIntent": "Translated English intent",
  "generatedCode": "Generated JavaScript code",
  "twiExplanation": "Explanation in Twi"
}
```

## Security Notes

- ⚠️ **Never commit `.env` file** - It contains sensitive API credentials
- 🔒 **API keys are sensitive** - Keep them secure and rotate regularly
- 🌐 **CORS is configured** - Adjust `ALLOWED_ORIGINS` in production
- 📝 **Input validation** - All inputs are validated before processing

## Architecture & Translation Flow

Mother-Tongue uses a streamlined architecture that works with just IBM Watsonx.ai:

### Translation Flow

```
Language Input → Google Translate (lang→en) → Granite (intent refinement)
→ Bob (code generation) → Granite (explanation) → Google Translate (en→lang) → Language Output
```

**Key Components:**
1. **Google Translate**: Handles all language translation (no setup needed)
2. **IBM Watsonx.ai (Granite)**: Refines intent and generates explanations
3. **IBM Bob**: Generates context-aware code

### Supported Languages

All languages use Google Translate for translation:

- 🇬🇭 **Twi (Akan)** - Primary language
- 🇫🇷 French
- 🇪🇸 Spanish
- 🇸🇦 Arabic
- 🇩🇪 German
- 🇵🇹 Portuguese
- 🇮🇹 Italian
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇨🇳 Chinese (Simplified)
- 🇮🇳 Hindi

### Adding New Languages

Adding a new language is simple! Just edit [`backend/config/languages.js`](backend/config/languages.js) and add your language configuration. See [`ADDING_LANGUAGES.md`](ADDING_LANGUAGES.md) for detailed instructions.

**No code changes required** - the system automatically:
- ✅ Loads new languages on startup
- ✅ Displays them in the language selector
- ✅ Handles translation via Google Translate
- ✅ Generates code with IBM Bob
- ✅ Supports voice input

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WATSONX_API_KEY` | IBM Watsonx API key | Yes |
| `WATSONX_PROJECT_ID` | IBM Watsonx project ID | Yes |
| `WATSONX_URL` | Watsonx API endpoint | Yes |
| `LANGUAGE_TRANSLATOR_API_KEY` | IBM Watson Language Translator API key | No (for French mode) |
| `LANGUAGE_TRANSLATOR_URL` | Language Translator endpoint | No (for French mode) |
| `PORT` | Backend server port | No (default: 3000) |
| `NODE_ENV` | Environment (development/production) | No |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins for CORS | No |

## Troubleshooting

### "Missing required environment variables" error
- Ensure your `.env` file exists in the `backend/` directory
- Verify all required variables are set with valid values

### CORS errors
- Check that your frontend URL matches the allowed origins
- In development, CORS allows all origins by default

### API authentication errors
- Verify your Watsonx API key is valid
- Check that your IBM Cloud account has Watsonx.ai access
- Ensure your project ID is correct

### Voice input not working
- **Browser compatibility**: Voice input works best in Chrome, Edge, and other Chromium-based browsers
- **Microphone access**: Ensure you've granted microphone permissions to your browser
- **HTTPS requirement**: Some browsers require HTTPS for microphone access (localhost is usually exempt)
- **Language support**: The system supports Akan (Twi) and French. If recognition is poor, try speaking clearly and at a moderate pace
- **Fallback**: If voice input doesn't work, you can always type your request manually

### French mode not working
- Ensure you have set `LANGUAGE_TRANSLATOR_API_KEY` and `LANGUAGE_TRANSLATOR_URL` in your `.env` file
- Verify your IBM Watson Language Translator service is active in IBM Cloud
- Check that your API key has the necessary permissions

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- IBM Watsonx.ai for AI-powered intent refinement and code generation
- IBM Watson Language Translator for French ↔ English translation
- IBM Bob for context-aware code analysis
- Google Translate for Twi ↔ English translation (primary flow)
- University of Ghana GPA Calculator project (demo repository)

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for Ghanaian developers**
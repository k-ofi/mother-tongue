# Backend Server Restart Required

## Issue
The UI is only showing 2 languages (Twi and French) instead of all 11 languages.

## Root Cause
The backend server was started before the language configuration was updated with all 11 languages. Node.js caches the `require()` modules, so the old configuration (with only 2 languages) is still in memory.

## Solution
**Restart the backend server** to load the updated language configuration.

### Steps:

1. **Stop the current backend server:**
   - In the terminal running `npm start`, press `Ctrl+C`

2. **Start the backend server again:**
   ```bash
   cd backend
   npm start
   ```

3. **Refresh the frontend:**
   - Reload the browser page (F5 or Ctrl+R)

4. **Verify:**
   - Click on the language dropdown "🇬🇭 Twi ▼"
   - You should now see all 11 languages:
     - 🇬🇭 Twi (Primary)
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

## Technical Details

The backend serves languages through the `/api/languages` endpoint defined in [`backend/routes/analyze.js`](backend/routes/analyze.js:100-120).

This endpoint reads from [`backend/config/languages.js`](backend/config/languages.js) which contains all 11 language configurations.

When the server starts, Node.js caches the module. Changes to the configuration file won't take effect until the server is restarted.

## Alternative: Use nodemon for Auto-Restart

To avoid manual restarts during development, you can use `nodemon`:

```bash
npm install -g nodemon
cd backend
nodemon server.js
```

This will automatically restart the server whenever you change any file.
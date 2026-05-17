# IBM Watson Language Translator Setup Guide

This guide walks you through getting your IBM Watson Language Translator credentials and adding them to Mother-Tongue.

## Step 1: Create an IBM Cloud Account

1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Click **"Create an account"** (or **"Log in"** if you already have one)
3. Complete the registration process
4. Verify your email address

**Note**: IBM Cloud offers a free tier (Lite plan) for Watson Language Translator with:
- 1,000,000 characters per month
- No credit card required
- Perfect for development and testing

## Step 2: Create a Language Translator Service

1. **Log in to IBM Cloud**: [https://cloud.ibm.com/](https://cloud.ibm.com/)

2. **Open the Catalog**:
   - Click the **"Catalog"** button in the top navigation bar
   - Or go directly to: [https://cloud.ibm.com/catalog](https://cloud.ibm.com/catalog)

3. **Find Language Translator**:
   - In the search bar, type: `Language Translator`
   - Click on **"Language Translator"** from the results
   - Or go directly to: [https://cloud.ibm.com/catalog/services/language-translator](https://cloud.ibm.com/catalog/services/language-translator)

4. **Configure the Service**:
   - **Select a region**: Choose the region closest to you (e.g., Dallas, London, Frankfurt)
   - **Select a pricing plan**: Choose **"Lite"** (free tier)
   - **Service name**: Leave default or customize (e.g., `mother-tongue-translator`)
   - **Resource group**: Leave as "Default"

5. **Create the Service**:
   - Click the **"Create"** button at the bottom
   - Wait a few seconds for the service to be provisioned

## Step 3: Get Your Credentials

After creating the service, you'll be redirected to the service dashboard.

1. **Navigate to Credentials**:
   - On the left sidebar, click **"Manage"**
   - You should see a section called **"Credentials"**

2. **Copy Your API Key**:
   - Look for **"API key"** field
   - Click the **copy icon** (📋) next to the API key
   - Save this somewhere safe - you'll need it for your `.env` file

3. **Copy Your Service URL**:
   - Look for **"URL"** field
   - It will look something like: `https://api.us-south.language-translator.watson.cloud.ibm.com`
   - Click the **copy icon** (📋) next to the URL
   - Save this as well

**Example of what you'll see:**
```
API key: xXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX
URL: https://api.us-south.language-translator.watson.cloud.ibm.com
```

## Step 4: Add Credentials to Your .env File

1. **Open your `.env` file**:
   - Navigate to: `backend/.env`
   - If it doesn't exist, copy from `.env.example`:
     ```bash
     cd backend
     cp .env.example .env
     ```

2. **Add the Language Translator credentials**:
   ```env
   # IBM Watsonx Configuration (existing)
   WATSONX_API_KEY=your_existing_watsonx_key
   WATSONX_PROJECT_ID=your_existing_project_id
   WATSONX_URL=https://us-south.ml.cloud.ibm.com

   # IBM Watson Language Translator Configuration (NEW - add these)
   LANGUAGE_TRANSLATOR_API_KEY=xXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX
   LANGUAGE_TRANSLATOR_URL=https://api.us-south.language-translator.watson.cloud.ibm.com

   PORT=3000
   ```

3. **Replace the placeholder values**:
   - Replace `xXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX` with your actual API key
   - Replace the URL with your actual service URL (if different)

4. **Save the file**

## Step 5: Verify Your Setup

1. **Restart your backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Check for errors**:
   - If you see errors about Watson Language Translator, double-check your credentials
   - Make sure there are no extra spaces in your `.env` file

3. **Test the integration**:
   - Open the frontend in your browser
   - Select a Watson-powered language (French, Spanish, etc.)
   - Try generating code
   - If it works, you're all set! 🎉

## Troubleshooting

### Error: "Watson Language Translator not configured"

**Cause**: The credentials are missing or incorrect in your `.env` file.

**Solution**:
1. Check that `LANGUAGE_TRANSLATOR_API_KEY` and `LANGUAGE_TRANSLATOR_URL` are in your `.env` file
2. Verify there are no typos in the variable names
3. Make sure there are no extra spaces around the `=` sign
4. Restart the server after making changes

### Error: "Authentication failed" or "Invalid API key"

**Cause**: The API key is incorrect or expired.

**Solution**:
1. Go back to IBM Cloud
2. Navigate to your Language Translator service
3. Click "Manage" → "Credentials"
4. Verify the API key matches what's in your `.env` file
5. If needed, create new credentials:
   - Click "New credential" button
   - Copy the new API key
   - Update your `.env` file

### Error: "Service not found" or "URL not found"

**Cause**: The service URL is incorrect or the service was deleted.

**Solution**:
1. Verify the URL in IBM Cloud matches your `.env` file
2. Make sure the service is still active in your IBM Cloud dashboard
3. Check that you're using the correct region URL

### Twi mode works but Watson languages don't

**Cause**: Watson credentials are missing, but Twi uses Google Translate (no credentials needed).

**Solution**:
- Follow steps 1-4 above to add Watson credentials
- Twi will continue to work with Google Translate
- Watson languages will work once credentials are added

## Understanding the Free Tier Limits

The IBM Watson Language Translator Lite plan includes:

- **1,000,000 characters per month** (free)
- Resets on the 1st of each month
- No credit card required
- Supports all language pairs

**Character counting example:**
- "Hello world" = 11 characters
- A typical code generation request uses ~200-500 characters
- You can make approximately 2,000-5,000 requests per month on the free tier

**Monitoring usage:**
1. Go to IBM Cloud dashboard
2. Click on your Language Translator service
3. View usage statistics in the dashboard

## Security Best Practices

1. **Never commit `.env` file to Git**:
   - The `.gitignore` file already excludes it
   - Double-check before pushing code

2. **Rotate API keys regularly**:
   - Create new credentials every few months
   - Delete old credentials in IBM Cloud

3. **Use different credentials for development and production**:
   - Create separate Language Translator services
   - Use different API keys for each environment

4. **Limit access**:
   - Only share credentials with team members who need them
   - Use IBM Cloud IAM for team access management

## Quick Reference

### IBM Cloud Links
- **IBM Cloud Dashboard**: [https://cloud.ibm.com/](https://cloud.ibm.com/)
- **Language Translator Catalog**: [https://cloud.ibm.com/catalog/services/language-translator](https://cloud.ibm.com/catalog/services/language-translator)
- **Language Translator Docs**: [https://cloud.ibm.com/docs/language-translator](https://cloud.ibm.com/docs/language-translator)
- **Supported Languages**: [https://cloud.ibm.com/docs/language-translator?topic=language-translator-translation-models](https://cloud.ibm.com/docs/language-translator?topic=language-translator-translation-models)

### Environment Variables
```env
LANGUAGE_TRANSLATOR_API_KEY=your_api_key_here
LANGUAGE_TRANSLATOR_URL=https://api.us-south.language-translator.watson.cloud.ibm.com
```

### Common Service URLs by Region
- **Dallas (US South)**: `https://api.us-south.language-translator.watson.cloud.ibm.com`
- **Washington DC (US East)**: `https://api.us-east.language-translator.watson.cloud.ibm.com`
- **Frankfurt (EU)**: `https://api.eu-de.language-translator.watson.cloud.ibm.com`
- **London (EU)**: `https://api.eu-gb.language-translator.watson.cloud.ibm.com`
- **Tokyo (Asia)**: `https://api.jp-tok.language-translator.watson.cloud.ibm.com`
- **Sydney (Asia)**: `https://api.au-syd.language-translator.watson.cloud.ibm.com`

## Need More Help?

- **IBM Cloud Support**: [https://cloud.ibm.com/unifiedsupport/supportcenter](https://cloud.ibm.com/unifiedsupport/supportcenter)
- **Language Translator API Docs**: [https://cloud.ibm.com/apidocs/language-translator](https://cloud.ibm.com/apidocs/language-translator)
- **Community Forum**: [https://community.ibm.com/community/user/watsonai/communities/community-home?CommunityKey=7a3dc5ba-3018-452d-9a43-a49dc6819633](https://community.ibm.com/community/user/watsonai/communities/community-home?CommunityKey=7a3dc5ba-3018-452d-9a43-a49dc6819633)

---

**You're now ready to use Watson Language Translator with Mother-Tongue!** 🚀
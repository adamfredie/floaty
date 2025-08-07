# Floaty Backend - Vercel API

Backend proxy server for the Floaty Chrome extension, deployed on Vercel.

## 🚀 Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   Enter your Gemini API key when prompted.

4. **Deploy:**
   ```bash
   vercel --prod
   ```

## 📡 API Endpoints

### Generate Title
- **URL:** `POST /api/generate-title`
- **Body:** `{ "text": "your text", "context": "optional context" }`
- **Response:** `{ "title": "generated title" }`

### Generate Summary
- **URL:** `POST /api/generate-summary`
- **Body:** `{ "text": "your text" }`
- **Response:** `{ "summary": "generated summary" }`

### Extract Tasks
- **URL:** `POST /api/extract-tasks`
- **Body:** `{ "text": "your text", "context": "optional context" }`
- **Response:** `{ "tasks": ["task1", "task2", "task3"] }`

## 🔧 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variable:**
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```

3. **Run locally:**
   ```bash
   vercel dev
   ```

## 🔒 Security

- API key is stored securely in Vercel environment variables
- CORS enabled for Chrome extension
- Input validation and error handling
- Fallback responses for API failures 
# 🚀 Deploy Floaty Backend to Vercel

## Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Set Environment Variable
```bash
vercel env add GEMINI_API_KEY
```
Enter your Gemini API key when prompted.

## Step 4: Deploy
```bash
vercel --prod
```

## Step 5: Get Your Deployment URL
After deployment, Vercel will give you a URL like:
`https://your-project-name.vercel.app`

## Step 6: Update Extension
In `popup.js`, replace the baseUrl with your deployment URL:
```javascript
this.baseUrl = "https://your-project-name.vercel.app/api"
```

## 🔒 Security Benefits
- ✅ API key is now stored securely on Vercel
- ✅ No API key in extension code
- ✅ CORS properly configured
- ✅ Rate limiting and error handling included

## 🧪 Test Your Deployment
Test the endpoints:
```bash
curl -X POST https://your-project-name.vercel.app/api/generate-title \
  -H "Content-Type: application/json" \
  -d '{"text": "Test note content", "context": "Test context"}'
```

## 📝 Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key 
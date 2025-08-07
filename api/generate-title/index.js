const axios = require('axios');

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `Generate a concise title (max 60 characters) for this text: "${text}"${context ? ` Context: ${context}` : ''}. Return only the title, nothing else.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const title = response.data.candidates[0].content.parts[0].text.trim();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ title });

  } catch (error) {
    console.error('Error generating title:', error.response?.data || error.message);
    
    // Fallback title generation
    const { text, context } = req.body;
    const fallbackTitle = text.length > 50 ? text.substring(0, 50) + '...' : text;
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ title: fallbackTitle });
  }
}; 
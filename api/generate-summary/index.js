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
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `Summarize this text in 2-3 concise sentences: "${text}". Return only the summary, nothing else.`;

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

    const summary = response.data.candidates[0].content.parts[0].text.trim();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ summary });

  } catch (error) {
    console.error('Error generating summary:', error.response?.data || error.message);
    
    // Fallback summary generation
    const { text } = req.body;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const fallbackSummary = sentences.slice(0, 2).join('. ') + '.';
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ summary: fallbackSummary });
  }
}; 
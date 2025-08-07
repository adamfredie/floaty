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

    const prompt = `Extract 2-3 actionable tasks from this text: "${text}"${context ? ` Context: ${context}` : ''}. Return only the tasks as a JSON array of strings, nothing else. Example: ["Task 1", "Task 2", "Task 3"]`;

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

    const result = response.data.candidates[0].content.parts[0].text.trim();
    
    // Try to parse JSON response
    let tasks = [];
    try {
      tasks = JSON.parse(result);
      if (!Array.isArray(tasks)) {
        throw new Error('Not an array');
      }
    } catch (parseError) {
      // If JSON parsing fails, extract tasks manually
      const lines = result.split('\n').filter(line => line.trim().length > 0);
      tasks = lines.slice(0, 3).map(line => line.replace(/^[-*•]\s*/, '').trim());
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ tasks });

  } catch (error) {
    console.error('Error extracting tasks:', error.response?.data || error.message);
    
    // Fallback task extraction
    const { text } = req.body;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const fallbackTasks = sentences.slice(0, 2).map(s => `Review: ${s.trim()}`);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ tasks: fallbackTasks });
  }
}; 
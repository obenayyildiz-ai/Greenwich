import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt manquant' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY non définie');
      return res.status(500).json({ 
        error: 'Configuration serveur incorrecte' 
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return res.status(200).json({
      content: response.content,
    });

  } catch (error) {
    console.error('Erreur API Anthropic:', error);
    return res.status(500).json({ 
      error: error.message || 'Erreur lors de l\'analyse' 
    });
  }
}

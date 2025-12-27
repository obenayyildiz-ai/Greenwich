export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    // Importer le SDK
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({ apiKey });
    
    // Test simple
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Réponds juste "OK" si tu me reçois' }],
    });
    
    return res.status(200).json({
      success: true,
      response: response.content
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      errorCode: error.status || error.code
    });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  return res.status(200).json({
    status: "OK",
    apiKeyConfigured: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 15) + '***' : 'NON DEFINIE',
    hasAnthropicSDK: true
  });
}

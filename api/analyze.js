export default async function handler(req, res) {
  // Configurer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Répondre aux requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Autoriser uniquement POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt manquant' });
    }
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Clé API non configurée'
      });
    }
    
    console.log('✅ Début analyse, longueur prompt:', prompt.length);
    
    // Importer le SDK
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({ apiKey });
    
    console.log('📡 Appel API Anthropic...');
    
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
    
    console.log('✅ Réponse reçue');
    
    return res.status(200).json({
      content: response.content,
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Type:', error.constructor.name);
    console.error('Code:', error.status || error.code);
    
    return res.status(500).json({ 
      error: error.message,
      type: error.constructor.name,
      code: error.status || error.code
    });
  }
}
```

---

## 📊 **Vérifier les logs en temps réel**

1. **Allez sur Vercel Dashboard** → Projet `greenwich-4du1`
2. **Onglet "Logs"** (pas Build Logs, mais Runtime Logs)
3. **Testez votre application** en tapant `50000€ de béton`
4. **Regardez les logs** qui apparaissent

Vous devriez voir :
```
✅ Début analyse, longueur prompt: XXX
📡 Appel API Anthropic...
✅ Réponse reçue
```

Ou une erreur comme :
```
❌ Erreur: ...
Type: ...
Code: ...

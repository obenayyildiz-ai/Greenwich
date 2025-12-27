export default async function handler(req, res) {
  // Configurer CORS pour permettre les requêtes depuis votre frontend
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

    // Vérifier que la clé API existe
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY non définie dans les variables d\'environnement');
      return res.status(500).json({ 
        error: 'Configuration serveur incorrecte - clé API manquante' 
      });
    }

    // Importer dynamiquement le SDK Anthropic
    const Anthropic = (await import('@anthropic-ai/sdk')).default;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log('Appel à l\'API Anthropic...');

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

    console.log('Réponse reçue de l\'API Anthropic');

    return res.status(200).json({
      content: response.content,
    });

  } catch (error) {
    console.error('Erreur API Anthropic:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      error: error.message || 'Erreur lors de l\'analyse',
      details: error.stack
    });
  }
}
```

5. En bas, commit message : `Create API endpoint for Anthropic`
6. Cliquez **"Commit new file"**

---

### ÉTAPE 2 : Vérifier que le fichier existe

1. Retournez à la racine de votre dépôt
2. Vous devriez maintenant voir un dossier **`api/`**
3. Cliquez dessus
4. Vous devriez voir **`analyze.js`** dedans

---

### ÉTAPE 3 : Attendre le redéploiement Vercel

1. Allez sur **https://vercel.com**
2. Projet **Greenwich** → **Deployments**
3. Un nouveau déploiement devrait démarrer automatiquement
4. Attendez qu'il devienne ✅ **Ready** (2-3 minutes)

---

### ÉTAPE 4 : Tester à nouveau

Une fois le déploiement terminé :

1. Allez sur **https://greenwich-delta.vercel.app**
2. Essayez de taper :
```
   50 000€ de béton armé

import React, { useState, useRef, useEffect } from "react";
import { Send, Download, Sparkles, AlertTriangle, MapPin, TrendingDown } from "lucide-react";

const FreeTextAnalyzer = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Bonjour ! Je suis votre expert IA en matériaux critiques.\n\nSaisissez vos volumes d'achats de matériaux de construction en euros, et je vais :\n\n✅ Décortiquer chaque matériau en composants critiques\n✅ Identifier les zones de provenance\n✅ Évaluer les risques de pénurie\n✅ Analyser les dépendances géopolitiques\n\n💡 Exemple :\n\"50 000€ de béton armé, 30 000€ de câblage électrique cuivre, 80 000€ de panneaux solaires\"",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const response = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: `Tu es un expert en matériaux de construction, géopolitique des ressources et reporting CSRD.

DONNÉES D'ACHATS : ${currentInput}

INSTRUCTIONS CRITIQUES :
1. Si le produit est vague (ex: "générateur"), détermine le type probable dans le contexte construction
2. Identifie TOUS les matériaux critiques contenus
3. RÉPONDS UNIQUEMENT EN JSON VALIDE - PAS DE TEXTE AVANT OU APRÈS
4. N'utilise PAS de guillemets simples, uniquement des guillemets doubles
5. Échappe correctement les guillemets dans le texte

Format JSON EXACT à respecter :

{
  "achats_analyses": [
    {
      "achat_initial": "Description du produit",
      "montant_euros": "Montant",
      "materiaux_critiques_contenus": [
        {
          "nom_materiau": "Nom matériau",
          "categorie": "Métal critique",
          "volume_estime_reel": "Volume avec unité",
          "pourcentage_composition": "Pourcentage",
          "criticite": "Élevé",
          "zones_provenance": [
            {"pays_region": "Pays", "part_production_mondiale": "%", "statut": "Monopole"}
          ],
          "risques_penurie": {
            "court_terme": {"niveau": "Élevé", "raison": "Raison"},
            "moyen_terme": {"niveau": "Moyen", "raison": "Raison"},
            "long_terme": {"niveau": "Faible", "raison": "Raison"}
          },
          "dependances_geopolitiques": ["Dépendance"],
          "volatilite_prix": "Élevée",
          "substitution_possible": "difficile",
          "impact_environnemental": "Description",
          "recommandations_specifiques": ["Action"]
        }
      ]
    }
  ],
  "synthese_globale": {
    "nombre_total_materiaux_critiques": 0,
    "niveau_exposition_global": "Élevé",
    "principales_dependances": ["Pays"],
    "risque_penurie_global": "Description",
    "montant_total_expose": "Montant"
  },
  "zones_geographiques_cles": [
    {
      "zone": "Pays",
      "materiaux_concernes": ["Matériau"],
      "part_approvisionnement": "Pourcentage",
      "risques_specifiques": ["Risque"],
      "niveau_risque": "Élevé"
    }
  ],
  "alertes_penurie": [
    {
      "materiau": "Nom",
      "horizon": "court terme",
      "probabilite": "élevée",
      "impact_potentiel": "Description",
      "actions_preventives": ["Action"]
    }
  ],
  "recommandations_strategiques": ["Recommandation"]
}`,
  }),
});

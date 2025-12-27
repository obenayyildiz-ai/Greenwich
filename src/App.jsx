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

  // ✅ CORRECTION : Fonction ASYNC
  const analyzeData = async () => {
    if (!input.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
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

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const text = data.content.filter((i) => i.type === "text").map((i) => i.text).join("");

      let clean = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "")
        .trim();

      if (!clean || !clean.startsWith("{")) {
        console.error("Réponse brute:", text);
        throw new Error("La réponse ne contient pas de JSON valide");
      }

      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch (parseError) {
        console.error("JSON à parser:", clean);
        throw new Error("Le JSON retourné est malformé. Réessayez avec une description plus simple.");
      }

      if (!parsed.synthese_globale || !parsed.achats_analyses) {
        throw new Error("La structure de réponse est incomplète");
      }

      setAnalysis(parsed);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "✅ Analyse terminée ! Consultez le rapport détaillé ci-dessous.",
        },
      ]);
    } catch (err) {
      console.error("Erreur:", err);
      let errorMsg = `❌ Erreur : ${err.message}\n\n`;

      if (err.message.includes("JSON") || err.message.includes("invalide")) {
        errorMsg += 'Suggestions :\n• Simplifiez votre demande\n• Exemple : "20000€ de cables cuivre, 50000€ de beton"';
      } else {
        errorMsg += "Assurez-vous de :\n• Inclure les montants en euros\n• Décrire clairement les matériaux";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
    }
    setLoading(false);
  };

  const exportResults = () => {
    const data = { date: new Date().toLocaleDateString("fr-FR"), ...analysis };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-materiaux-${Date.now()}.json`;
    a.click();
  };

  const getRiskColor = (level) => {
    if (level === "Critique" || level === "Élevé") return "pill red";
    if (level === "Moyen") return "pill orange";
    return "pill green";
  };

  return (
    <div className="container">
      {/* HERO */}
      <div className="hero">
        <div className="heroRow">
          <div>
            <h1 className="sectionTitle">
              <Sparkles size={36} />
              Analyseur IA - Matériaux Critiques
            </h1>
            <p>Décorticage intelligent des achats de construction</p>
          </div>

          {analysis && (
            <button onClick={exportResults} className="btn">
              <Download size={18} />
              Exporter
            </button>
          )}
        </div>
      </div>

      <div className="grid">
        {/* LEFT: CHAT */}
        <div className="glass card chatPanel">
          <div className="chatHeader">
            <h2 className="sectionTitle">💬 Interface de saisie</h2>
          </div>

          <div className="chatBody">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`bubbleRow ${msg.role === "user" ? "user" : "assistant"}`}
              >
                <div className={`bubble ${msg.role === "user" ? "user" : "assistant"}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="bubbleRow assistant">
                <div className="typing">
                  <div className="dots">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                  <span style={{ fontSize: 13 }}>Analyse en cours...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="composer">
            <div className="composerRow">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    analyzeData();
                  }
                }}
                placeholder="Ex: 50 000€ de béton armé, 30 000€ de câblage cuivre..."
                className="textarea"
                rows={3}
                disabled={loading}
              />
              <button
                onClick={analyzeData}
                disabled={loading || !input.trim()}
                className="sendBtn"
                aria-label="Envoyer"
                title="Envoyer"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: REPORT */}
        <div className="report">
          {!analysis ? (
            <div className="glass card placeholder">
              <div style={{ opacity: 0.85 }}>
                <Sparkles size={86} />
              </div>
              <h3>En attente d'analyse</h3>
              <p>Saisissez vos volumes d&apos;achats en euros pour obtenir l&apos;analyse</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="summary">
                <h2 className="sectionTitle" style={{ margin: 0 }}>
                  <AlertTriangle size={24} />
                  Synthèse Globale
                </h2>

                <div className="summaryGrid">
                  <div className="stat">
                    <div className="big">{analysis.synthese_globale?.nombre_total_materiaux_critiques}</div>
                    <div className="label">Matériaux critiques</div>
                  </div>
                  <div className="stat">
                    <div className="big" style={{ fontSize: 20 }}>
                      {analysis.synthese_globale?.niveau_exposition_global}
                    </div>
                    <div className="label">Exposition</div>
                  </div>
                </div>

                <div className="stat" style={{ marginBottom: 10 }}>
                  <div className="label">💰 Montant exposé</div>
                  <div className="big" style={{ fontSize: 22 }}>
                    {analysis.synthese_globale?.montant_total_expose}
                  </div>
                </div>

                <div className="stat" style={{ marginBottom: 10 }}>
                  <div className="label">🌍 Principales dépendances</div>
                  <div className="badges" style={{ marginTop: 8 }}>
                    {analysis.synthese_globale?.principales_dependances?.map((d, i) => (
                      <span key={i} className="badge">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <p style={{ margin: 0, color: "rgba(255,255,255,.90)", fontSize: 13 }}>
                  {analysis.synthese_globale?.risque_penurie_global}
                </p>
              </div>

              {/* Zones */}
              {analysis.zones_geographiques_cles?.length > 0 && (
                <div className="whiteCard">
                  <h2 className="sectionTitle" style={{ marginTop: 0 }}>
                    <MapPin size={22} />
                    Zones Géographiques Clés
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {analysis.zones_geographiques_cles.map((zone, i) => (
                      <div key={i} className="zoneRow">
                        <div className="zoneTop">
                          <div>
                            <div style={{ fontWeight: 850, fontSize: 16 }}>{zone.zone}</div>
                            <div style={{ fontSize: 12, opacity: 0.7 }}>{zone.part_approvisionnement}</div>
                          </div>
                          <span className={getRiskColor(zone.niveau_risque)}>{zone.niveau_risque}</span>
                        </div>

                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.8 }}>Matériaux</div>
                          <div className="miniTags" style={{ marginTop: 6 }}>
                            {zone.materiaux_concernes?.map((m, j) => (
                              <span key={j} className="tag">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.8 }}>Risques</div>
                          <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: 12, opacity: 0.85 }}>
                            {zone.risques_specifiques?.map((r, j) => (
                              <li key={j}>⚠️ {r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alerts */}
              {analysis.alertes_penurie?.length > 0 && (
                <div className="whiteCard">
                  <h2 className="sectionTitle" style={{ marginTop: 0 }}>
                    <TrendingDown size={22} />
                    Alertes Pénurie
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {analysis.alertes_penurie.map((alert, i) => (
                      <div key={i} className="alert">
                        <div className="alertTop">
                          <div style={{ fontWeight: 900 }}>{alert.materiau}</div>
                          <div style={{ textAlign: "right", fontSize: 12, opacity: 0.85 }}>
                            <div>{alert.horizon}</div>
                            <span
                              className={`pill ${alert.probabilite === "élevée" ? "red" : "orange"}`}
                              style={{ display: "inline-block", marginTop: 6 }}
                            >
                              {alert.probabilite}
                            </span>
                          </div>
                        </div>

                        <p style={{ margin: "8px 0 0 0", fontSize: 13, opacity: 0.9 }}>
                          {alert.impact_potentiel}
                        </p>

                        <div className="alertActions">
                          <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Actions</div>
                          {alert.actions_preventives?.map((a, j) => (
                            <div key={j} style={{ fontSize: 12, opacity: 0.9 }}>
                              → {a}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommandations_strategiques?.length > 0 && (
                <div
                  className="glass card"
                  style={{
                    padding: 16,
                    borderRadius: 28,
                    border: "1px solid rgba(34,197,94,.25)",
                    background:
                      "linear-gradient(135deg, rgba(34,197,94,.10), rgba(16,185,129,.08))",
                  }}
                >
                  <h2 style={{ margin: 0, fontWeight: 900, color: "rgba(255,255,255,.92)" }}>
                    ✅ Recommandations Stratégiques
                  </h2>

                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    {analysis.recommandations_strategiques.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                        <span style={{ fontWeight: 900, color: "rgba(34,197,94,.95)" }}>→</span>
                        <span style={{ color: "rgba(255,255,255,.88)" }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeTextAnalyzer;

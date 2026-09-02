const MAX_TEXT_CHARS = 120000;
const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MODEL = "gemini-2.5-flash";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + chunkSize)
    );
  }

  return btoa(binary);
}

export async function onRequestGet() {
  return json({
    status: "ok",
    message: "Lova Tsara IA API fonctionne."
  });
}

export async function onRequestPost(context) {
  try {
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return json(
        {
          error:
            "Configuration serveur incomplète : GEMINI_API_KEY est absente."
        },
        500
      );
    }

    const form = await context.request.formData();

    const text = String(form.get("text") || "").trim();
    const pdf = form.get("pdf");

    if (!text && !(pdf instanceof File)) {
      return json(
        {
          error: "Ajoute un texte ou un fichier PDF."
        },
        400
      );
    }

    if (text.length > MAX_TEXT_CHARS) {
      return json(
        {
          error: "Le texte est trop long."
        },
        413
      );
    }

    const parts = [
      {
        text: `Tu es Lova Tsara IA, un assistant pédagogique.

Analyse uniquement le contenu fourni par l'utilisateur.

Tu dois générer :

1. Des notes de révision claires.
2. Un quiz de 10 questions à choix multiples.
3. Des flashcards utiles.

Réponds uniquement avec un objet JSON valide dans ce format :

{
  "notes": [
    {
      "title": "Titre",
      "content": "Contenu"
    }
  ],
  "quiz": [
    {
      "question": "Question",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "answerIndex": 0
    }
  ],
  "flashcards": [
    {
      "front": "Question",
      "back": "Réponse"
    }
  ]
}`
      }
    ];

    if (text) {
      parts.push({
        text: `CONTENU À ÉTUDIER :

${text}`
      });
    }

    if (pdf instanceof File && pdf.size > 0) {
      if (pdf.size > MAX_PDF_BYTES) {
        return json(
          {
            error: "Le PDF est trop volumineux."
          },
          413
        );
      }

      const base64 = arrayBufferToBase64(
        await pdf.arrayBuffer()
      );

      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: base64
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: parts
            }
          ],

          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        })
      }
    );

    const raw = await response.text();

    if (!response.ok) {
      console.error("Gemini error:", raw);

      return json(
        {
          error:
            "Erreur avec Gemini. Vérifie la clé API et les limites."
        },
        response.status
      );
    }

    const geminiData = JSON.parse(raw);

    const generatedText =
      geminiData?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!generatedText) {
      return json(
        {
          error: "Gemini n'a pas généré de contenu."
        },
        502
      );
    }

    let result;

    try {
      result = JSON.parse(generatedText);
    } catch (error) {
      console.error("JSON Gemini invalide:", generatedText);

      return json(
        {
          error: "Gemini a renvoyé un format invalide."
        },
        502
      );
    }

    return json(result);

  } catch (error) {

    console.error("Erreur serveur:", error);

    return json(
      {
        error: "Erreur interne du serveur."
      },
      500
    );
  }
}

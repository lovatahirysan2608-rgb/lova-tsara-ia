# Lova Tsara IA — Cloudflare Pages + Gemini

## Architecture

Le projet contient :

- `index.html` : l'interface du site.
- `functions/api/generate.js` : le backend Cloudflare Pages Function.
- Gemini API : génération des notes, quiz et flashcards.

Le frontend appelle simplement :

`POST /api/generate`

La clé Gemini reste côté serveur dans Cloudflare et n'est jamais placée dans `index.html`.

## 1. Créer une clé Gemini

Crée une clé API dans Google AI Studio.

Conserve cette clé privée. Ne la colle jamais dans le HTML, GitHub ou un message public.

## 2. Mettre le projet sur GitHub

Crée un dépôt GitHub, par exemple :

`lova-tsara-ia`

Ajoute tous les fichiers de ce dossier.

## 3. Déployer sur Cloudflare Pages

Dans Cloudflare :

1. Ouvre **Workers & Pages**.
2. Crée un nouveau projet Pages.
3. Connecte ton dépôt GitHub.
4. Sélectionne le dépôt `lova-tsara-ia`.
5. Pour un simple site HTML, configure le projet sans framework/build particulier.
6. Le répertoire racine doit contenir directement :
   - `index.html`
   - `functions/`

Cloudflare détectera automatiquement :

`functions/api/generate.js`

et créera la route :

`/api/generate`

## 4. Ajouter la clé API comme Secret

Après la création du projet :

1. Va dans **Workers & Pages**.
2. Ouvre ton projet.
3. Va dans **Settings** → **Variables and Secrets**.
4. Ajoute une variable nommée exactement :

`GEMINI_API_KEY`

5. Colle ta clé Gemini comme valeur.
6. Active l'option de chiffrement / Secret.
7. Sauvegarde.
8. Redéploie le projet.

Le code récupère la clé avec :

`context.env.GEMINI_API_KEY`

## 5. Tester

Ouvre :

`https://ton-site.pages.dev/api/generate`

Tu dois obtenir une réponse JSON indiquant que l'API fonctionne.

Ensuite, ouvre ton site, colle un cours ou importe un PDF, puis clique sur le bouton de génération.

## Limites actuelles du projet

Cette première version limite volontairement :

- le texte à environ 120 000 caractères ;
- les PDF à 15 Mo.

Ces limites peuvent être modifiées plus tard.

## Important pour la sécurité

Ne jamais faire ceci :

`const API_KEY = "AIza..."`

dans le frontend.

La clé doit uniquement être enregistrée comme Secret dans Cloudflare.

## Dépendances

Aucune dépendance npm n'est nécessaire pour cette version.

Le backend utilise directement l'API REST de Gemini et les APIs Web disponibles dans Cloudflare Pages Functions.

## Sources officielles

Cloudflare Pages Functions :
https://developers.cloudflare.com/pages/functions/get-started/

Variables et Secrets Cloudflare :
https://developers.cloudflare.com/pages/functions/bindings/

Gemini API :
https://ai.google.dev/gemini-api/docs

Structured Outputs Gemini :
https://ai.google.dev/gemini-api/docs/structured-output

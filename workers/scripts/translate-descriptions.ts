/**
 * Script pour traduire les descriptions de produits en français
 *
 * Options de traduction :
 * 1. DeepL API (gratuit jusqu'à 500k caractères/mois) - RECOMMANDÉ
 * 2. Google Translate API
 * 3. Claude API pour traductions contextuelles de parfums
 *
 * Installation :
 * npm install deepl-node
 * ou
 * npm install @anthropic-ai/sdk
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * OPTION 1: Utiliser DeepL (Installation: npm install deepl-node)
 * Créer un compte gratuit sur https://www.deepl.com/pro-api
 * Obtenir votre clé API et la mettre dans .env : DEEPL_API_KEY=xxx
 */
async function translateWithDeepL(text: string): Promise<string> {
  // Décommentez après installation de deepl-node
  /*
  const deepl = require('deepl-node');
  const translator = new deepl.Translator(process.env.DEEPL_API_KEY);
  const result = await translator.translateText(text, 'en', 'fr');
  return result.text;
  */
  throw new Error('Installer deepl-node et configurer DEEPL_API_KEY');
}

/**
 * OPTION 2: Utiliser Claude API (Installation: npm install @anthropic-ai/sdk)
 * Utiliser la clé API Anthropic de votre compte
 */
async function translateWithClaude(text: string): Promise<string> {
  // Décommentez après installation de @anthropic-ai/sdk
  /*
  const Anthropic = require('@anthropic-ai/sdk');
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Traduis cette description de parfum en français de manière naturelle et professionnelle :\n\n${text}`
    }]
  });

  return message.content[0].text;
  */
  throw new Error('Installer @anthropic-ai/sdk et configurer ANTHROPIC_API_KEY');
}

/**
 * OPTION 3: Générer les commandes SQL pour traduction manuelle
 * Cette option génère un fichier SQL avec toutes les descriptions à traduire
 */
async function generateTranslationSQL() {
  console.log('🌍 Génération du script SQL de traduction...\n');

  // Commandes SQL pour récupérer toutes les descriptions
  const sqlCommands = `
-- 1. Exporter toutes les descriptions en anglais
-- Exécutez cette commande pour voir toutes les descriptions à traduire :
SELECT id, name, description FROM products WHERE description IS NOT NULL LIMIT 10;

-- 2. Après traduction, utilisez ces commandes UPDATE :
-- UPDATE products SET description = 'Description en français' WHERE id = 1;

-- Exemple de traductions automatiques communes :
UPDATE products SET description = REPLACE(description, 'Woody fragrance', 'Parfum boisé') WHERE description LIKE '%Woody fragrance%';
UPDATE products SET description = REPLACE(description, 'Floral fragrance', 'Parfum floral') WHERE description LIKE '%Floral fragrance%';
UPDATE products SET description = REPLACE(description, 'for women', 'pour femme') WHERE description LIKE '%for women%';
UPDATE products SET description = REPLACE(description, 'for men', 'pour homme') WHERE description LIKE '%for men%';
UPDATE products SET description = REPLACE(description, 'for women and men', 'pour femme et homme') WHERE description LIKE '%for women and men%';
UPDATE products SET description = REPLACE(description, 'was launched in', 'a été lancé en') WHERE description LIKE '%was launched in%';
UPDATE products SET description = REPLACE(description, 'The nose behind this fragrance is', 'Le nez derrière ce parfum est') WHERE description LIKE '%The nose behind this fragrance is%';
UPDATE products SET description = REPLACE(description, 'Top notes are', 'Les notes de tête sont') WHERE description LIKE '%Top notes are%';
UPDATE products SET description = REPLACE(description, 'middle notes are', 'les notes de cœur sont') WHERE description LIKE '%middle notes are%';
UPDATE products SET description = REPLACE(description, 'base notes are', 'les notes de fond sont') WHERE description LIKE '%base notes are%';
UPDATE products SET description = REPLACE(description, 'Aromatic', 'Aromatique') WHERE description LIKE '%Aromatic%';
UPDATE products SET description = REPLACE(description, 'Citrus', 'Citrus') WHERE description LIKE '%Citrus%';
UPDATE products SET description = REPLACE(description, 'Fresh', 'Frais') WHERE description LIKE '%Fresh%';
UPDATE products SET description = REPLACE(description, 'Spicy', 'Épicé') WHERE description LIKE '%Spicy%';
UPDATE products SET description = REPLACE(description, 'Oriental', 'Oriental') WHERE description LIKE '%Oriental%';
UPDATE products SET description = REPLACE(description, 'Amber', 'Ambré') WHERE description LIKE '%Amber%';
UPDATE products SET description = REPLACE(description, 'Musky', 'Musqué') WHERE description LIKE '%Musky%';
UPDATE products SET description = REPLACE(description, 'Green', 'Vert') WHERE description LIKE '%Green%';
UPDATE products SET description = REPLACE(description, 'Fruity', 'Fruité') WHERE description LIKE '%Fruity%';
UPDATE products SET description = REPLACE(description, 'Sweet', 'Sucré') WHERE description LIKE '%Sweet%';
`;

  console.log(sqlCommands);

  // Sauvegarder dans un fichier
  const outputPath = path.join(__dirname, 'translate-descriptions.sql');
  fs.writeFileSync(outputPath, sqlCommands);

  console.log(`\n✅ Script SQL généré : ${outputPath}`);
  console.log('\nÉtapes suivantes :');
  console.log('1. Exécutez : wrangler d1 execute senada-db --local --file=scripts/translate-descriptions.sql');
  console.log('2. Pour la production : wrangler d1 execute senada-db --remote --file=scripts/translate-descriptions.sql');
}

/**
 * OPTION 4: Traduction en masse avec Google Translate (gratuit, simple)
 * Utilise l'API non officielle @vitalets/google-translate-api
 */
async function translateWithGoogle(text: string): Promise<string> {
  // Installation: npm install @vitalets/google-translate-api
  /*
  const translate = require('@vitalets/google-translate-api');
  const result = await translate(text, { from: 'en', to: 'fr' });
  return result.text;
  */
  throw new Error('Installer @vitalets/google-translate-api');
}

// Exécuter la génération SQL par défaut
console.log('📝 Script de traduction des descriptions de produits\n');
console.log('Options disponibles :');
console.log('1. DeepL API (meilleure qualité, gratuit 500k chars/mois)');
console.log('2. Claude API (excellent pour parfums, contextuel)');
console.log('3. Google Translate (gratuit, qualité correcte)');
console.log('4. Traductions SQL automatiques (patterns courants)\n');

generateTranslationSQL().catch(console.error);

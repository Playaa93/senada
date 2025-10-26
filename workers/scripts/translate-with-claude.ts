/**
 * Script de traduction automatique des descriptions de parfums avec Claude
 * Utilise l'API Anthropic pour des traductions contextuelles et professionnelles
 *
 * Installation:
 * npm install @anthropic-ai/sdk
 *
 * Configuration:
 * Définir ANTHROPIC_API_KEY dans .env ou en variable d'environnement
 */

import Anthropic from '@anthropic-ai/sdk';
import { drizzle } from 'drizzle-orm/d1';
import { products } from '../src/db/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';

// Configuration
const BATCH_SIZE = 10; // Nombre de descriptions à traduire par requête
const MODEL = 'claude-3-haiku-20240307'; // Modèle rapide et économique

async function translateBatch(descriptions: Array<{ id: number; text: string }>): Promise<Map<number, string>> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Créer le prompt avec toutes les descriptions
  const descriptionsText = descriptions
    .map(d => `ID: ${d.id}\n${d.text}`)
    .join('\n\n---\n\n');

  const prompt = `Tu es un expert en parfumerie et en traduction français-anglais. Traduis les descriptions de parfums suivantes de l'anglais vers le français de manière naturelle, professionnelle et fidèle au vocabulaire de l'industrie du parfum.

IMPORTANT:
- Garde le même format "ID: X" suivi de la traduction
- Traduis de manière fluide et naturelle
- Utilise le vocabulaire professionnel de la parfumerie française
- Conserve les noms propres (marques, parfumeurs, ingrédients)
- Pour les notes: "Top notes" → "Notes de tête", "middle notes" → "notes de cœur", "base notes" → "notes de fond"

Descriptions à traduire:

${descriptionsText}`;

  console.log(`\n🤖 Envoi de ${descriptions.length} descriptions à Claude...`);

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  // Parser la réponse
  const response = message.content[0].type === 'text' ? message.content[0].text : '';
  const translations = new Map<number, string>();

  // Extraire les traductions par ID
  const blocks = response.split(/ID:\s*(\d+)\s*\n/);
  for (let i = 1; i < blocks.length; i += 2) {
    const id = parseInt(blocks[i]);
    const translation = blocks[i + 1]?.split('---')[0]?.trim();
    if (id && translation) {
      translations.set(id, translation);
    }
  }

  console.log(`✅ ${translations.size} traductions reçues`);
  return translations;
}

async function main() {
  console.log('🌍 Traduction automatique des descriptions avec Claude API\n');

  // Vérifier la clé API
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Erreur: ANTHROPIC_API_KEY non définie');
    console.log('\nPour configurer:');
    console.log('1. Windows: set ANTHROPIC_API_KEY=sk-ant-...');
    console.log('2. Linux/Mac: export ANTHROPIC_API_KEY=sk-ant-...');
    console.log('3. Ou créer un fichier .env avec: ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  // Note: Ce script nécessite l'accès à la base de données
  // Pour l'instant, il génère des commandes SQL que vous pouvez exécuter

  console.log('📋 Génération des commandes SQL de traduction...\n');
  console.log('Pour exécuter ce script avec accès à la DB:');
  console.log('1. Installer: npm install @anthropic-ai/sdk');
  console.log('2. Configurer: set ANTHROPIC_API_KEY=votre_cle');
  console.log('3. Adapter ce script pour votre environnement D1\n');

  // Exemple de commande pour récupérer les descriptions à traduire
  console.log('-- 1. Exporter les descriptions en anglais');
  console.log('SELECT id, name, description FROM products WHERE description IS NOT NULL AND description LIKE "%fragrance%" LIMIT 100;');
  console.log('\n-- 2. Après traduction, mettre à jour:');
  console.log('-- UPDATE products SET description = "Description en français" WHERE id = X;');
}

// Mode simple: Traduire une seule description
export async function translateSingleDescription(text: string): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Traduis cette description de parfum en français de manière naturelle et professionnelle, en utilisant le vocabulaire de l'industrie de la parfumerie:\n\n${text}`
    }]
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

// Exécuter
if (require.main === module) {
  main().catch(console.error);
}

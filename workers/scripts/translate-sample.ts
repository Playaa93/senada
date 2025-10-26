/**
 * Script de test pour traduire quelques descriptions avec Claude
 * Usage:
 * 1. set ANTHROPIC_API_KEY=votre_clé
 * 2. npx tsx scripts/translate-sample.ts
 */

import Anthropic from '@anthropic-ai/sdk';

// Exemples de descriptions à traduire (vous pouvez les remplacer par celles de votre DB)
const sampleDescriptions = [
  {
    id: 1,
    text: "Chanel No. 5 is a Floral Aldehyde fragrance for women. Chanel No. 5 was launched in 1921. The nose behind this fragrance is Ernest Beaux. Top notes are Aldehydes, Ylang-Ylang, Neroli, Bergamot and Lemon; middle notes are Iris, Jasmine, Rose, Orris Root and Lily-of-the-Valley; base notes are Civet, Sandalwood, Amber, Musk, Moss, Vetiver, Vanilla and Patchouli."
  },
  {
    id: 2,
    text: "Santal 33 is a Woody Aromatic fragrance for women and men. Santal 33 was launched in 2011. The nose behind this fragrance is Frank Voelkl."
  },
];

async function translateWithClaude() {
  console.log('🌍 Test de traduction avec Claude API\n');

  // Vérifier la clé API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY non définie\n');
    console.log('📝 Pour configurer votre clé API:');
    console.log('   Windows: set ANTHROPIC_API_KEY=sk-ant-...');
    console.log('   Linux/Mac: export ANTHROPIC_API_KEY=sk-ant-...\n');
    console.log('🔑 Obtenez votre clé sur: https://console.anthropic.com/');
    return;
  }

  const anthropic = new Anthropic({ apiKey });

  console.log(`📝 Traduction de ${sampleDescriptions.length} descriptions...\n`);

  for (const desc of sampleDescriptions) {
    console.log(`\n--- Produit ID ${desc.id} ---`);
    console.log(`EN: ${desc.text.substring(0, 100)}...`);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Traduis cette description de parfum en français de manière naturelle et professionnelle, en utilisant le vocabulaire de l'industrie de la parfumerie. Réponds uniquement avec la traduction, sans commentaire:\n\n${desc.text}`
        }]
      });

      const translation = message.content[0].type === 'text' ? message.content[0].text : '';
      console.log(`FR: ${translation}`);
      console.log(`\nSQL: UPDATE products SET description = '${translation.replace(/'/g, "''")}' WHERE id = ${desc.id};`);

    } catch (error: any) {
      console.error(`❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n\n✅ Traduction terminée!');
  console.log('\nPour traduire toutes les descriptions:');
  console.log('1. Exportez vos descriptions: wrangler d1 execute senada-db --local --command="SELECT id, description FROM products LIMIT 10"');
  console.log('2. Utilisez ce script comme base pour un traitement par lots');
}

translateWithClaude().catch(console.error);

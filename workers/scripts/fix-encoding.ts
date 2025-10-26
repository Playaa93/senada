/**
 * Script pour corriger l'encodage des caractères français dans la base de données
 * Exécuter avec: npx tsx scripts/fix-encoding.ts
 */

import { drizzle } from 'drizzle-orm/d1';
import { products } from '../src/db/schema';
import { sql } from 'drizzle-orm';

const encodingFixes = [
  { wrong: 'bois�', correct: 'boisé' },
  { wrong: '�pic', correct: 'épic' },
  { wrong: 'fra�', correct: 'fraî' },
  { wrong: 'fle�', correct: 'fleu' },
  { wrong: 'alc�', correct: 'alcô' },
  { wrong: 'f�min', correct: 'fémin' },
  { wrong: 'ic�n', correct: 'icôn' },
  { wrong: 'ald�hyd', correct: 'aldéhyd' },
  { wrong: '�l�gant', correct: 'élégant' },
  { wrong: 'cr�me', correct: 'crème' },
  { wrong: 'p�che', correct: 'pêche' },
  { wrong: 'fra�che', correct: 'fraîche' },
  { wrong: 'l�ger', correct: 'léger' },
  { wrong: 'd�licat', correct: 'délicat' },
  { wrong: 'Catégorie', correct: 'Catégorie' }, // Déjà correct
];

console.log('🔧 Correction de l\'encodage des caractères français...\n');

async function fixEncoding() {
  // Note: Ce script est un exemple
  // Pour l'exécuter réellement, vous aurez besoin d'accéder à la base de données

  console.log('Pour corriger l\'encodage, exécutez les commandes SQL suivantes:\n');

  encodingFixes.forEach(({ wrong, correct }) => {
    console.log(`-- Corriger "${wrong}" → "${correct}"`);
    console.log(`UPDATE products SET description = REPLACE(description, '${wrong}', '${correct}') WHERE description LIKE '%${wrong}%';`);
    console.log(`UPDATE products SET name = REPLACE(name, '${wrong}', '${correct}') WHERE name LIKE '%${wrong}%';\n`);
  });

  console.log('\n✅ Commandes SQL générées. Exécutez-les avec wrangler d1 execute');
}

fixEncoding();

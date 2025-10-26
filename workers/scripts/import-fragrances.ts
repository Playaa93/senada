/**
 * Script to import Fragrantica dataset into D1 database
 *
 * Usage:
 * 1. Download the Fragrantica dataset from Kaggle:
 *    https://www.kaggle.com/datasets/olgagmiufana1/fragrantica-com-fragrance-dataset
 * 2. Extract fra_cleaned.csv to workers/data/
 * 3. Run: npm run import-fragrances
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

interface FragrancaCSVRow {
  // Adjust these fields based on actual CSV structure
  name: string;
  brand: string;
  perfumer?: string;
  gender?: string;
  year?: string;
  topNotes?: string;
  middleNotes?: string;
  baseNotes?: string;
  mainAccords?: string;
  description?: string;
  rating?: string;
  votes?: string;
  imageUrl?: string;
  fragrancaId?: string;
}

interface FragranceInsert {
  fragrancaId?: string;
  name: string;
  brand: string;
  gender?: string;
  year?: number;
  perfumer?: string;
  topNotes?: string;
  middleNotes?: string;
  baseNotes?: string;
  mainAccords?: string;
  description?: string;
  rating?: number;
  votes?: number;
  imageUrl?: string;
}

/**
 * Parse CSV and transform to database format
 */
function parseCSV(csvPath: string): FragranceInsert[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as FragrancaCSVRow[];

  return records.map((row) => ({
    fragrancaId: row.fragrancaId || undefined,
    name: row.name,
    brand: row.brand,
    gender: row.gender || undefined,
    year: row.year ? parseInt(row.year, 10) : undefined,
    perfumer: row.perfumer || undefined,
    topNotes: row.topNotes || undefined,
    middleNotes: row.middleNotes || undefined,
    baseNotes: row.baseNotes || undefined,
    mainAccords: row.mainAccords || undefined,
    description: row.description || undefined,
    rating: row.rating ? parseFloat(row.rating) : undefined,
    votes: row.votes ? parseInt(row.votes, 10) : undefined,
    imageUrl: row.imageUrl || undefined,
  }));
}

/**
 * Generate SQL INSERT statements in batches
 */
function generateBatchSQL(fragrances: FragranceInsert[], batchSize = 100): string[] {
  const batches: string[] = [];

  for (let i = 0; i < fragrances.length; i += batchSize) {
    const batch = fragrances.slice(i, i + batchSize);
    const values = batch.map((f) => {
      const escapeString = (str: string | undefined) =>
        str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
      const escapeNumber = (num: number | undefined) =>
        num !== undefined ? num : 'NULL';

      return `(
        ${escapeString(f.fragrancaId)},
        ${escapeString(f.name)},
        ${escapeString(f.brand)},
        ${escapeString(f.gender)},
        ${escapeNumber(f.year)},
        ${escapeString(f.perfumer)},
        ${escapeString(f.topNotes)},
        ${escapeString(f.middleNotes)},
        ${escapeString(f.baseNotes)},
        ${escapeString(f.mainAccords)},
        ${escapeString(f.description)},
        ${escapeNumber(f.rating)},
        ${escapeNumber(f.votes)},
        ${escapeString(f.imageUrl)}
      )`;
    }).join(',\n');

    const sql = `
INSERT INTO fragrances (
  fragrantica_id, name, brand, gender, year, perfumer,
  top_notes, middle_notes, base_notes, main_accords,
  description, rating, votes, image_url
) VALUES
${values};
`;
    batches.push(sql);
  }

  return batches;
}

/**
 * Main import function
 */
async function importFragrances() {
  const csvPath = path.join(__dirname, '../data/fra_cleaned.csv');

  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`\n❌ Error: File not found at ${csvPath}`);
    console.log('\n📥 Please download the Fragrantica dataset:');
    console.log('   1. Go to: https://www.kaggle.com/datasets/olgagmiufana1/fragrantica-com-fragrance-dataset');
    console.log('   2. Download and extract fra_cleaned.csv');
    console.log('   3. Place it in workers/data/fra_cleaned.csv');
    console.log('   4. Run this script again\n');
    process.exit(1);
  }

  console.log('📊 Parsing CSV file...');
  const fragrances = parseCSV(csvPath);
  console.log(`✅ Found ${fragrances.length} fragrances`);

  console.log('\n📝 Generating SQL batches...');
  const sqlBatches = generateBatchSQL(fragrances, 100);
  console.log(`✅ Created ${sqlBatches.length} SQL batch files`);

  // Create output directory
  const outputDir = path.join(__dirname, '../migrations/fragrance-import');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write SQL files
  sqlBatches.forEach((sql, index) => {
    const filename = `import-batch-${String(index + 1).padStart(3, '0')}.sql`;
    fs.writeFileSync(path.join(outputDir, filename), sql);
  });

  console.log(`\n✅ SQL files created in ${outputDir}`);
  console.log('\n🚀 To import to local database, run:');
  console.log('   for %f in (workers\\migrations\\fragrance-import\\*.sql) do npx wrangler d1 execute senada-db --local --file="%f"');
  console.log('\n🌍 To import to production database, run:');
  console.log('   for %f in (workers\\migrations\\fragrance-import\\*.sql) do npx wrangler d1 execute senada-db --remote --file="%f"');
  console.log('');
}

// Run the import
importFragrances().catch(console.error);

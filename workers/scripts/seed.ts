import { seedDatabase } from '../src/db/seed';

// Script pour seed la database locale
// Usage: npx wrangler d1 execute senada-db --local --file=./scripts/run-seed.sql

async function main() {
  console.log('🌱 Starting database seeding...');
  console.log('');
  console.log('⚠️  Note: This script generates SQL that you need to run manually');
  console.log('');

  // Générer du SQL pour seed
  console.log('-- SQL Seed Data for Senada Database');
  console.log('-- Generated: ' + new Date().toISOString());
  console.log('');

  // Suppliers
  console.log('-- Suppliers');
  console.log(`INSERT INTO suppliers (name, contact_name, email, phone, address, payment_terms, lead_time_days, notes, is_active) VALUES`);
  console.log(`  ('Parfums de Luxe France', 'Marie Dubois', 'marie@parfumsluxe.fr', '+33 1 42 86 52 12', '15 Rue de la Paix, 75002 Paris, France', 'Net 30', 7, 'Fournisseur premium - Marques de luxe', 1),`);
  console.log(`  ('Fragrances International', 'John Smith', 'j.smith@fragrances-intl.com', '+44 20 7946 0958', '123 Oxford Street, London W1D 2HG, UK', 'Net 45', 14, 'Large distributeur - Bons prix en volume', 1),`);
  console.log(`  ('Essence & Senteurs', 'Sophie Martin', 'sophie@essence-senteurs.com', '+33 4 91 13 89 00', '45 Boulevard de la Canebière, 13001 Marseille, France', 'Net 30', 5, 'Livraison rapide - Parfums niche', 1);`);
  console.log('');

  console.log('-- Products');
  console.log(`INSERT INTO products (sku, name, description, category, buy_price, sell_price, current_stock, min_stock, supplier_id, image_url) VALUES`);
  console.log(`  ('CHANEL-005-100', 'Chanel No. 5 EDP 100ml', 'Parfum iconique féminin, notes florales aldéhydées', 'Women''s Perfume', 75.00, 120.00, 45, 15, 1, '/images/chanel-no5.jpg'),`);
  console.log(`  ('DIOR-SAUVAGE-60', 'Dior Sauvage EDT 60ml', 'Parfum masculin frais et épicé', 'Men''s Perfume', 48.00, 75.00, 62, 20, 1, '/images/dior-sauvage.jpg'),`);
  console.log(`  ('TF-NEROLI-50', 'Tom Ford Neroli Portofino 50ml', 'Parfum unisexe citrus et fleur d''oranger', 'Unisex', 120.00, 180.00, 8, 10, 2, '/images/tf-neroli.jpg'),`);
  console.log(`  ('YSL-LIBRE-90', 'YSL Libre EDP 90ml', 'Parfum féminin moderne, lavande et fleur d''oranger', 'Women''s Perfume', 68.00, 105.00, 28, 12, 1, '/images/ysl-libre.jpg'),`);
  console.log(`  ('ARMANI-CODE-75', 'Armani Code Pour Homme 75ml', 'Parfum masculin oriental boisé', 'Men''s Perfume', 52.00, 82.00, 35, 15, 2, '/images/armani-code.jpg'),`);
  console.log(`  ('GUERLAIN-HOMME-100', 'Guerlain L''Homme Idéal EDP 100ml', 'Parfum masculin amandé et cuir', 'Men''s Perfume', 58.00, 92.00, 22, 10, 3, '/images/guerlain-ideal.jpg'),`);
  console.log(`  ('LANCOME-IDOLE-50', 'Lancôme Idôle EDP 50ml', 'Parfum féminin floral moderne', 'Women''s Perfume', 55.00, 88.00, 18, 12, 1, '/images/lancome-idole.jpg'),`);
  console.log(`  ('BYREDO-GYPSY-100', 'Byredo Gypsy Water EDP 100ml', 'Parfum unisexe boisé et frais', 'Unisex', 145.00, 215.00, 5, 8, 3, '/images/byredo-gypsy.jpg'),`);
  console.log(`  ('PRADA-LUNA-80', 'Prada Luna Rossa Carbon 100ml', 'Parfum masculin aromatique métallique', 'Men''s Perfume', 62.00, 95.00, 31, 15, 2, '/images/prada-carbon.jpg'),`);
  console.log(`  ('HERMES-JARDIN-100', 'Hermès Un Jardin sur le Nil 100ml', 'Parfum unisexe vert et aqueux', 'Unisex', 72.00, 112.00, 14, 10, 3, '/images/hermes-jardin.jpg');`);
  console.log('');
}

main().catch(console.error);

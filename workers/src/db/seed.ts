import { drizzle } from 'drizzle-orm/d1';
import { products, suppliers, stockMovements, restockPredictions } from './schema';

export async function seedDatabase(db: D1Database) {
  const drizzleDb = drizzle(db);

  console.log('🌱 Seeding database...');

  // 1. Créer des fournisseurs
  const suppliersData = [
    {
      name: 'Parfums de Luxe France',
      contactName: 'Marie Dubois',
      email: 'marie@parfumsluxe.fr',
      phone: '+33 1 42 86 52 12',
      address: '15 Rue de la Paix, 75002 Paris, France',
      paymentTerms: 'Net 30',
      leadTimeDays: 7,
      notes: 'Fournisseur premium - Marques de luxe',
      isActive: true,
    },
    {
      name: 'Fragrances International',
      contactName: 'John Smith',
      email: 'j.smith@fragrances-intl.com',
      phone: '+44 20 7946 0958',
      address: '123 Oxford Street, London W1D 2HG, UK',
      paymentTerms: 'Net 45',
      leadTimeDays: 14,
      notes: 'Large distributeur - Bons prix en volume',
      isActive: true,
    },
    {
      name: 'Essence & Senteurs',
      contactName: 'Sophie Martin',
      email: 'sophie@essence-senteurs.com',
      phone: '+33 4 91 13 89 00',
      address: '45 Boulevard de la Canebière, 13001 Marseille, France',
      paymentTerms: 'Net 30',
      leadTimeDays: 5,
      notes: 'Livraison rapide - Parfums niche',
      isActive: true,
    },
  ];

  const insertedSuppliers = await drizzleDb.insert(suppliers).values(suppliersData).returning();
  console.log(`✅ Inserted ${insertedSuppliers.length} suppliers`);

  // 2. Créer des produits
  const productsData = [
    {
      sku: 'CHANEL-005-100',
      name: 'Chanel No. 5 EDP 100ml',
      description: 'Parfum iconique féminin, notes florales aldéhydées',
      category: "Women's Perfume",
      buyPrice: 75.00,
      sellPrice: 120.00,
      currentStock: 45,
      minStock: 15,
      supplierId: insertedSuppliers[0].id,
      imageUrl: '/images/chanel-no5.jpg',
    },
    {
      sku: 'DIOR-SAUVAGE-60',
      name: 'Dior Sauvage EDT 60ml',
      description: 'Parfum masculin frais et épicé',
      category: "Men's Perfume",
      buyPrice: 48.00,
      sellPrice: 75.00,
      currentStock: 62,
      minStock: 20,
      supplierId: insertedSuppliers[0].id,
      imageUrl: '/images/dior-sauvage.jpg',
    },
    {
      sku: 'TF-NEROLI-50',
      name: 'Tom Ford Neroli Portofino 50ml',
      description: 'Parfum unisexe citrus et fleur d\'oranger',
      category: 'Unisex',
      buyPrice: 120.00,
      sellPrice: 180.00,
      currentStock: 8,
      minStock: 10,
      supplierId: insertedSuppliers[1].id,
      imageUrl: '/images/tf-neroli.jpg',
    },
    {
      sku: 'YSL-LIBRE-90',
      name: 'YSL Libre EDP 90ml',
      description: 'Parfum féminin moderne, lavande et fleur d\'oranger',
      category: "Women's Perfume",
      buyPrice: 68.00,
      sellPrice: 105.00,
      currentStock: 28,
      minStock: 12,
      supplierId: insertedSuppliers[0].id,
      imageUrl: '/images/ysl-libre.jpg',
    },
    {
      sku: 'ARMANI-CODE-75',
      name: 'Armani Code Pour Homme 75ml',
      description: 'Parfum masculin oriental boisé',
      category: "Men's Perfume",
      buyPrice: 52.00,
      sellPrice: 82.00,
      currentStock: 35,
      minStock: 15,
      supplierId: insertedSuppliers[1].id,
      imageUrl: '/images/armani-code.jpg',
    },
    {
      sku: 'GUERLAIN-HOMME-100',
      name: 'Guerlain L\'Homme Idéal EDP 100ml',
      description: 'Parfum masculin amandé et cuir',
      category: "Men's Perfume",
      buyPrice: 58.00,
      sellPrice: 92.00,
      currentStock: 22,
      minStock: 10,
      supplierId: insertedSuppliers[2].id,
      imageUrl: '/images/guerlain-ideal.jpg',
    },
    {
      sku: 'LANCOME-IDOLE-50',
      name: 'Lancôme Idôle EDP 50ml',
      description: 'Parfum féminin floral moderne',
      category: "Women's Perfume",
      buyPrice: 55.00,
      sellPrice: 88.00,
      currentStock: 18,
      minStock: 12,
      supplierId: insertedSuppliers[0].id,
      imageUrl: '/images/lancome-idole.jpg',
    },
    {
      sku: 'BYREDO-GYPSY-100',
      name: 'Byredo Gypsy Water EDP 100ml',
      description: 'Parfum unisexe boisé et frais',
      category: 'Unisex',
      buyPrice: 145.00,
      sellPrice: 215.00,
      currentStock: 5,
      minStock: 8,
      supplierId: insertedSuppliers[2].id,
      imageUrl: '/images/byredo-gypsy.jpg',
    },
    {
      sku: 'PRADA-LUNA-80',
      name: 'Prada Luna Rossa Carbon 100ml',
      description: 'Parfum masculin aromatique métallique',
      category: "Men's Perfume",
      buyPrice: 62.00,
      sellPrice: 95.00,
      currentStock: 31,
      minStock: 15,
      supplierId: insertedSuppliers[1].id,
      imageUrl: '/images/prada-carbon.jpg',
    },
    {
      sku: 'HERMES-JARDIN-100',
      name: 'Hermès Un Jardin sur le Nil 100ml',
      description: 'Parfum unisexe vert et aqueux',
      category: 'Unisex',
      buyPrice: 72.00,
      sellPrice: 112.00,
      currentStock: 14,
      minStock: 10,
      supplierId: insertedSuppliers[2].id,
      imageUrl: '/images/hermes-jardin.jpg',
    },
  ];

  const insertedProducts = await drizzleDb.insert(products).values(productsData).returning();
  console.log(`✅ Inserted ${insertedProducts.length} products`);

  // 3. Créer des mouvements de stock (historique)
  const stockMovementsData = [
    // Chanel No. 5 - Réceptions
    {
      productId: insertedProducts[0].id,
      type: 'in' as const,
      quantity: 50,
      previousStock: 0,
      newStock: 50,
      reason: 'Initial stock',
      user: 'System',
      reference: 'PO-2025-001',
    },
    {
      productId: insertedProducts[0].id,
      type: 'out' as const,
      quantity: 5,
      previousStock: 50,
      newStock: 45,
      reason: 'Sale',
      user: 'Senada',
      reference: 'SALE-2025-010',
    },
    // Dior Sauvage
    {
      productId: insertedProducts[1].id,
      type: 'in' as const,
      quantity: 80,
      previousStock: 0,
      newStock: 80,
      reason: 'Initial stock',
      user: 'System',
      reference: 'PO-2025-002',
    },
    {
      productId: insertedProducts[1].id,
      type: 'out' as const,
      quantity: 18,
      previousStock: 80,
      newStock: 62,
      reason: 'Sales',
      user: 'Senada',
      reference: 'SALES-WEEK-42',
    },
    // Tom Ford Neroli - Stock faible
    {
      productId: insertedProducts[2].id,
      type: 'in' as const,
      quantity: 15,
      previousStock: 0,
      newStock: 15,
      reason: 'Initial stock',
      user: 'System',
      reference: 'PO-2025-003',
    },
    {
      productId: insertedProducts[2].id,
      type: 'out' as const,
      quantity: 7,
      previousStock: 15,
      newStock: 8,
      reason: 'Sales',
      user: 'Senada',
      notes: 'Stock critique - Réappro urgent',
    },
    // YSL Libre
    {
      productId: insertedProducts[3].id,
      type: 'in' as const,
      quantity: 40,
      previousStock: 0,
      newStock: 40,
      reason: 'Initial stock',
      user: 'System',
      reference: 'PO-2025-004',
    },
    {
      productId: insertedProducts[3].id,
      type: 'out' as const,
      quantity: 12,
      previousStock: 40,
      newStock: 28,
      reason: 'Sales',
      user: 'Senada',
    },
    // Byredo Gypsy Water - TRES faible stock
    {
      productId: insertedProducts[7].id,
      type: 'in' as const,
      quantity: 10,
      previousStock: 0,
      newStock: 10,
      reason: 'Initial stock',
      user: 'System',
      reference: 'PO-2025-008',
    },
    {
      productId: insertedProducts[7].id,
      type: 'out' as const,
      quantity: 5,
      previousStock: 10,
      newStock: 5,
      reason: 'Sales - High demand',
      user: 'Senada',
      notes: 'URGENT: Stock critique sous minimum',
    },
  ];

  await drizzleDb.insert(stockMovements).values(stockMovementsData);
  console.log(`✅ Inserted ${stockMovementsData.length} stock movements`);

  // 4. Créer quelques prédictions de réappro
  const predictionsData = [
    {
      productId: insertedProducts[2].id, // Tom Ford Neroli - stock faible
      predictedDate: new Date('2025-11-03'),
      suggestedQuantity: 25,
      confidenceScore: 0.85,
      predictionBasis: JSON.stringify({
        method: 'hybrid_forecast',
        avgDailySales: 0.8,
        leadTimeDays: 14,
        safetyStock: 6,
      }),
      status: 'pending',
    },
    {
      productId: insertedProducts[7].id, // Byredo - URGENT
      predictedDate: new Date('2025-10-30'),
      suggestedQuantity: 15,
      confidenceScore: 0.92,
      predictionBasis: JSON.stringify({
        method: 'hybrid_forecast',
        avgDailySales: 1.2,
        leadTimeDays: 5,
        safetyStock: 5,
        urgency: 'critical',
      }),
      status: 'pending',
    },
    {
      productId: insertedProducts[0].id, // Chanel No. 5
      predictedDate: new Date('2025-11-15'),
      suggestedQuantity: 60,
      confidenceScore: 0.78,
      predictionBasis: JSON.stringify({
        method: 'eoq',
        avgDailySales: 2.5,
        leadTimeDays: 7,
        safetyStock: 8,
      }),
      status: 'pending',
    },
  ];

  await drizzleDb.insert(restockPredictions).values(predictionsData);
  console.log(`✅ Inserted ${predictionsData.length} restock predictions`);

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${insertedSuppliers.length} suppliers`);
  console.log(`   - ${insertedProducts.length} products`);
  console.log(`   - ${stockMovementsData.length} stock movements`);
  console.log(`   - ${predictionsData.length} restock predictions`);
  console.log('');
}

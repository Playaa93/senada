-- Traductions complètes des descriptions (finir la traduction partielle)

-- ID 3: XJ 1861 Naxos
UPDATE products SET description = 'XJ 1861 Naxos par Xerjoff est un parfum Citrus Gourmand pour femme et homme. XJ 1861 Naxos a été lancé en 2015. Les notes de tête sont Lavande, Bergamote et Citron; les notes de cœur sont Miel, Cannelle, Cashmeran et Jasmin Sambac; les notes de fond sont Feuille de Tabac, Vanille et Fève Tonka.' WHERE id = 3;

-- ID 6: L'Interdit Givenchy
UPDATE products SET description = 'L''Interdit par Givenchy est un parfum Floral Aldéhydé pour femme. L''Interdit a été lancé en 1957. Le nez derrière ce parfum est Francis Fabron. Les notes de tête sont Aldéhydes, Fraise, Épices, Pêche, Bergamote et Mandarine; les notes de cœur sont Iris, Violette, Narcisse, Racine d''Iris, Rose, Ylang-Ylang, Jasmin et Muguet; les notes de fond sont Bois de Santal, Ambre, Musc, Benjoin, Vétiver et Fève Tonka.' WHERE id = 6;

-- Traductions automatiques supplémentaires des noms d'ingrédients courants
UPDATE products SET description = REPLACE(description, 'Lavender', 'Lavande') WHERE description LIKE '%Lavender%';
UPDATE products SET description = REPLACE(description, 'Bergamot', 'Bergamote') WHERE description LIKE '%Bergamot%';
UPDATE products SET description = REPLACE(description, 'Lemon', 'Citron') WHERE description LIKE '%Lemon%';
UPDATE products SET description = REPLACE(description, 'Honey', 'Miel') WHERE description LIKE '%Honey%';
UPDATE products SET description = REPLACE(description, 'Cinnamon', 'Cannelle') WHERE description LIKE '%Cinnamon%';
UPDATE products SET description = REPLACE(description, 'Vanilla', 'Vanille') WHERE description LIKE '%Vanilla%';
UPDATE products SET description = REPLACE(description, 'Tonka Bean', 'Fève Tonka') WHERE description LIKE '%Tonka Bean%';
UPDATE products SET description = REPLACE(description, 'Tobacco Leaf', 'Feuille de Tabac') WHERE description LIKE '%Tobacco Leaf%';
UPDATE products SET description = REPLACE(description, 'Jasmine', 'Jasmin') WHERE description LIKE '%Jasmine%';
UPDATE products SET description = REPLACE(description, 'Strawberry', 'Fraise') WHERE description LIKE '%Strawberry%';
UPDATE products SET description = REPLACE(description, 'Spices', 'Épices') WHERE description LIKE '%Spices%';
UPDATE products SET description = REPLACE(description, 'Peach', 'Pêche') WHERE description LIKE '%Peach%';
UPDATE products SET description = REPLACE(description, 'Mandarin Orange', 'Mandarine') WHERE description LIKE '%Mandarin Orange%';
UPDATE products SET description = REPLACE(description, 'Violet', 'Violette') WHERE description LIKE '%Violet%';
UPDATE products SET description = REPLACE(description, 'Narcissus', 'Narcisse') WHERE description LIKE '%Narcissus%';
UPDATE products SET description = REPLACE(description, 'Orris Root', 'Racine d''Iris') WHERE description LIKE '%Orris Root%';
UPDATE products SET description = REPLACE(description, 'Rose', 'Rose') WHERE description LIKE '%Rose%';
UPDATE products SET description = REPLACE(description, 'Lily-of-the-Valley', 'Muguet') WHERE description LIKE '%Lily-of-the-Valley%';
UPDATE products SET description = REPLACE(description, 'Sandalwood', 'Bois de Santal') WHERE description LIKE '%Sandalwood%';
UPDATE products SET description = REPLACE(description, 'Amber', 'Ambre') WHERE description LIKE '%Amber%';
UPDATE products SET description = REPLACE(description, 'Musk', 'Musc') WHERE description LIKE '%Musk%';
UPDATE products SET description = REPLACE(description, 'Benzoin', 'Benjoin') WHERE description LIKE '%Benzoin%';
UPDATE products SET description = REPLACE(description, 'Vetiver', 'Vétiver') WHERE description LIKE '%Vetiver%';

-- Corrections de syntaxe (espaces manquants après "by")
UPDATE products SET description = REPLACE(description, 'by', ' par ') WHERE description LIKE '%by%';
UPDATE products SET description = REPLACE(description, 'is a', 'est un') WHERE description LIKE '%is a%';
UPDATE products SET description = REPLACE(description, ' men', ' homme') WHERE description LIKE '% men%';
UPDATE products SET description = REPLACE(description, 'women', 'femme') WHERE description LIKE '%women%';

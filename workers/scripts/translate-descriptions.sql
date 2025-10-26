-- Traduction automatique des descriptions de parfums EN → FR
-- Traductions des phrases et termes courants de l'industrie du parfum

-- Types de parfums
UPDATE products SET description = REPLACE(description, 'Woody fragrance', 'Parfum boisé') WHERE description LIKE '%Woody fragrance%';
UPDATE products SET description = REPLACE(description, 'Floral fragrance', 'Parfum floral') WHERE description LIKE '%Floral fragrance%';
UPDATE products SET description = REPLACE(description, 'Aromatic fragrance', 'Parfum aromatique') WHERE description LIKE '%Aromatic fragrance%';
UPDATE products SET description = REPLACE(description, 'Citrus fragrance', 'Parfum citrus') WHERE description LIKE '%Citrus fragrance%';
UPDATE products SET description = REPLACE(description, 'Oriental fragrance', 'Parfum oriental') WHERE description LIKE '%Oriental fragrance%';
UPDATE products SET description = REPLACE(description, 'Amber fragrance', 'Parfum ambré') WHERE description LIKE '%Amber fragrance%';
UPDATE products SET description = REPLACE(description, 'Chypre fragrance', 'Parfum chypré') WHERE description LIKE '%Chypre fragrance%';
UPDATE products SET description = REPLACE(description, 'Fresh fragrance', 'Parfum frais') WHERE description LIKE '%Fresh fragrance%';
UPDATE products SET description = REPLACE(description, 'Fruity fragrance', 'Parfum fruité') WHERE description LIKE '%Fruity fragrance%';
UPDATE products SET description = REPLACE(description, 'Green fragrance', 'Parfum vert') WHERE description LIKE '%Green fragrance%';

-- Genre
UPDATE products SET description = REPLACE(description, 'for women', 'pour femme') WHERE description LIKE '%for women%';
UPDATE products SET description = REPLACE(description, 'for men', 'pour homme') WHERE description LIKE '%for men%';
UPDATE products SET description = REPLACE(description, 'for women and men', 'pour femme et homme') WHERE description LIKE '%for women and men%';

-- Informations générales
UPDATE products SET description = REPLACE(description, 'was launched in', 'a été lancé en') WHERE description LIKE '%was launched in%';
UPDATE products SET description = REPLACE(description, 'The nose behind this fragrance is', 'Le nez derrière ce parfum est') WHERE description LIKE '%The nose behind this fragrance is%';

-- Notes
UPDATE products SET description = REPLACE(description, 'Top notes are', 'Les notes de tête sont') WHERE description LIKE '%Top notes are%';
UPDATE products SET description = REPLACE(description, 'top notes are', 'les notes de tête sont') WHERE description LIKE '%top notes are%';
UPDATE products SET description = REPLACE(description, 'Middle notes are', 'Les notes de cœur sont') WHERE description LIKE '%Middle notes are%';
UPDATE products SET description = REPLACE(description, 'middle notes are', 'les notes de cœur sont') WHERE description LIKE '%middle notes are%';
UPDATE products SET description = REPLACE(description, 'Base notes are', 'Les notes de fond sont') WHERE description LIKE '%Base notes are%';
UPDATE products SET description = REPLACE(description, 'base notes are', 'les notes de fond sont') WHERE description LIKE '%base notes are%';

-- Adjectifs courants
UPDATE products SET description = REPLACE(description, 'Aromatic', 'Aromatique') WHERE description LIKE '%Aromatic%';
UPDATE products SET description = REPLACE(description, 'Spicy', 'Épicé') WHERE description LIKE '%Spicy%';
UPDATE products SET description = REPLACE(description, 'Sweet', 'Sucré') WHERE description LIKE '%Sweet%';
UPDATE products SET description = REPLACE(description, 'Musky', 'Musqué') WHERE description LIKE '%Musky%';
UPDATE products SET description = REPLACE(description, 'Woody', 'Boisé') WHERE description LIKE '%Woody%';

-- Conjonctions et prépositions
UPDATE products SET description = REPLACE(description, ' and ', ' et ') WHERE description LIKE '% and %';

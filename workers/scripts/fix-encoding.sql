-- Correction des caractères français mal encodés dans la base de données

-- Corriger "bois�" → "boisé"
UPDATE products SET description = REPLACE(description, 'bois�', 'boisé') WHERE description LIKE '%bois�%';
UPDATE products SET name = REPLACE(name, 'bois�', 'boisé') WHERE name LIKE '%bois�%';

-- Corriger "�pic" → "épic"
UPDATE products SET description = REPLACE(description, '�pic', 'épic') WHERE description LIKE '%�pic%';
UPDATE products SET name = REPLACE(name, '�pic', 'épic') WHERE name LIKE '%�pic%';

-- Corriger "fra�" → "fraî"
UPDATE products SET description = REPLACE(description, 'fra�', 'fraî') WHERE description LIKE '%fra�%';
UPDATE products SET name = REPLACE(name, 'fra�', 'fraî') WHERE name LIKE '%fra�%';

-- Corriger "fle�" → "fleu"
UPDATE products SET description = REPLACE(description, 'fle�', 'fleu') WHERE description LIKE '%fle�%';
UPDATE products SET name = REPLACE(name, 'fle�', 'fleu') WHERE name LIKE '%fle�%';

-- Corriger "alc�" → "alcô"
UPDATE products SET description = REPLACE(description, 'alc�', 'alcô') WHERE description LIKE '%alc�%';
UPDATE products SET name = REPLACE(name, 'alc�', 'alcô') WHERE name LIKE '%alc�%';

-- Corriger "f�min" → "fémin"
UPDATE products SET description = REPLACE(description, 'f�min', 'fémin') WHERE description LIKE '%f�min%';
UPDATE products SET name = REPLACE(name, 'f�min', 'fémin') WHERE name LIKE '%f�min%';

-- Corriger "ic�n" → "icôn"
UPDATE products SET description = REPLACE(description, 'ic�n', 'icôn') WHERE description LIKE '%ic�n%';
UPDATE products SET name = REPLACE(name, 'ic�n', 'icôn') WHERE name LIKE '%ic�n%';

-- Corriger "ald�hyd" → "aldéhyd"
UPDATE products SET description = REPLACE(description, 'ald�hyd', 'aldéhyd') WHERE description LIKE '%ald�hyd%';
UPDATE products SET name = REPLACE(name, 'ald�hyd', 'aldéhyd') WHERE name LIKE '%ald�hyd%';

-- Corriger "�l�gant" → "élégant"
UPDATE products SET description = REPLACE(description, '�l�gant', 'élégant') WHERE description LIKE '%�l�gant%';
UPDATE products SET name = REPLACE(name, '�l�gant', 'élégant') WHERE name LIKE '%�l�gant%';

-- Corriger "cr�me" → "crème"
UPDATE products SET description = REPLACE(description, 'cr�me', 'crème') WHERE description LIKE '%cr�me%';
UPDATE products SET name = REPLACE(name, 'cr�me', 'crème') WHERE name LIKE '%cr�me%';

-- Corriger "p�che" → "pêche"
UPDATE products SET description = REPLACE(description, 'p�che', 'pêche') WHERE description LIKE '%p�che%';
UPDATE products SET name = REPLACE(name, 'p�che', 'pêche') WHERE name LIKE '%p�che%';

-- Corriger "fra�che" → "fraîche"
UPDATE products SET description = REPLACE(description, 'fra�che', 'fraîche') WHERE description LIKE '%fra�che%';
UPDATE products SET name = REPLACE(name, 'fra�che', 'fraîche') WHERE name LIKE '%fra�che%';

-- Corriger "l�ger" → "léger"
UPDATE products SET description = REPLACE(description, 'l�ger', 'léger') WHERE description LIKE '%l�ger%';
UPDATE products SET name = REPLACE(name, 'l�ger', 'léger') WHERE name LIKE '%l�ger%';

-- Corriger "d�licat" → "délicat"
UPDATE products SET description = REPLACE(description, 'd�licat', 'délicat') WHERE description LIKE '%d�licat%';
UPDATE products SET name = REPLACE(name, 'd�licat', 'délicat') WHERE name LIKE '%d�licat%';

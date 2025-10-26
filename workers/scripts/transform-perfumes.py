"""
Transform fra_perfumes.csv to match our database schema
"""

import pandas as pd
import json
import re
import os

def extract_perfumer(perfumers_str):
    """Extract first perfumer from JSON array string"""
    try:
        perfumers = json.loads(perfumers_str.replace("'", '"'))
        return perfumers[0] if perfumers else None
    except:
        return None

def extract_accords(accords_str):
    """Extract main accords from JSON array string"""
    try:
        accords = json.loads(accords_str.replace("'", '"'))
        return ','.join(accords[:5]) if accords else None  # Limit to 5 main accords
    except:
        return None

def extract_notes_from_description(desc):
    """Try to extract notes from description (best effort)"""
    if not desc or pd.isna(desc):
        return None, None, None

    # Try to find patterns like "Top notes are X; middle notes are Y; base notes are Z"
    top_match = re.search(r'[Tt]op notes? (?:are|is) ([^;.]+)', desc)
    middle_match = re.search(r'[Mm]iddle notes? (?:are|is) ([^;.]+)', desc)
    base_match = re.search(r'[Bb]ase notes? (?:are|is) ([^;.]+)', desc)

    top = top_match.group(1).strip() if top_match else None
    middle = middle_match.group(1).strip() if middle_match else None
    base = base_match.group(1).strip() if base_match else None

    return top, middle, base

def extract_brand_from_name(name):
    """Try to extract brand from perfume name"""
    if not isinstance(name, str) or pd.isna(name):
        return "Unknown"
    # Many perfumes follow pattern "Brand Name Perfume Name"
    # This is a simple heuristic - may need refinement
    parts = name.split()
    if len(parts) >= 2:
        return parts[0]
    return "Unknown"

def transform_perfumes():
    print("Loading fra_perfumes.csv...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "..", "data", "fra_perfumes.csv")
    output_path = os.path.join(script_dir, "..", "data", "fra_cleaned_transformed.csv")

    # Load CSV
    df = pd.read_csv(input_path)
    print(f"Loaded {len(df)} records")

    # Transform data
    print("Transforming data...")
    transformed = []

    for idx, row in df.iterrows():
        if idx % 5000 == 0:
            print(f"Processing record {idx}/{len(df)}...")

        # Extract notes from description
        top, middle, base = extract_notes_from_description(row['Description'])

        # Extract brand from name (simple heuristic)
        brand = extract_brand_from_name(row['Name'])

        # Build transformed record
        record = {
            'name': row['Name'].split('for women')[0].split('for men')[0].strip() if isinstance(row['Name'], str) else None,
            'brand': brand,
            'gender': row['Gender'] if not pd.isna(row['Gender']) else None,
            'year': None,  # Not in this dataset
            'perfumer': extract_perfumer(row['Perfumers']),
            'topNotes': top,
            'middleNotes': middle,
            'baseNotes': base,
            'mainAccords': extract_accords(row['Main Accords']),
            'description': row['Description'] if not pd.isna(row['Description']) else None,
            'rating': row['Rating Value'] if not pd.isna(row['Rating Value']) else None,
            'votes': row['Rating Count'] if not pd.isna(row['Rating Count']) else None,
            'imageUrl': None,  # Could extract from URL but images not directly available
            'fragrancaId': row['url'].split('/')[-1].replace('.html', '') if isinstance(row['url'], str) else None
        }

        transformed.append(record)

    # Create DataFrame
    df_transformed = pd.DataFrame(transformed)

    # Save to CSV
    print(f"\nSaving {len(df_transformed)} records to {output_path}")
    df_transformed.to_csv(output_path, index=False)

    print("SUCCESS: Transformation complete!")
    print(f"Total records: {len(df_transformed)}")
    print("\nNext steps:")
    print("1. Update import-fragrances.ts to use fra_cleaned_transformed.csv")
    print("2. Run: npx tsx scripts/import-fragrances.ts")

if __name__ == "__main__":
    transform_perfumes()

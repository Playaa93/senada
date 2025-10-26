"""
Download Fragrantica dataset from Kaggle using kagglehub
Requires: pip install kagglehub pandas
"""

import kagglehub
from kagglehub import KaggleDatasetAdapter
import os
import sys

def download_dataset():
    print("Downloading Fragrantica dataset from Kaggle...")
    print("This may take a few minutes depending on your connection...")

    try:
        # Load the dataset using pandas adapter
        # First, download the dataset to get file paths
        print("Downloading dataset files...")
        dataset_path = kagglehub.dataset_download("olgagmiufana1/fragrantica-com-fragrance-dataset")
        print(f"Dataset downloaded to: {dataset_path}")

        # List available files
        import glob
        csv_files = glob.glob(os.path.join(dataset_path, "*.csv"))
        print(f"Available CSV files: {csv_files}")

        if not csv_files:
            raise Exception("No CSV files found in the dataset")

        # Use the first CSV file (likely fra_cleaned.csv)
        csv_file = csv_files[0]
        print(f"Using file: {csv_file}")

        # Load with pandas - try multiple encodings
        import pandas as pd
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
        df = None

        for encoding in encodings:
            try:
                print(f"Trying encoding: {encoding}")
                df = pd.read_csv(csv_file, encoding=encoding)
                print(f"Success with encoding: {encoding}")
                break
            except UnicodeDecodeError:
                continue

        if df is None:
            raise Exception("Could not decode CSV with any common encoding")

        print(f"SUCCESS: Dataset loaded: {len(df)} records")
        print(f"Columns: {list(df.columns)}")

        # Get the output path
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(script_dir, "..", "data", "fra_cleaned.csv")

        # Ensure data directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save to CSV
        print(f"\nSaving to: {output_path}")
        df.to_csv(output_path, index=False)

        print(f"SUCCESS: Dataset saved successfully!")
        print(f"Total records: {len(df)}")
        print("\nNext steps:")
        print("1. cd workers")
        print("2. npx tsx scripts/import-fragrances.ts")
        print("3. Import to D1 with wrangler")

    except Exception as e:
        print(f"ERROR downloading dataset: {e}")
        print("\nMake sure you have:")
        print("1. Python installed")
        print("2. kagglehub installed: pip install kagglehub pandas")
        print("3. Kaggle API credentials configured (optional for public datasets)")
        sys.exit(1)

if __name__ == "__main__":
    download_dataset()

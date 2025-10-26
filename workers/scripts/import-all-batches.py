"""
Import all SQL batch files to D1 database with progress tracking
"""

import os
import subprocess
import glob
from pathlib import Path

def import_batches():
    script_dir = Path(__file__).parent
    sql_dir = script_dir.parent / "migrations" / "fragrance-import"

    # Get all SQL files
    sql_files = sorted(glob.glob(str(sql_dir / "*.sql")))
    total = len(sql_files)

    print("=" * 60)
    print(f"Importing {total} SQL batch files to D1 local database")
    print("This will take approximately 10-20 minutes")
    print("=" * 60)
    print()

    success_count = 0
    error_count = 0

    for idx, sql_file in enumerate(sql_files, 1):
        file_name = Path(sql_file).name

        # Show progress every 50 files or at key milestones
        if idx % 50 == 0 or idx in [1, 100, 200, 300, 400, 500, 600, 700]:
            progress = (idx / total) * 100
            print(f"[{idx}/{total}] Progress: {progress:.1f}% - Importing {file_name}...")

        # Execute wrangler command
        try:
            result = subprocess.run(
                ["npx", "wrangler", "d1", "execute", "senada-db", "--local", f"--file={sql_file}"],
                capture_output=True,
                text=True,
                timeout=30,
                cwd=str(script_dir.parent)
            )

            if result.returncode == 0:
                success_count += 1
            else:
                error_count += 1
                print(f"ERROR importing {file_name}: {result.stderr}")

        except subprocess.TimeoutExpired:
            error_count += 1
            print(f"TIMEOUT importing {file_name}")
        except Exception as e:
            error_count += 1
            print(f"ERROR importing {file_name}: {e}")

    print()
    print("=" * 60)
    print(f"Import completed!")
    print(f"Success: {success_count} files")
    print(f"Errors: {error_count} files")
    print("=" * 60)
    print()

    # Verify import
    print("Verifying import...")
    result = subprocess.run(
        ["npx", "wrangler", "d1", "execute", "senada-db", "--local",
         '--command=SELECT COUNT(*) as total FROM fragrances'],
        capture_output=True,
        text=True,
        cwd=str(script_dir.parent)
    )
    print(result.stdout)

if __name__ == "__main__":
    import_batches()

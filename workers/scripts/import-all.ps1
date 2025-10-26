$ErrorActionPreference = "SilentlyContinue"

Write-Host "============================================================"
Write-Host "Importing 70,103 fragrances to D1 local database"
Write-Host "This will take approximately 10-20 minutes"
Write-Host "============================================================"
Write-Host ""

$files = Get-ChildItem ".\migrations\fragrance-import\*.sql" | Sort-Object Name
$total = $files.Count
$i = 0
$errors = 0

foreach ($file in $files) {
    $i++

    # Show progress at key milestones
    if ($i % 50 -eq 0 -or $i -eq 1 -or $i -eq 100 -or $i -eq 200 -or $i -eq 300 -or $i -eq 400 -or $i -eq 500 -or $i -eq 600 -or $i -eq 700) {
        $percent = [math]::Round(($i / $total) * 100, 1)
        Write-Host "[$i/$total] $percent% - $($file.Name)"
    }

    # Execute wrangler command
    $result = npx wrangler d1 execute senada-db --local --file="$($file.FullName)" 2>&1

    if ($LASTEXITCODE -ne 0) {
        $errors++
    }
}

Write-Host ""
Write-Host "============================================================"
Write-Host "Import completed!"
Write-Host "Success: $($i - $errors) files"
Write-Host "Errors: $errors files"
Write-Host "============================================================"
Write-Host ""

Write-Host "Verifying import..."
npx wrangler d1 execute senada-db --local --command "SELECT COUNT(*) as total FROM fragrances"

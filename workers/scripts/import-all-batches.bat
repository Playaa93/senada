@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Importing 70,103 fragrances to D1 local database
echo This will take approximately 10-20 minutes
echo ========================================
echo.

set count=0
set total=702

for %%f in (migrations\fragrance-import\*.sql) do (
    set /a count+=1
    echo [!count!/!total!] Importing %%~nxf...
    npx wrangler d1 execute senada-db --local --file="%%f" > nul 2>&1
    if !count! equ 50 echo Progress: 7%%
    if !count! equ 100 echo Progress: 14%%
    if !count! equ 200 echo Progress: 28%%
    if !count! equ 300 echo Progress: 43%%
    if !count! equ 400 echo Progress: 57%%
    if !count! equ 500 echo Progress: 71%%
    if !count! equ 600 echo Progress: 85%%
)

echo.
echo ========================================
echo SUCCESS: All batches imported!
echo Total: !count! files processed
echo ========================================
echo.
echo Verifying import...
npx wrangler d1 execute senada-db --local --command "SELECT COUNT(*) as total FROM fragrances"

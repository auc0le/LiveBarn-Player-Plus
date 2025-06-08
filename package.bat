@echo off
echo Packaging LiveBarn Pro Controls Firefox extension...
set EXTENSION_NAME=livebarn-pro-controls
set VERSION=1.0
set OUTPUT_FILE=%EXTENSION_NAME%-v%VERSION%.xpi

:: Remove existing package if it exists
if exist "%OUTPUT_FILE%" del "%OUTPUT_FILE%"

:: Create ZIP file with all necessary files
echo Creating package...
powershell -Command "Compress-Archive -Path 'manifest.json','content.js','styles.css' -DestinationPath '%EXTENSION_NAME%-temp.zip' -Force"

:: Rename to XPI
ren "%EXTENSION_NAME%-temp.zip" "%OUTPUT_FILE%"

echo.
echo ✓ Extension packaged successfully!
echo Package: %OUTPUT_FILE%
echo.
echo INSTALLATION OPTIONS:
echo.
echo === Option 1: Temporary Add-on (Recommended for testing) ===
echo 1. Open Firefox
echo 2. Go to about:debugging
echo 3. Click 'This Firefox'
echo 4. Click 'Load Temporary Add-on...'
echo 5. Select manifest.json from this folder
echo    (Note: Extension will be removed when Firefox restarts)
echo.
echo === Option 2: XPI Installation (Unsigned) ===
echo 1. Drag and drop %OUTPUT_FILE% into Firefox
echo 2. Firefox will warn about unsigned extension
echo 3. Only works if xpinstall.signatures.required is set to false
echo    in about:config (NOT recommended for security)
echo.
echo === Option 3: Developer Mode (Most Reliable) ===
echo 1. Open Firefox
echo 2. Go to about:config
echo 3. Search for 'xpinstall.signatures.required'
echo 4. Set to 'false' (WARNING: Security risk)
echo 5. Drag %OUTPUT_FILE% into Firefox
echo.
echo RECOMMENDED: Use Option 1 for daily use
echo The extension will work perfectly as a temporary add-on
echo.
pause
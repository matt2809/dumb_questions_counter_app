@echo off
echo Deploying to Cloudflare Pages...
echo.

echo Building the project...
call npm run build:cloudflare
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
echo Next steps:
echo 1. Go to https://dash.cloudflare.com/pages
echo 2. Create a new project
echo 3. Connect your Git repository
echo 4. Set build command to: npm run build:cloudflare
echo 5. Set build output directory to: dist
echo 6. Add environment variable VITE_CONVEX_URL with your Convex URL
echo 7. Deploy!
echo.
echo Or use Wrangler CLI:
echo wrangler deploy
echo.
pause

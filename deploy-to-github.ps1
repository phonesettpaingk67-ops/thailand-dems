# Deploy Thailand DEMS to GitHub + Vercel + Railway
# Run this script to deploy everything in one go!

Write-Host "Thailand DEMS - Automated Deployment Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Git not initialized. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "Git initialized" -ForegroundColor Green
}

# Step 1: Verify files exist
Write-Host "Step 1: Verifying project files..." -ForegroundColor Cyan
$requiredFiles = @(
    "backend/server-disaster.js",
    "frontend/package.json",
    "backend/db/schema-disaster.sql",
    "README.md"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "Required files missing. Please check your project structure." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All required files found!" -ForegroundColor Green
Write-Host ""

# Step 2: Check for sensitive files
Write-Host "Step 2: Checking for sensitive files..." -ForegroundColor Cyan
$sensitiveFiles = Get-ChildItem -Recurse -Include .env -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*node_modules*" }

if ($sensitiveFiles.Count -gt 0) {
    Write-Host "  Found .env files (they will be ignored by .gitignore):" -ForegroundColor Yellow
    foreach ($file in $sensitiveFiles) {
        Write-Host "    - $($file.FullName)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  No .env files found (they're in .gitignore)" -ForegroundColor Green
}

Write-Host ""

# Step 3: Git status
Write-Host "Step 3: Checking git status..." -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
    Write-Host "  Changes detected:" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "  No changes to commit" -ForegroundColor Green
}

Write-Host ""

# Step 4: Ask for commit message
Write-Host "Step 4: Preparing commit..." -ForegroundColor Cyan
$commitMessage = Read-Host "Enter commit message (default: 'Deploy Thailand DEMS v2.0')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Deploy Thailand DEMS v2.0"
}

# Step 5: Git add and commit
Write-Host ""
Write-Host "Step 5: Adding files to git..." -ForegroundColor Cyan
git add .
Write-Host "Files staged" -ForegroundColor Green

Write-Host ""
Write-Host "Step 6: Committing changes..." -ForegroundColor Cyan
git commit -m $commitMessage
Write-Host "Changes committed" -ForegroundColor Green

# Step 6: Check for remote
Write-Host ""
Write-Host "Step 7: Checking git remote..." -ForegroundColor Cyan
$remote = git remote get-url origin 2>$null

if ($remote) {
    Write-Host "  Remote found: $remote" -ForegroundColor Green
    
    # Push to GitHub
    Write-Host ""
    Write-Host "Step 8: Pushing to GitHub..." -ForegroundColor Cyan
    git push origin main
    Write-Host "Pushed to GitHub!" -ForegroundColor Green
    
} else {
    Write-Host "  No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create a GitHub repository and run:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "  2. Create repository 'thailand-dems'" -ForegroundColor White
    Write-Host "  3. Run these commands:" -ForegroundColor White
    Write-Host ""
    Write-Host "     git remote add origin https://github.com/YOUR_USERNAME/thailand-dems.git" -ForegroundColor Cyan
    Write-Host "     git branch -M main" -ForegroundColor Cyan
    Write-Host "     git push -u origin main" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

# Step 7: Deployment URLs
Write-Host ""
Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Deploy Backend (Railway):" -ForegroundColor Yellow
Write-Host "   - Go to https://railway.app" -ForegroundColor White
Write-Host "   - New Project -> Deploy from GitHub" -ForegroundColor White
Write-Host "   - Select 'thailand-dems' repository" -ForegroundColor White
Write-Host "   - Add MySQL database" -ForegroundColor White
Write-Host "   - Configure environment variables" -ForegroundColor White
Write-Host ""
Write-Host "2. Deploy Frontend (Vercel):" -ForegroundColor Yellow
Write-Host "   - Go to https://vercel.com" -ForegroundColor White
Write-Host "   - Import 'thailand-dems' repository" -ForegroundColor White
Write-Host "   - Framework: Next.js" -ForegroundColor White
Write-Host "   - Root Directory: frontend" -ForegroundColor White
Write-Host "   - Add NEXT_PUBLIC_API_URL variable" -ForegroundColor White
Write-Host ""
Write-Host "Full Guide: See DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "Quick Guide: See QUICK_GITHUB_DEPLOY.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Thailand DEMS will be live in about 5 minutes!" -ForegroundColor Green
Write-Host ""

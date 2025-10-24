#!/bin/bash

echo "🔍 GitHub Actions Workflow Verification"
echo "========================================"
echo ""

# Check current branch
echo "📍 Current branch:"
CURRENT_BRANCH=$(git branch --show-current)
echo "   $CURRENT_BRANCH"
if [ "$CURRENT_BRANCH" != "stage" ]; then
    echo "   ⚠️  Warning: Not on 'stage' branch. Workflow triggers on 'stage' branch only."
else
    echo "   ✅ On correct branch"
fi
echo ""

# Check if workflow file exists
echo "📄 Workflow file check:"
if [ -f ".github/workflows/ci-cd.yml" ]; then
    echo "   ✅ Workflow file exists locally"
else
    echo "   ❌ Workflow file not found"
    exit 1
fi
echo ""

# Check if workflow is committed
echo "📝 Workflow commit status:"
git diff --quiet .github/workflows/ci-cd.yml
if [ $? -eq 0 ]; then
    echo "   ✅ Workflow file is committed (no local changes)"
else
    echo "   ⚠️  Workflow file has uncommitted changes"
    echo "   Run: git add .github/workflows/ci-cd.yml && git commit -m 'Update workflow'"
fi
echo ""

# Check if workflow exists on remote
echo "🌐 Remote repository check:"
git ls-tree -r origin/stage --name-only | grep -q ".github/workflows/ci-cd.yml"
if [ $? -eq 0 ]; then
    echo "   ✅ Workflow exists on remote 'stage' branch"
else
    echo "   ❌ Workflow not found on remote. Push required."
fi
echo ""

# Check repository remote
echo "🔗 Repository remote:"
git remote -v | grep origin | head -1
echo ""

# Required files for Docker build
echo "🐳 Docker build requirements:"
FILES=("Dockerfile" "package.json" "nuxt.config.ts")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file missing"
    fi
done
echo ""

echo "📋 Next Steps:"
echo "   1. Ensure GitHub Actions is enabled in repository settings"
echo "   2. Verify Azure secrets are configured:"
echo "      - AZURE_CREDENTIALS"
echo "      - REGISTRY_NAME"
echo "      - REGISTRY_LOGIN_SERVER"
echo "   3. Commit and push if there are changes"
echo "   4. Check GitHub Actions tab: https://github.com/berthemoose/order-panel-k2dp/actions"
echo ""
echo "   To manually trigger: Go to Actions → CI/CD Pipeline → Run workflow"

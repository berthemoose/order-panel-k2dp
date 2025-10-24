# GitHub Actions Troubleshooting Guide

## Issue: Workflow Not Triggering on Push

### Changes Made to Fix
1. ✅ Added `workflow_dispatch` trigger for manual testing
2. ✅ Added explicit `permissions` block for Azure authentication
3. ✅ Added repository structure verification step
4. ✅ Improved Docker build with explicit Dockerfile path and latest tag

### Common Reasons Why Workflows Don't Trigger

#### 1. GitHub Actions Not Enabled
**Check:**
- Go to your repository on GitHub: https://github.com/berthemoose/order-panel-k2dp
- Navigate to **Settings** → **Actions** → **General**
- Ensure "Actions permissions" is set to **Allow all actions and reusable workflows** or **Allow local and select actions**

#### 2. Missing Required Secrets
**Required secrets for this workflow:**
- `AZURE_CREDENTIALS` - Azure service principal credentials
- `REGISTRY_NAME` - Azure Container Registry name (e.g., `yourregistry`)
- `REGISTRY_LOGIN_SERVER` - ACR login server (e.g., `yourregistry.azurecr.io`)

**To verify:**
- Go to **Settings** → **Secrets and variables** → **Actions**
- Check that all three secrets exist and are correctly configured

#### 3. Workflow File Not Committed/Pushed
**Verify:**
```bash
git status
git log --oneline -1 .github/workflows/ci-cd.yml
```

**If modified locally, commit and push:**
```bash
git add .github/workflows/ci-cd.yml
git commit -m "Fix CI/CD workflow configuration"
git push origin stage
```

#### 4. Branch Name Mismatch
**Current configuration:** Triggers only on pushes to `stage` branch
**Verify your current branch:**
```bash
git branch --show-current
```
Should output: `stage`

#### 5. First-Time Workflow Setup
If this is the first time the workflow is being added:
- The workflow needs to exist in the **default branch** (usually `main`) first
- OR you need to manually trigger it once using `workflow_dispatch`

### How to Test Manually

Since we added `workflow_dispatch`, you can manually trigger the workflow:
1. Go to **Actions** tab in your GitHub repository
2. Select "CI/CD Pipeline for Drukarnia Projektów Order Panel"
3. Click **Run workflow** button
4. Select branch: `stage`
5. Click **Run workflow**

### Debugging Steps

1. **Check GitHub Actions Status Page**
   - Visit: https://www.githubstatus.com/
   - Ensure GitHub Actions is operational

2. **Verify Workflow Syntax**
   ```bash
   # The workflow file has been validated and is syntactically correct
   ```

3. **Check Workflow Runs**
   - Go to the **Actions** tab in your repository
   - Look for any workflow runs (successful, failed, or in progress)
   - If you see "No workflows" → Actions might not be enabled

4. **Check Repository Permissions**
   - Ensure you have admin/write access to the repository
   - For organization repos, check that Actions are allowed at the org level

### Expected Behavior After Fix

Once you commit and push the updated workflow:
1. Navigate to GitHub Actions tab
2. You should see a new workflow run triggered by the push
3. The "Verify Repository Structure" step will show debug output
4. You can also manually trigger the workflow using the "Run workflow" button

### Next Steps

1. Commit the updated workflow file:
   ```bash
   git add .github/workflows/ci-cd.yml GITHUB_ACTIONS_TROUBLESHOOTING.md
   git commit -m "Fix GitHub Actions workflow with permissions and manual trigger"
   git push origin stage
   ```

2. Go to GitHub Actions tab and verify the workflow runs

3. If still no logs appear:
   - Check GitHub Actions is enabled (Settings → Actions)
   - Verify all required secrets are configured
   - Try manual trigger via `workflow_dispatch`

### Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Troubleshooting GitHub Actions](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
- [Azure Login Action](https://github.com/Azure/login)

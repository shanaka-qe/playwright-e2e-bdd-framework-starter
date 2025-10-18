# CI/CD Configurations

This folder contains CI/CD pipeline configurations for different platforms.

## 📁 Contents

- **`.gitlab-ci.yml`** - GitLab CI/CD pipeline configuration
- **`Jenkinsfile`** - Jenkins pipeline configuration

## 🚀 Setup Instructions

### GitLab CI

**Option 1: Configure Custom Path (Recommended)**
1. Go to your GitLab project
2. Navigate to Settings → CI/CD → General pipelines
3. Expand "General pipelines"
4. Set "CI/CD configuration file" to: `ci/.gitlab-ci.yml`
5. Save changes

**Option 2: Create Symlink at Root**
```bash
ln -s ci/.gitlab-ci.yml .gitlab-ci.yml
git add .gitlab-ci.yml
git commit -m "Add GitLab CI symlink"
```

### Jenkins

1. Go to your Jenkins instance
2. Create a new Pipeline job
3. Configure Pipeline settings:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your repository URL
   - **Script Path**: `ci/Jenkinsfile`
4. Save and run

### GitHub Actions

GitHub Actions workflows are in `.github/workflows/` directory - no configuration needed!

## 📚 Documentation

For detailed CI/CD setup instructions, see [CI/CD Setup Guide](../documentation/ci-cd-setup.md).


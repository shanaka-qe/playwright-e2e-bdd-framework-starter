# Contributing to Playwright E2E BDD Framework

Thank you for your interest in contributing to this project! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic understanding of TypeScript and Playwright
- Familiarity with BDD/Gherkin syntax (optional)

### Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/playwright-e2e-bdd-framework.git
   cd playwright-e2e-bdd-framework
   ```

3. **Install dependencies**
   ```bash
   npm install
   npx playwright install
   ```

4. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Run tests to verify setup**
   ```bash
   npm run test:smoke
   ```

## 🛠️ How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📝 **Documentation improvements**
- 🧪 **Test coverage enhancements**
- 🎨 **Code refactoring**
- 🔧 **Configuration improvements**
- 💡 **Feature requests and ideas**

### Reporting Bugs

Before creating a bug report:
1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/playwright-e2e-bdd-framework/issues)
2. Ensure you're using the latest version
3. Verify the bug is reproducible

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots/Logs**
If applicable, add screenshots or error logs.

**Environment:**
 - OS: [e.g., macOS 13.0]
 - Node.js version: [e.g., 18.16.0]
 - Playwright version: [e.g., 1.54.1]
 - Browser: [e.g., Chrome 120]
```

### Suggesting Features

**Feature Request Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Add any other context, mockups, or screenshots about the feature request.
```

## 💻 Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

**Example:**
```bash
git checkout -b feature/add-visual-regression
git checkout -b bugfix/fix-login-timeout
git checkout -b docs/update-api-reference
```

### Development Process

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, self-documenting code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run tests
   npm run test:smoke
   npm run test:regression
   
   # Run linting
   npm run lint
   
   # Generate BDD tests (if applicable)
   npm run bdd:generate
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add visual regression testing"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

## 📏 Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Enable strict type checking
- Avoid `any` types when possible
- Use interfaces for object shapes
- Export types and interfaces that might be reused

**Example:**
```typescript
// ✅ Good
interface UserCredentials {
  email: string;
  password: string;
}

async function login(credentials: UserCredentials): Promise<void> {
  // implementation
}

// ❌ Bad
async function login(email: any, password: any) {
  // implementation
}
```

### Test Organization

- **Page Objects**: Place in `src/applications/{app}/pages/`
- **Test Files**: Organize by application and type (ui/api/integration)
- **Feature Files**: Place in `features/{app}/` for BDD tests
- **Step Definitions**: Centralize in `features/steps/`

### Naming Conventions

- **Files**: Use kebab-case (e.g., `user-management.spec.ts`)
- **Classes**: Use PascalCase (e.g., `UserManagementPage`)
- **Functions**: Use camelCase (e.g., `getUserDetails()`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at end of statements
- Maximum line length: 100 characters
- Add JSDoc comments for public methods

**Example:**
```typescript
/**
 * Logs in a user with provided credentials
 * @param email - User email address
 * @param password - User password
 * @returns Promise that resolves when login is complete
 */
async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
}
```

## 📝 Commit Guidelines

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates
- `ci`: CI/CD configuration changes

### Examples

```bash
feat(webapp): add document upload functionality

- Implement drag-and-drop upload
- Add file type validation
- Display upload progress

Closes #123

---

fix(auth): resolve token expiration issue

- Implement automatic token refresh
- Add retry logic for failed requests

Fixes #456

---

docs(readme): update installation instructions

- Add prerequisites section
- Update npm commands
- Add troubleshooting guide
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally (`npm test`)
- [ ] New tests added for new functionality
- [ ] Documentation updated (README, inline comments)
- [ ] No console errors or warnings
- [ ] Commits follow conventional commits format
- [ ] Branch is up to date with main

### PR Checklist

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #(issue number)
```

### Review Process

1. A maintainer will review your PR within 48 hours
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be acknowledged in release notes

### After Your PR is Merged

1. Delete your feature branch
2. Pull the latest changes from main
3. Celebrate! 🎉

## 🆘 Getting Help

- **Questions?** Open a [Discussion](https://github.com/yourusername/playwright-e2e-bdd-framework/discussions)
- **Bugs?** Open an [Issue](https://github.com/yourusername/playwright-e2e-bdd-framework/issues)
- **Chat?** Join our community (if applicable)

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright-BDD Documentation](https://vitalets.github.io/playwright-bdd)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)

## 🏆 Recognition

Contributors will be acknowledged in:
- Project README
- Release notes
- Contributors page (if applicable)

Thank you for contributing! Your efforts help make this framework better for everyone. 🙏


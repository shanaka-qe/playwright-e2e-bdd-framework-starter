# Framework Setup & Important Notes

## ⚠️ Important: This is a Template/Reference Architecture

This repository is a **starter template** and **reference architecture** extracted from a real-world enterprise E2E testing project. It demonstrates professional patterns, structure, and best practices.

### What This Template Provides

✅ **Complete Architecture**
- Multi-application test structure
- BDD with Playwright-BDD integration
- Page Object Model pattern
- CI/CD pipelines (GitHub Actions, GitLab, Jenkins)
- Comprehensive configuration management
- Test data factories and builders

✅ **Professional Patterns**
- Environment-based configuration
- Role-based testing helpers
- Reusable components
- Custom reporters
- Test isolation strategies

### What Requires Implementation

The template includes example test files that reference actual application implementations. **You will need to:**

1. **Replace Example Tests** with your own application tests
2. **Implement Page Objects** for your specific application
3. **Configure Application URLs** in `.env` and config files
4. **Add Your API Clients** in `src/applications/`
5. **Remove or adapt** example tests in `tests/` directory

## 🚀 Quick Start for New Projects

### Option 1: Start Fresh (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/playwright-e2e-bdd-framework.git
cd playwright-e2e-bdd-framework

# 2. Install dependencies
npm install
npx playwright install

# 3. Remove example tests
rm -rf tests/e2e tests/comprehensive tests/adminapp tests/webapp

# 4. Create your first test
mkdir -p tests/your-app/ui
cat > tests/your-app/ui/example.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Your App/);
});
EOF

# 5. Run your test
npm test tests/your-app/
```

### Option 2: Adapt Existing Tests

If you want to adapt the existing test structure:

```bash
# 1. Update configuration
cp env.example .env
# Edit .env with your URLs

# 2. Implement page objects for your app
# See: src/applications/*/pages/

# 3. Update test files to match your implementation
# See: tests/*/
```

## 📝 TypeScript Compilation Notes

The template includes reference implementations that may not compile without the actual application code. This is **intentional** and **expected**.

### To Use This Template:

1. **For Learning**: Study the patterns, structure, and configurations
2. **For Starting**: Remove example tests and build your own
3. **For Reference**: Use as a guide for your implementation

### To Fix Compilation Errors:

Either:
- **Remove example test files** you don't need
- **Implement the missing page objects** for your application
- **Update imports** to match your structure
- **Add missing dependencies** (zod, @prisma/client) if needed

## 🛠️ Core Dependencies

The template requires these core dependencies (already in package.json):

```json
{
  "@playwright/test": "^1.54.1",
  "playwright-bdd": "^8.3.1",
  "typescript": "^5.8.3"
}
```

### Optional Dependencies (Add if Needed)

```bash
# For validation
npm install zod

# For database testing
npm install @prisma/client

# For additional testing utilities
npm install @faker-js/faker
```

## 📚 What To Keep vs. What To Modify

### ✅ Keep As-Is
- `/config/` - Configuration structure
- `/.github/workflows/` - CI/CD pipelines
- `/documentation/` - Guides and references
- Core structure and patterns

### 🔧 Modify For Your Project
- `/tests/` - Replace with your tests
- `/features/` - Replace with your BDD scenarios
- `/src/applications/` - Implement your page objects
- `.env` - Update with your URLs

### 🗑️ Safe To Remove
- `/tests/e2e/` - Example E2E tests
- `/tests/comprehensive/` - Example workflow tests
- `/tests/adminapp/` - Example admin tests
- `/tests/webapp/` - Example webapp tests

## 🎯 Recommended First Steps

1. **Study the Structure** (30 min)
   - Review `/documentation/folder-structure.md`
   - Understand the config hierarchy
   - Review BDD integration

2. **Set Up Your Environment** (15 min)
   ```bash
   cp env.example .env
   # Edit .env with your application URLs
   ```

3. **Create Your First Test** (30 min)
   - Start with a simple smoke test
   - Follow the Page Object pattern
   - Run it to verify setup

4. **Add BDD Tests** (optional)
   - Create `.feature` files
   - Write step definitions
   - Generate and run BDD tests

5. **Configure CI/CD** (30 min)
   - Review `.github/workflows/`
   - Adapt to your needs
   - Push and verify

## ❓ FAQ

### Why does TypeScript show errors?

The template includes reference implementations that depend on actual application code. This is a **template/reference architecture**, not a complete application.

**Solution**: Remove example tests or implement the required page objects for your application.

### Can I use this in production?

Yes! The architecture and patterns are production-ready. You need to:
1. Implement your page objects
2. Write your tests
3. Configure for your environment
4. Add any application-specific logic

### Do I need all the dependencies?

Core dependencies (Playwright, TypeScript, Playwright-BDD) are required. Optional ones (zod, @prisma/client) are only needed if you use those features.

### How do I handle the compilation errors?

Choose one approach:
1. **Remove example tests**: `rm -rf tests/e2e tests/comprehensive`
2. **Implement missing code**: Add your page objects and implementations
3. **Use as reference only**: Study the patterns without compiling

## 📧 Support

- 📖 [Full Documentation](documentation/)
- 🎓 [Getting Started Guide](getting-started.md)
- 🤝 [Contributing Guide](contributing.md)
- 💬 [GitHub Discussions](https://github.com/yourusername/playwright-e2e-bdd-framework/discussions)

---

**Remember**: This is a **professional reference architecture** and **starter template**. It's meant to be adapted to your specific application, not used as-is without modification.


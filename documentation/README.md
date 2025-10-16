# Playwright E2E BDD Framework

**Enterprise-Grade QA Automation Framework**

[![Playwright](https://img.shields.io/badge/Playwright-1.54.1-green.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![BDD](https://img.shields.io/badge/BDD-Playwright--BDD-yellow.svg)](https://github.com/vitalets/playwright-bdd)

## 🎯 Overview

The Playwright E2E BDD Framework is a comprehensive, scalable, and maintainable test automation solution built with Playwright and Playwright-BDD. It supports multiple applications (WebApp, AdminApp, MCP Server) with a professional architecture designed for enterprise environments.

## 🚀 Key Features

### 🏗️ **Professional Architecture**
- **Application-Centric Organization**: Separate testing for WebApp, AdminApp, and MCP Server
- **Environment-Specific Configuration**: Development, Staging, and Production settings
- **Modular Design**: Shared components, utilities, and application-specific implementations
- **Enterprise Scalability**: Easy to extend for new applications and test types

### 🧪 **Testing Capabilities**
- **Multi-Application Testing**: WebApp UI/API, AdminApp UI/API, MCP Server API
- **BDD Support**: Gherkin feature files with Playwright-BDD integration
- **Cross-Browser Testing**: Chrome, Firefox, Safari support
- **Mobile Testing**: Responsive design validation
- **API Testing**: RESTful API validation and integration
- **Cross-Application Workflows**: End-to-end business process testing

### ⚙️ **Advanced Configuration**
- **Environment Management**: Dev/Staging/Prod configurations
- **Application-Specific Settings**: Tailored configs for each application
- **Parallel Execution**: Optimized test performance
- **Comprehensive Reporting**: HTML, JSON, JUnit, and custom reports
- **CI/CD Ready**: GitHub Actions, Jenkins, and other CI platforms

## 📁 Project Structure

```
playwright-e2e-tests/
├── 📁 config/                    # Configuration management
│   ├── applications/              # Application-specific configs
│   ├── environments/              # Environment-specific settings
│   └── playwright.config.ts       # Main Playwright configuration
├── 📁 src/                       # Source code organization
│   ├── applications/              # App-specific implementations
│   ├── core/                      # Framework core utilities
│   └── data/                      # Test data management
├── 📁 tests/                     # Test files organized by application
│   ├── webapp/                    # WebApp tests (UI/API/Integration)
│   ├── adminapp/                  # AdminApp tests
│   ├── mcp-server/                # MCP Server API tests
│   └── cross-app/                 # Cross-application workflows
├── 📁 features/                  # BDD Gherkin feature files
│   ├── webapp/                    # WebApp BDD scenarios
│   ├── adminapp/                  # AdminApp BDD scenarios
│   ├── mcp-server/                # MCP Server BDD scenarios
│   └── steps/                     # Step definitions
├── 📁 reports/                   # Test execution reports
└── 📁 documentation/             # Comprehensive documentation
```

## 🚀 Quick Start

### Prerequisites
```bash
- Node.js 18+ 
- TypeScript 5.8+
- Playwright 1.54+
```

### Installation
```bash
# Clone and install
npm install

# Install Playwright browsers
npx playwright install

# Validate setup
npm run framework:validate
```

### Running Tests

#### **Application-Specific Testing**
```bash
# WebApp Tests
npm run test:webapp:ui          # WebApp UI tests
npm run test:webapp:api         # WebApp API tests

# AdminApp Tests  
npm run test:adminapp:ui        # AdminApp UI tests
npm run test:adminapp:api       # AdminApp API tests

# MCP Server Tests
npm run test:mcp:api            # MCP Server API tests

# Cross-Application Tests
npm run test:cross-app          # End-to-end workflows
```

#### **BDD Testing**
```bash
# Generate BDD tests from feature files
npm run bdd:generate

# Run BDD tests by application
npm run bdd:webapp              # WebApp BDD scenarios
npm run bdd:adminapp            # AdminApp BDD scenarios
npm run bdd:mcp                 # MCP Server BDD scenarios
```

#### **Environment-Specific Testing**
```bash
# Development Environment
NODE_ENV=development npm run test:smoke

# Staging Environment  
NODE_ENV=staging npm run test:regression

# Production Environment (Read-only tests)
NODE_ENV=production npm run test:smoke
```

## 🏗️ Architecture Principles

### **1. Application Separation**
Each application (WebApp, AdminApp, MCP Server) has its own:
- Configuration files
- Page Object Models
- API clients
- Test suites
- BDD scenarios

### **2. Environment Management**
- **Development**: Debug-friendly, slower execution, verbose logging
- **Staging**: Production-like testing with comprehensive scenarios
- **Production**: Read-only smoke tests, optimized performance

### **3. Test Organization**
- **UI Tests**: User interface validation and interaction
- **API Tests**: RESTful API testing and data validation
- **Integration Tests**: Application workflow validation
- **Cross-App Tests**: End-to-end business process testing

### **4. Shared Resources**
- **Core Framework**: Base classes, utilities, managers
- **Shared Components**: Reusable UI components and helpers
- **Data Management**: Test data factories and seeders

## 📊 Reporting and Analytics

### **Report Types**
- **HTML Reports**: Interactive test execution results
- **JSON Reports**: Machine-readable test data
- **JUnit Reports**: CI/CD integration format
- **Custom Reports**: Application-specific metrics and analytics

### **Report Organization**
- **Application-Specific**: Individual reports per application
- **Combined Reports**: Aggregated cross-application results
- **Environment Reports**: Environment-specific test results

## 🔧 Configuration Management

### **Application Configs**
- `webapp.config.ts`: WebApp-specific settings
- `adminapp.config.ts`: AdminApp configuration
- `mcp-server.config.ts`: MCP Server settings
- `shared.config.ts`: Common framework settings

### **Environment Configs**
- `dev.config.ts`: Development environment settings
- `staging.config.ts`: Staging environment configuration
- `prod.config.ts`: Production environment settings

## 🧪 Testing Methodologies

### **Traditional Playwright Testing**
- Page Object Model pattern
- Fixture-based test organization
- Parallel execution optimization
- Visual regression testing

### **BDD (Behavior-Driven Development)**
- Gherkin syntax feature files
- Natural language test scenarios
- Business stakeholder collaboration
- Living documentation

### **API Testing**
- RESTful API validation
- Authentication testing
- Data integrity verification
- Performance testing

## 🚀 Advanced Features

### **Cross-Browser Testing**
```bash
CROSS_BROWSER=true npm run test:smoke
```

### **Mobile Testing**
```bash
MOBILE_TESTS=true npm run test:webapp:ui
```

### **Visual Regression Testing**
```bash
npm run test:visual
```

### **Performance Testing**
```bash
npm run test:performance
```

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [Folder Structure](folder-structure.md) | Detailed folder organization and purpose |
| [Configuration Guide](configuration-guide.md) | Complete configuration reference |
| [Test Execution](test-execution.md) | Running tests and interpreting results |
| [BDD Testing](bdd-testing.md) | Behavior-Driven Development guide |
| [Development Workflow](development-workflow.md) | Best practices and development guidelines |
| [API Reference](api-reference.md) | Framework APIs and utilities |
| [Troubleshooting](troubleshooting.md) | Common issues and solutions |

## 🤝 Contributing

### **Adding New Applications**
1. Create application-specific configuration in `config/applications/`
2. Set up application structure in `src/applications/`
3. Create test directories in `tests/`
4. Add BDD features if needed in `features/`

### **Adding New Test Types**
1. Create test type directory (e.g., `performance/`, `security/`)
2. Update Playwright configuration projects
3. Add corresponding npm scripts
4. Update documentation

## 🔍 Monitoring and Maintenance

### **Health Checks**
```bash
npm run framework:validate      # Validate framework setup
npm run data:cleanup           # Clean test data
npm run data:seed              # Seed test data
```

### **Dependency Management**
```bash
npm run framework:install      # Install and setup framework
npm audit                     # Check for security vulnerabilities
```

## 📈 Performance Optimization

- **Parallel Execution**: Configurable worker threads
- **Test Sharding**: Distribute tests across environments
- **Smart Test Selection**: Run only relevant tests
- **Resource Management**: Optimize browser and memory usage

## 🛡️ Security Considerations

- **Credential Management**: Environment-based secret handling
- **Data Isolation**: Test data separation between environments
- **Access Control**: Role-based testing scenarios
- **Security Testing**: Authentication and authorization validation

---

## 📞 Support

For framework support, issues, or feature requests:
- 📧 **Email**: your-qa-team@example.com
- 📚 **Documentation**: `/documentation/`
- 🐛 **Issues**: Create GitHub issues for bugs
- 💡 **Features**: Submit feature requests via pull requests

---

**🎯 Built for Enterprise Quality Assurance**  
*Scalable • Maintainable • Comprehensive • Professional*
#!/usr/bin/env node

/**
 * Setup Validation Script for Testoria E2E Tests
 * 
 * This script validates that the test environment is properly configured
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// ANSI color codes
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateSetup() {
    log('🔍 Validating Testoria E2E Test Setup...', 'blue');
    console.log('');

    let hasErrors = false;
    const issues = [];

    // 1. Check Node.js version
    try {
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
        
        if (majorVersion >= 16) {
            log(`✅ Node.js version: ${nodeVersion}`, 'green');
        } else {
            log(`❌ Node.js version: ${nodeVersion} (requires v16+)`, 'red');
            issues.push('Upgrade Node.js to version 16 or higher');
            hasErrors = true;
        }
    } catch (error) {
        log('❌ Could not determine Node.js version', 'red');
        hasErrors = true;
    }

    // 2. Check package.json exists
    const packagePath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packagePath)) {
        log('✅ package.json found', 'green');
        
        // Check dependencies
        try {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            const requiredDeps = ['@playwright/test', 'playwright', 'playwright-bdd', 'typescript'];
            const missingDeps = requiredDeps.filter(dep => !deps[dep]);
            
            if (missingDeps.length === 0) {
                log('✅ All required dependencies found', 'green');
            } else {
                log(`❌ Missing dependencies: ${missingDeps.join(', ')}`, 'red');
                issues.push(`Install missing dependencies: npm install ${missingDeps.join(' ')}`);
                hasErrors = true;
            }
        } catch (error) {
            log('❌ Could not parse package.json', 'red');
            hasErrors = true;
        }
    } else {
        log('❌ package.json not found', 'red');
        issues.push('Run npm init to create package.json');
        hasErrors = true;
    }

    // 3. Check node_modules
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
        log('✅ node_modules directory exists', 'green');
    } else {
        log('❌ node_modules not found', 'red');
        issues.push('Run npm install to install dependencies');
        hasErrors = true;
    }

    // 4. Check Playwright configuration
    const playwrightConfigPath = path.join(__dirname, 'playwright.config.ts');
    if (fs.existsSync(playwrightConfigPath)) {
        log('✅ playwright.config.ts found', 'green');
    } else {
        log('❌ playwright.config.ts not found', 'red');
        issues.push('Create playwright.config.ts configuration file');
        hasErrors = true;
    }

    // 5. Check environment files
    const envFiles = ['.env.test', '.env.local'];
    envFiles.forEach(envFile => {
        if (fs.existsSync(path.join(__dirname, envFile))) {
            log(`✅ ${envFile} found`, 'green');
        } else {
            log(`⚠️  ${envFile} not found`, 'yellow');
            issues.push(`Consider creating ${envFile} for environment-specific configuration`);
        }
    });

    // 6. Check test directories
    const testDirs = ['tests', 'framework', 'step-definitions', 'support'];
    testDirs.forEach(dir => {
        if (fs.existsSync(path.join(__dirname, dir))) {
            log(`✅ ${dir}/ directory exists`, 'green');
        } else {
            log(`❌ ${dir}/ directory missing`, 'red');
            issues.push(`Create ${dir}/ directory structure`);
            hasErrors = true;
        }
    });

    // 7. Check TypeScript configuration
    const tsconfigPath = path.join(__dirname, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
        log('✅ tsconfig.json found', 'green');
    } else {
        log('❌ tsconfig.json not found', 'red');
        issues.push('Create tsconfig.json for TypeScript configuration');
        hasErrors = true;
    }

    // 8. Try to compile TypeScript (if tsc is available)
    try {
        await execAsync('npx tsc --noEmit --skipLibCheck');
        log('✅ TypeScript compilation successful', 'green');
    } catch (error) {
        log('⚠️  TypeScript compilation issues detected', 'yellow');
        log('   Run "npx tsc --noEmit" for details', 'yellow');
    }

    // 9. Check if Playwright browsers are installed
    try {
        const { stdout } = await execAsync('npx playwright --version');
        log(`✅ Playwright installed: ${stdout.trim()}`, 'green');
        
        // Try to check if browsers are installed
        try {
            await execAsync('npx playwright install --dry-run');
            log('✅ Playwright browsers appear to be installed', 'green');
        } catch (error) {
            log('⚠️  Playwright browsers may need installation', 'yellow');
            issues.push('Run "npx playwright install" to install browsers');
        }
    } catch (error) {
        log('❌ Playwright not properly installed', 'red');
        issues.push('Install Playwright: npm install @playwright/test');
        hasErrors = true;
    }

    // 10. Test basic Playwright functionality
    try {
        await execAsync('NODE_ENV=test npx playwright test --list --timeout=5000');
        log('✅ Playwright test listing works', 'green');
    } catch (error) {
        log('⚠️  Issues with Playwright test configuration', 'yellow');
        issues.push('Check playwright.config.ts and test file syntax');
    }

    // Summary
    console.log('');
    log('─'.repeat(60), 'blue');
    
    if (hasErrors) {
        log('❌ SETUP VALIDATION FAILED', 'red');
        console.log('');
        log('Issues to resolve:', 'yellow');
        issues.forEach((issue, index) => {
            log(`${index + 1}. ${issue}`, 'yellow');
        });
    } else {
        log('✅ SETUP VALIDATION PASSED', 'green');
        console.log('');
        log('Your Testoria E2E test environment is ready!', 'green');
        console.log('');
        log('Next steps:', 'blue');
        log('1. Start your application on http://localhost:3001', 'reset');
        log('2. Run tests: ./run-tests.sh smoke', 'reset');
        log('3. View reports: npx playwright show-report', 'reset');
    }
    
    log('─'.repeat(60), 'blue');
    
    return !hasErrors;
}

// Run validation
if (require.main === module) {
    validateSetup().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        log(`❌ Validation failed with error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { validateSetup };
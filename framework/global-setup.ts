/**
 * Global Test Setup
 * 
 * Performs global initialization before all tests run
 */

import { FullConfig } from '@playwright/test';
import { environmentConfig } from './config/EnvironmentConfig';
import { testDataManager } from './data/TestDataManager';
import fs from 'fs/promises';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up Testoria E2E Test Framework...');
  
  const startTime = Date.now();
  const environment = environmentConfig.getEnvironment();
  
  try {
    // 1. Environment validation
    await validateEnvironment();
    
    // 2. Setup test directories
    await setupTestDirectories();
    
    // 3. Configure test data manager
    await configureTestDataManager();
    
    // 4. Health checks
    await performHealthChecks();
    
    // 5. Environment-specific setup
    await performEnvironmentSpecificSetup(environment);
    
    const setupTime = Date.now() - startTime;
    console.log(`✅ Global setup completed in ${setupTime}ms`);
    console.log(`🌍 Environment: ${environment}`);
    console.log(`🎯 Base URL: ${environmentConfig.getUIConfig().baseUrl}`);
    console.log(`🚀 Ready to run tests!`);
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

/**
 * Validate environment configuration and required services
 */
async function validateEnvironment(): Promise<void> {
  console.log('🔍 Validating environment...');
  
  const environment = environmentConfig.getEnvironment();
  const uiConfig = environmentConfig.getUIConfig();
  const apiConfig = environmentConfig.getApiConfig();
  
  // Validate configuration
  if (!uiConfig.baseUrl) {
    throw new Error('UI base URL is not configured');
  }
  
  if (!apiConfig.baseUrl) {
    throw new Error('API base URL is not configured');
  }
  
  // Environment-specific validations
  switch (environment) {
    case 'test':
      await validateTestEnvironment();
      break;
    case 'staging':
      await validateStagingEnvironment();
      break;
    case 'production':
      await validateProductionEnvironment();
      break;
    default:
      console.log('ℹ️  Development environment - minimal validation');
  }
  
  console.log('✅ Environment validation passed');
}

async function validateTestEnvironment(): Promise<void> {
  // Validate test environment specific requirements
  const requiredPorts = [3001, 5432, 8000]; // Dev webapp, postgres, chromadb
  
  for (const port of requiredPorts) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok && port === 3001) {
        console.warn(`⚠️  Application on port ${port} may not be running`);
      }
    } catch (error) {
      console.warn(`⚠️  Service on port ${port} is not accessible`);
    }
  }
}

async function validateStagingEnvironment(): Promise<void> {
  // Validate staging environment connectivity
  const baseUrl = environmentConfig.getUIConfig().baseUrl;
  
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`Staging environment health check failed: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Cannot connect to staging environment: ${error}`);
  }
}

async function validateProductionEnvironment(): Promise<void> {
  // Production validation (read-only checks)
  console.log('⚠️  Production environment detected - read-only validation');
  
  const baseUrl = environmentConfig.getUIConfig().baseUrl;
  
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) {
      throw new Error(`Production environment is not accessible: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Cannot connect to production environment: ${error}`);
  }
}

/**
 * Setup test output directories
 */
async function setupTestDirectories(): Promise<void> {
  console.log('📁 Setting up test directories...');
  
  const directories = [
    'test-results',
    'test-results/artifacts',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'test-results/downloads',
    'test-results/custom-reports',
    'test-results/html-report',
    'test-data',
    'test-data/files'
  ];
  
  for (const dir of directories) {
    const fullPath = path.resolve(dir);
    try {
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error) {
      console.warn(`⚠️  Failed to create directory ${fullPath}:`, error);
    }
  }
  
  console.log('✅ Test directories setup complete');
}

/**
 * Configure test data manager
 */
async function configureTestDataManager(): Promise<void> {
  console.log('🗄️  Configuring test data manager...');
  
  const environment = environmentConfig.getEnvironment();
  
  // Configure based on environment
  testDataManager.configure({
    persist: environment !== 'production',
    cleanup: environment === 'test' || environment === 'development',
    seedValue: environment === 'test' ? 12345 : undefined, // Fixed seed for test env
    outputPath: path.resolve('test-data')
  });
  
  // Cleanup old test data
  if (environment === 'test' || environment === 'development') {
    await testDataManager.cleanupExpiredDataSets(24); // Cleanup data older than 24 hours
  }
  
  console.log('✅ Test data manager configured');
}

/**
 * Perform health checks on external services
 */
async function performHealthChecks(): Promise<void> {
  console.log('🏥 Performing health checks...');
  
  const checks = [
    checkApplicationHealth(),
    checkDatabaseHealth(),
    checkAIServicesHealth()
  ];
  
  const results = await Promise.allSettled(checks);
  
  let healthyServices = 0;
  let totalServices = results.length;
  
  results.forEach((result, index) => {
    const serviceName = ['Application', 'Database', 'AI Services'][index];
    
    if (result.status === 'fulfilled' && result.value) {
      console.log(`✅ ${serviceName}: Healthy`);
      healthyServices++;
    } else {
      const error = result.status === 'rejected' ? result.reason : 'Health check failed';
      console.warn(`⚠️  ${serviceName}: ${error}`);
    }
  });
  
  console.log(`🏥 Health check complete: ${healthyServices}/${totalServices} services healthy`);
  
  // Only fail if critical services are down in non-development environments
  if (healthyServices === 0 && environmentConfig.getEnvironment() !== 'development') {
    throw new Error('No services are healthy - cannot proceed with tests');
  }
}

async function checkApplicationHealth(): Promise<boolean> {
  try {
    const baseUrl = environmentConfig.getUIConfig().baseUrl;
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    
    return response.ok;
  } catch (error) {
    throw new Error(`Application health check failed: ${error}`);
  }
}

async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const baseUrl = environmentConfig.getApiConfig().baseUrl;
    const response = await fetch(`${baseUrl}/api/database/status`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.postgres === 'connected' && data.chromadb === 'connected';
    }
    
    return false;
  } catch (error) {
    throw new Error(`Database health check failed: ${error}`);
  }
}

async function checkAIServicesHealth(): Promise<boolean> {
  try {
    const baseUrl = environmentConfig.getApiConfig().baseUrl;
    const response = await fetch(`${baseUrl}/api/settings/models`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    
    return response.ok;
  } catch (error) {
    throw new Error(`AI services health check failed: ${error}`);
  }
}

/**
 * Environment-specific setup tasks
 */
async function performEnvironmentSpecificSetup(environment: string): Promise<void> {
  console.log(`🔧 Performing ${environment}-specific setup...`);
  
  switch (environment) {
    case 'test':
      await setupTestEnvironment();
      break;
    case 'staging':
      await setupStagingEnvironment();
      break;
    case 'production':
      await setupProductionEnvironment();
      break;
    default:
      await setupDevelopmentEnvironment();
  }
}

async function setupTestEnvironment(): Promise<void> {
  // Test environment specific setup
  console.log('🧪 Setting up test environment...');
  
  // Clear any existing test data
  await testDataManager.cleanupAllDataSets();
  
  // Pre-generate common test data sets
  const smokeDataId = await testDataManager.createDataSet('smoke-test-data', 'Pre-generated data for smoke tests');
  await testDataManager.generateSmokeTestData(smokeDataId);
  
  console.log('✅ Test environment setup complete');
}

async function setupStagingEnvironment(): Promise<void> {
  // Staging environment specific setup
  console.log('🎭 Setting up staging environment...');
  
  // Staging-specific configurations
  console.log('✅ Staging environment setup complete');
}

async function setupProductionEnvironment(): Promise<void> {
  // Production environment setup (read-only)
  console.log('🏭 Setting up production environment (read-only)...');
  
  // Ensure no data modification capabilities
  testDataManager.configure({
    persist: false,
    cleanup: false
  });
  
  console.log('✅ Production environment setup complete');
}

async function setupDevelopmentEnvironment(): Promise<void> {
  // Development environment setup
  console.log('💻 Setting up development environment...');
  
  // Development-specific configurations
  console.log('✅ Development environment setup complete');
}

/**
 * Create global test context file
 */
async function createGlobalTestContext(): Promise<void> {
  const context = {
    setupTime: new Date().toISOString(),
    environment: environmentConfig.getEnvironment(),
    configuration: {
      ui: environmentConfig.getUIConfig(),
      api: environmentConfig.getApiConfig(),
      test: environmentConfig.getTestConfig()
    },
    features: {
      visualRegression: environmentConfig.isFeatureEnabled('visualRegression'),
      accessibility: environmentConfig.isFeatureEnabled('accessibility'),
      performance: environmentConfig.isFeatureEnabled('performance'),
      apiTesting: environmentConfig.isFeatureEnabled('apiTesting')
    }
  };
  
  const contextPath = path.resolve('test-results/global-context.json');
  await fs.writeFile(contextPath, JSON.stringify(context, null, 2));
}

export default globalSetup;
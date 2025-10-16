/**
 * Global Test Teardown
 * 
 * Performs cleanup and finalization after all tests complete
 */

import type { FullConfig, FullResult } from '@playwright/test';
import { environmentConfig } from './config/EnvironmentConfig';
import { testDataManager } from './data/TestDataManager';
import fs from 'fs/promises';
import path from 'path';

async function globalTeardown(config: FullConfig, result: FullResult) {
  console.log('🧹 Starting global teardown...');
  
  const startTime = Date.now();
  
  try {
    // Safely get environment
    const environment = environmentConfig?.getEnvironment?.() || 'development';
    
    // 1. Generate final test summary
    await generateFinalSummary(result);
    
    // 2. Cleanup test data
    await cleanupTestData(environment);
    
    // 3. Archive test artifacts
    await archiveTestArtifacts(environment);
    
    // 4. Generate reports
    await generateTeardownReports();
    
    // 5. Environment-specific cleanup
    await performEnvironmentSpecificCleanup(environment);
    
    // 6. Final health check
    await performFinalHealthCheck();
    
    const teardownTime = Date.now() - startTime;
    console.log(`✅ Global teardown completed in ${teardownTime}ms`);
    
    // Print final summary
    printFinalSummary(result, teardownTime);
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test results
  }
}

/**
 * Generate final test execution summary
 */
async function generateFinalSummary(result: FullResult | undefined): Promise<void> {
  console.log('📊 Generating final test summary...');
  
  try {
    // Handle case where result might be undefined
    const safeResult = result || {};
    
    // Safely get environment configuration
    const environment = environmentConfig?.getEnvironment?.() || 'development';
    const uiConfig = environmentConfig?.getUIConfig?.() || { baseUrl: 'http://localhost:3001' };
    const testConfig = environmentConfig?.getTestConfig?.() || { parallel: false, workers: 1, retries: 0 };
    
    const summary = {
      executionTime: new Date().toISOString(),
      environment: environment,
      overallStatus: safeResult.status || 'unknown',
      configuration: {
        environment: environment,
        baseUrl: uiConfig.baseUrl,
        parallel: testConfig.parallel,
        workers: testConfig.workers,
        retries: testConfig.retries
      },
      features: {
        visualRegression: environmentConfig?.isFeatureEnabled?.('visualRegression') || false,
        accessibility: environmentConfig?.isFeatureEnabled?.('accessibility') || false,
        performance: environmentConfig?.isFeatureEnabled?.('performance') || false,
        apiTesting: environmentConfig?.isFeatureEnabled?.('apiTesting') || false
      },
      timing: {
        startTime: safeResult.startTime || new Date().toISOString(),
        duration: safeResult.duration || 0
      }
    };
    
    const summaryPath = path.resolve('test-results/final-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('✅ Final summary generated');
  } catch (error) {
    console.warn('⚠️  Failed to generate final summary:', error);
  }
}

/**
 * Cleanup test data based on environment
 */
async function cleanupTestData(environment: string): Promise<void> {
  console.log('🗑️  Cleaning up test data...');
  
  try {
    switch (environment) {
      case 'test':
      case 'development':
        // Aggressive cleanup for test environments
        await testDataManager.cleanupAllDataSets();
        console.log('✅ All test data cleaned up');
        break;
        
      case 'staging':
        // Cleanup only temporary test data
        await testDataManager.cleanupExpiredDataSets(1); // Cleanup data older than 1 hour
        console.log('✅ Expired test data cleaned up');
        break;
        
      case 'production':
        // No cleanup in production
        console.log('ℹ️  Production environment - no test data cleanup performed');
        break;
        
      default:
        console.log('ℹ️  Unknown environment - minimal cleanup performed');
    }
    
    // Generate storage usage report
    const storageUsage = await testDataManager.getStorageUsage();
    console.log(`📊 Test data storage: ${storageUsage.totalDataSets} datasets, ${(storageUsage.totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.warn('⚠️  Test data cleanup failed:', error);
  }
}

/**
 * Archive test artifacts for long-term storage
 */
async function archiveTestArtifacts(environment: string): Promise<void> {
  console.log('📦 Archiving test artifacts...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `testoria-e2e-${environment}-${timestamp}`;
    
    // Create archive metadata
    const archiveMetadata = {
      name: archiveName,
      created: new Date().toISOString(),
      environment,
      contains: [
        'test-results/',
        'test-data/',
        'screenshots/',
        'videos/',
        'traces/',
        'reports/'
      ]
    };
    
    const metadataPath = path.resolve('test-results/archive-metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(archiveMetadata, null, 2));
    
    // In CI environments, you might want to upload artifacts to cloud storage
    if (process.env.CI) {
      await handleCIArtifacts(archiveName);
    }
    
    console.log(`✅ Test artifacts archived as: ${archiveName}`);
    
  } catch (error) {
    console.warn('⚠️  Test artifact archiving failed:', error);
  }
}

async function handleCIArtifacts(archiveName: string): Promise<void> {
  // Handle CI-specific artifact management
  console.log('☁️  Handling CI artifacts...');
  
  if (process.env.GITHUB_ACTIONS) {
    // GitHub Actions specific handling
    console.log('📤 Artifacts will be uploaded by GitHub Actions workflow');
    
    // Create artifacts summary for GitHub
    const artifactsSummary = {
      name: archiveName,
      paths: [
        'test-results/**/*',
        'test-data/**/*'
      ],
      retention: '30 days'
    };
    
    const summaryPath = path.resolve('test-results/github-artifacts.json');
    await fs.writeFile(summaryPath, JSON.stringify(artifactsSummary, null, 2));
    
  } else if (process.env.JENKINS_URL) {
    // Jenkins specific handling
    console.log('📤 Artifacts will be archived by Jenkins');
    
  } else {
    console.log('ℹ️  CI environment detected but no specific handler available');
  }
}

/**
 * Generate teardown-specific reports
 */
async function generateTeardownReports(): Promise<void> {
  console.log('📋 Generating teardown reports...');
  
  try {
    // Generate test data usage report
    await generateTestDataReport();
    
    // Generate artifact inventory
    await generateArtifactInventory();
    
    // Generate performance summary
    await generatePerformanceSummary();
    
    console.log('✅ Teardown reports generated');
    
  } catch (error) {
    console.warn('⚠️  Report generation failed:', error);
  }
}

async function generateTestDataReport(): Promise<void> {
  const dataSets = testDataManager.listDataSets();
  const storageUsage = await testDataManager.getStorageUsage();
  
  const report = {
    summary: {
      totalDataSets: dataSets.length,
      totalSize: storageUsage.totalSizeBytes,
      oldestDataSet: storageUsage.oldestDataSet,
      newestDataSet: storageUsage.newestDataSet
    },
    dataSets: dataSets.map(ds => ({
      id: ds.id,
      name: ds.name,
      created: ds.created,
      summary: testDataManager.getDataSetSummary(ds.id)
    }))
  };
  
  const reportPath = path.resolve('test-results/test-data-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
}

async function generateArtifactInventory(): Promise<void> {
  const artifactDirs = [
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'test-results/downloads'
  ];
  
  const inventory: any = {
    generated: new Date().toISOString(),
    artifacts: {}
  };
  
  for (const dir of artifactDirs) {
    try {
      const files = await fs.readdir(path.resolve(dir), { withFileTypes: true });
      inventory.artifacts[dir] = {
        count: files.filter(f => f.isFile()).length,
        files: files.filter(f => f.isFile()).map(f => f.name)
      };
    } catch (error) {
      inventory.artifacts[dir] = { count: 0, files: [], error: 'Directory not accessible' };
    }
  }
  
  const inventoryPath = path.resolve('test-results/artifact-inventory.json');
  await fs.writeFile(inventoryPath, JSON.stringify(inventory, null, 2));
}

async function generatePerformanceSummary(): Promise<void> {
  try {
    // Read performance data from custom reporter if available
    const metricsPath = path.resolve('test-results/custom-reports/detailed-report.json');
    const metricsContent = await fs.readFile(metricsPath, 'utf8');
    const metricsData = JSON.parse(metricsContent);
    
    const performanceSummary = {
      executionOverview: {
        totalDuration: metricsData.metrics.duration,
        avgTestDuration: metricsData.metrics.avgTestDuration,
        slowestTest: metricsData.metrics.slowestTests[0],
        fastestTest: metricsData.metrics.fastestTests[0]
      },
      recommendations: generatePerformanceRecommendations(metricsData.metrics),
      trends: {
        // Could be expanded to track performance over time
        currentExecution: new Date().toISOString()
      }
    };
    
    const summaryPath = path.resolve('test-results/performance-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(performanceSummary, null, 2));
    
  } catch (error) {
    console.warn('⚠️  Performance summary generation failed:', error);
  }
}

function generatePerformanceRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];
  
  if (metrics.avgTestDuration > 15000) {
    recommendations.push('Consider test optimization - average duration is high');
  }
  
  if (metrics.flakyTests > 0) {
    recommendations.push(`Investigate ${metrics.flakyTests} flaky tests for better stability`);
  }
  
  if (metrics.slowestTests && metrics.slowestTests.length > 0) {
    const slowest = metrics.slowestTests[0];
    if (slowest.duration > 60000) {
      recommendations.push(`Review slowest test "${slowest.title}" (${slowest.duration}ms)`);
    }
  }
  
  return recommendations;
}

/**
 * Environment-specific cleanup
 */
async function performEnvironmentSpecificCleanup(environment: string): Promise<void> {
  console.log(`🔧 Performing ${environment}-specific cleanup...`);
  
  switch (environment) {
    case 'test':
      await cleanupTestEnvironment();
      break;
    case 'staging':
      await cleanupStagingEnvironment();
      break;
    case 'production':
      await cleanupProductionEnvironment();
      break;
    default:
      await cleanupDevelopmentEnvironment();
  }
}

async function cleanupTestEnvironment(): Promise<void> {
  console.log('🧪 Test environment cleanup...');
  
  // Test-specific cleanup
  // Could include database cleanup, service resets, etc.
  
  console.log('✅ Test environment cleanup complete');
}

async function cleanupStagingEnvironment(): Promise<void> {
  console.log('🎭 Staging environment cleanup...');
  
  // Staging-specific cleanup
  
  console.log('✅ Staging environment cleanup complete');
}

async function cleanupProductionEnvironment(): Promise<void> {
  console.log('🏭 Production environment cleanup (read-only)...');
  
  // No cleanup operations in production
  
  console.log('✅ Production environment cleanup complete');
}

async function cleanupDevelopmentEnvironment(): Promise<void> {
  console.log('💻 Development environment cleanup...');
  
  // Development-specific cleanup
  
  console.log('✅ Development environment cleanup complete');
}

/**
 * Perform final health check
 */
async function performFinalHealthCheck(): Promise<void> {
  console.log('🏥 Performing final health check...');
  
  try {
    const baseUrl = environmentConfig.getUIConfig().baseUrl;
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log('✅ Application is healthy after test execution');
    } else {
      console.warn('⚠️  Application health check failed after tests');
    }
    
  } catch (error) {
    console.warn('⚠️  Final health check could not be performed:', error);
  }
}

/**
 * Print final summary to console
 */
function printFinalSummary(result: FullResult | undefined, teardownTime: number): void {
  console.log('─'.repeat(80));
  console.log('🎯 TESTORIA E2E TEST EXECUTION COMPLETE');
  console.log('─'.repeat(80));
  
  const safeResult = result || {};
  const environment = environmentConfig?.getEnvironment?.() || 'development';
  
  console.log(`📊 Overall Status: ${(safeResult.status || 'unknown').toUpperCase()}`);
  console.log(`🌍 Environment: ${environment}`);
  console.log(`⏱️  Total Duration: ${((safeResult.duration || 0) / 1000).toFixed(1)}s`);
  console.log(`🧹 Teardown Time: ${teardownTime}ms`);
  console.log(`📁 Reports Location: test-results/`);
  
  const status = safeResult.status || 'unknown';
  if (status === 'passed') {
    console.log('🎉 All tests passed successfully!');
  } else if (status === 'failed') {
    console.log('❌ Some tests failed - check reports for details');
  } else {
    console.log(`ℹ️  Test execution completed with status: ${status}`);
  }
  
  console.log('─'.repeat(80));
  
  // CI-specific output
  if (process.env.CI) {
    console.log('📊 CI Summary:');
    console.log(`##vso[task.setvariable variable=testStatus]${safeResult.status || 'unknown'}`);
    console.log(`##vso[task.setvariable variable=testDuration]${safeResult.duration || 0}`);
    
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::set-output name=test-status::${safeResult.status || 'unknown'}`);
      console.log(`::set-output name=test-duration::${safeResult.duration || 0}`);
    }
  }
}

export default globalTeardown;
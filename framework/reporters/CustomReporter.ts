/**
 * Custom Playwright Reporter
 * 
 * Enhanced reporting with detailed metrics, performance tracking, and custom formatting
 */

import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import fs from 'fs/promises';
import path from 'path';

interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  flakyTests: number;
  duration: number;
  avgTestDuration: number;
  slowestTests: Array<{ title: string; duration: number; project: string }>;
  fastestTests: Array<{ title: string; duration: number; project: string }>;
  errorsByType: Record<string, number>;
  browserMetrics: Record<string, {
    passed: number;
    failed: number;
    avgDuration: number;
  }>;
}

interface ProjectSummary {
  name: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  avgDuration: number;
}

export default class CustomReporter implements Reporter {
  private startTime: number = 0;
  private endTime: number = 0;
  private testResults: Array<{ test: TestCase; result: TestResult }> = [];
  private outputDir: string;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = options.outputDir || 'test-results/custom-reports';
  }

  async onBegin(config: any, suite: any) {
    this.startTime = Date.now();
    
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    
    console.log('🚀 Starting Testoria E2E Test Suite');
    console.log(`📊 Running ${suite.allTests().length} tests across ${config.projects.length} projects`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎯 Base URL: ${config.use?.baseURL || 'Not configured'}`);
    console.log('─'.repeat(80));
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    this.testResults.push({ test, result });
    
    // Real-time logging
    const status = this.getStatusIcon(result.status);
    const duration = `${result.duration}ms`;
    const projectName = test.parent?.project()?.name || 'unknown';
    
    console.log(`${status} ${test.title} (${projectName}) - ${duration}`);
    
    // Log additional info for failures
    if (result.status === 'failed') {
      console.log(`   ❌ Error: ${result.error?.message || 'Unknown error'}`);
      if (result.attachments.length > 0) {
        console.log(`   📎 Attachments: ${result.attachments.length}`);
      }
    }
    
    // Log warnings for slow tests
    if (result.duration > 30000) { // 30 seconds
      console.log(`   ⚠️  Slow test detected: ${duration}`);
    }
  }

  async onEnd(result: FullResult) {
    this.endTime = Date.now();
    const totalDuration = this.endTime - this.startTime;
    
    console.log('─'.repeat(80));
    console.log('📈 Test Execution Complete');
    
    // Calculate metrics
    const metrics = this.calculateMetrics(totalDuration);
    
    // Console summary
    this.printConsoleSummary(metrics, result);
    
    // Generate detailed reports
    await this.generateDetailedReport(metrics, result);
    await this.generateMetricsReport(metrics);
    await this.generateFailureReport();
    await this.generatePerformanceReport(metrics);
    
    // CI-specific outputs
    if (process.env.CI) {
      await this.generateCIReport(metrics, result);
    }
    
    console.log(`📁 Detailed reports saved to: ${this.outputDir}`);
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      case 'timedOut': return '⏰';
      case 'interrupted': return '🛑';
      default: return '❓';
    }
  }

  private calculateMetrics(totalDuration: number): TestMetrics {
    const metrics: TestMetrics = {
      totalTests: this.testResults.length,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      flakyTests: 0,
      duration: totalDuration,
      avgTestDuration: 0,
      slowestTests: [],
      fastestTests: [],
      errorsByType: {},
      browserMetrics: {}
    };

    let totalTestDuration = 0;
    const testDurations: Array<{ title: string; duration: number; project: string }> = [];

    for (const { test, result } of this.testResults) {
      const projectName = test.parent?.project()?.name || 'unknown';
      
      // Count by status
      switch (result.status) {
        case 'passed':
          metrics.passedTests++;
          break;
        case 'failed':
          metrics.failedTests++;
          break;
        case 'skipped':
          metrics.skippedTests++;
          break;
      }

      // Track flaky tests (tests that were retried)
      if (result.retry > 0 && result.status === 'passed') {
        metrics.flakyTests++;
      }

      // Duration tracking
      totalTestDuration += result.duration;
      testDurations.push({
        title: test.title,
        duration: result.duration,
        project: projectName
      });

      // Error categorization
      if (result.error) {
        const errorType = this.categorizeError(result.error.message || '');
        metrics.errorsByType[errorType] = (metrics.errorsByType[errorType] || 0) + 1;
      }

      // Browser metrics
      if (!metrics.browserMetrics[projectName]) {
        metrics.browserMetrics[projectName] = { passed: 0, failed: 0, avgDuration: 0 };
      }
      
      if (result.status === 'passed') {
        metrics.browserMetrics[projectName].passed++;
      } else if (result.status === 'failed') {
        metrics.browserMetrics[projectName].failed++;
      }
    }

    // Calculate averages and extremes
    metrics.avgTestDuration = metrics.totalTests > 0 ? totalTestDuration / metrics.totalTests : 0;
    
    // Sort by duration for slowest/fastest
    testDurations.sort((a, b) => b.duration - a.duration);
    metrics.slowestTests = testDurations.slice(0, 5);
    metrics.fastestTests = testDurations.slice(-5).reverse();

    // Calculate browser average durations
    for (const projectName in metrics.browserMetrics) {
      const projectTests = this.testResults.filter(
        ({ test }) => (test.parent?.project()?.name || 'unknown') === projectName
      );
      const totalDuration = projectTests.reduce((sum, { result }) => sum + result.duration, 0);
      metrics.browserMetrics[projectName].avgDuration = 
        projectTests.length > 0 ? totalDuration / projectTests.length : 0;
    }

    return metrics;
  }

  private categorizeError(errorMessage: string): string {
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      return 'Timeout';
    } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
      return 'Network';
    } else if (errorMessage.includes('element') || errorMessage.includes('locator')) {
      return 'Element Not Found';
    } else if (errorMessage.includes('assertion') || errorMessage.includes('expect')) {
      return 'Assertion';
    } else if (errorMessage.includes('navigation') || errorMessage.includes('page')) {
      return 'Navigation';
    } else {
      return 'Other';
    }
  }

  private printConsoleSummary(metrics: TestMetrics, result: FullResult): void {
    const passRate = metrics.totalTests > 0 ? 
      ((metrics.passedTests / metrics.totalTests) * 100).toFixed(1) : '0';
    
    console.log(`📊 Test Results Summary:`);
    console.log(`   Total: ${metrics.totalTests}`);
    console.log(`   ✅ Passed: ${metrics.passedTests} (${passRate}%)`);
    console.log(`   ❌ Failed: ${metrics.failedTests}`);
    console.log(`   ⏭️  Skipped: ${metrics.skippedTests}`);
    console.log(`   🔄 Flaky: ${metrics.flakyTests}`);
    console.log(`   ⏱️  Duration: ${(metrics.duration / 1000).toFixed(1)}s`);
    console.log(`   📈 Avg Test Duration: ${metrics.avgTestDuration.toFixed(0)}ms`);

    if (metrics.failedTests > 0) {
      console.log(`\n💥 Most Common Errors:`);
      Object.entries(metrics.errorsByType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .forEach(([type, count]) => {
          console.log(`   ${type}: ${count} occurrences`);
        });
    }

    if (metrics.slowestTests.length > 0) {
      console.log(`\n🐌 Slowest Tests:`);
      metrics.slowestTests.slice(0, 3).forEach(test => {
        console.log(`   ${test.title} (${test.project}): ${test.duration}ms`);
      });
    }

    console.log(`\n🎯 Overall Status: ${result.status.toUpperCase()}`);
  }

  private async generateDetailedReport(metrics: TestMetrics, result: FullResult): Promise<void> {
    const report = {
      summary: {
        executionTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'unknown',
        totalDuration: metrics.duration,
        overallStatus: result.status
      },
      metrics,
      projects: this.getProjectSummaries(),
      testDetails: this.testResults.map(({ test, result }) => ({
        title: test.title,
        project: test.parent?.project()?.name || 'unknown',
        status: result.status,
        duration: result.duration,
        retry: result.retry,
        error: result.error?.message,
        attachments: result.attachments.map(att => ({
          name: att.name,
          path: att.path,
          contentType: att.contentType
        }))
      }))
    };

    const reportPath = path.join(this.outputDir, 'detailed-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  }

  private async generateMetricsReport(metrics: TestMetrics): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Testoria E2E Test Metrics</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric-card { 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 10px 0; 
            background: #f9f9f9; 
        }
        .metric-value { font-size: 24px; font-weight: bold; color: #2196F3; }
        .pass { color: #4CAF50; }
        .fail { color: #f44336; }
        .skip { color: #ff9800; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .chart { margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🧪 Testoria E2E Test Metrics Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <div class="metric-card">
        <h3>Test Execution Summary</h3>
        <div>Total Tests: <span class="metric-value">${metrics.totalTests}</span></div>
        <div>Passed: <span class="metric-value pass">${metrics.passedTests}</span></div>
        <div>Failed: <span class="metric-value fail">${metrics.failedTests}</span></div>
        <div>Skipped: <span class="metric-value skip">${metrics.skippedTests}</span></div>
        <div>Flaky: <span class="metric-value">${metrics.flakyTests}</span></div>
        <div>Duration: <span class="metric-value">${(metrics.duration / 1000).toFixed(1)}s</span></div>
        <div>Average Test Duration: <span class="metric-value">${metrics.avgTestDuration.toFixed(0)}ms</span></div>
    </div>

    <div class="metric-card">
        <h3>Performance Analysis</h3>
        <h4>Slowest Tests</h4>
        <table>
            <tr><th>Test</th><th>Project</th><th>Duration (ms)</th></tr>
            ${metrics.slowestTests.map(test => 
              `<tr><td>${test.title}</td><td>${test.project}</td><td>${test.duration}</td></tr>`
            ).join('')}
        </table>
        
        <h4>Fastest Tests</h4>
        <table>
            <tr><th>Test</th><th>Project</th><th>Duration (ms)</th></tr>
            ${metrics.fastestTests.map(test => 
              `<tr><td>${test.title}</td><td>${test.project}</td><td>${test.duration}</td></tr>`
            ).join('')}
        </table>
    </div>

    <div class="metric-card">
        <h3>Browser/Project Performance</h3>
        <table>
            <tr><th>Project</th><th>Passed</th><th>Failed</th><th>Avg Duration (ms)</th></tr>
            ${Object.entries(metrics.browserMetrics).map(([project, data]) => 
              `<tr><td>${project}</td><td class="pass">${data.passed}</td><td class="fail">${data.failed}</td><td>${data.avgDuration.toFixed(0)}</td></tr>`
            ).join('')}
        </table>
    </div>

    ${Object.keys(metrics.errorsByType).length > 0 ? `
    <div class="metric-card">
        <h3>Error Analysis</h3>
        <table>
            <tr><th>Error Type</th><th>Count</th></tr>
            ${Object.entries(metrics.errorsByType)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => 
                `<tr><td>${type}</td><td>${count}</td></tr>`
              ).join('')}
        </table>
    </div>` : ''}
</body>
</html>`;

    const htmlPath = path.join(this.outputDir, 'metrics-report.html');
    await fs.writeFile(htmlPath, html);
  }

  private async generateFailureReport(): Promise<void> {
    const failures = this.testResults.filter(({ result }) => result.status === 'failed');
    
    if (failures.length === 0) {
      return;
    }

    const report = {
      totalFailures: failures.length,
      failures: failures.map(({ test, result }) => ({
        title: test.title,
        project: test.parent?.project()?.name || 'unknown',
        file: test.location?.file,
        line: test.location?.line,
        error: result.error?.message,
        stack: result.error?.stack,
        duration: result.duration,
        retry: result.retry,
        attachments: result.attachments.map(att => ({
          name: att.name,
          path: att.path,
          contentType: att.contentType
        }))
      }))
    };

    const reportPath = path.join(this.outputDir, 'failure-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  }

  private async generatePerformanceReport(metrics: TestMetrics): Promise<void> {
    const performanceData = {
      executionMetrics: {
        totalDuration: metrics.duration,
        avgTestDuration: metrics.avgTestDuration,
        testCount: metrics.totalTests
      },
      slowTests: metrics.slowestTests.filter(test => test.duration > 10000), // Tests > 10s
      recommendations: this.generatePerformanceRecommendations(metrics)
    };

    const reportPath = path.join(this.outputDir, 'performance-report.json');
    await fs.writeFile(reportPath, JSON.stringify(performanceData, null, 2));
  }

  private generatePerformanceRecommendations(metrics: TestMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.avgTestDuration > 15000) {
      recommendations.push('Consider optimizing test scenarios - average test duration is high');
    }

    if (metrics.slowestTests.some(test => test.duration > 60000)) {
      recommendations.push('Some tests are taking over 1 minute - review for optimization opportunities');
    }

    if (metrics.flakyTests > metrics.totalTests * 0.1) {
      recommendations.push('High number of flaky tests detected - investigate test stability');
    }

    const timeoutErrors = metrics.errorsByType['Timeout'] || 0;
    if (timeoutErrors > metrics.totalTests * 0.05) {
      recommendations.push('Consider increasing timeouts or optimizing page load performance');
    }

    return recommendations;
  }

  private async generateCIReport(metrics: TestMetrics, result: FullResult): Promise<void> {
    const ciReport = {
      status: result.status,
      passRate: metrics.totalTests > 0 ? (metrics.passedTests / metrics.totalTests) * 100 : 0,
      metrics: {
        total: metrics.totalTests,
        passed: metrics.passedTests,
        failed: metrics.failedTests,
        skipped: metrics.skippedTests,
        flaky: metrics.flakyTests,
        duration: metrics.duration
      },
      buildInfo: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        ci: process.env.CI,
        buildNumber: process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER,
        branch: process.env.GIT_BRANCH || process.env.GITHUB_REF
      }
    };

    const reportPath = path.join(this.outputDir, 'ci-report.json');
    await fs.writeFile(reportPath, JSON.stringify(ciReport, null, 2));

    // Also output GitHub Actions annotations if in GitHub CI
    if (process.env.GITHUB_ACTIONS) {
      this.outputGitHubAnnotations(metrics);
    }
  }

  private outputGitHubAnnotations(metrics: TestMetrics): void {
    // Output GitHub Actions annotations for failed tests
    const failures = this.testResults.filter(({ result }) => result.status === 'failed');
    
    failures.forEach(({ test, result }) => {
      const file = test.location?.file || 'unknown';
      const line = test.location?.line || 1;
      const message = result.error?.message || 'Test failed';
      
      console.log(`::error file=${file},line=${line}::${test.title}: ${message}`);
    });

    // Output warning for slow tests
    if (metrics.avgTestDuration > 20000) {
      console.log(`::warning::Average test duration is high: ${metrics.avgTestDuration.toFixed(0)}ms`);
    }

    // Output notice for flaky tests
    if (metrics.flakyTests > 0) {
      console.log(`::notice::${metrics.flakyTests} flaky tests detected`);
    }
  }

  private getProjectSummaries(): ProjectSummary[] {
    const projectMap = new Map<string, ProjectSummary>();

    for (const { test, result } of this.testResults) {
      const projectName = test.parent?.project()?.name || 'unknown';
      
      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, {
          name: projectName,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
          avgDuration: 0
        });
      }

      const summary = projectMap.get(projectName)!;
      summary.duration += result.duration;

      switch (result.status) {
        case 'passed':
          summary.passed++;
          break;
        case 'failed':
          summary.failed++;
          break;
        case 'skipped':
          summary.skipped++;
          break;
      }
    }

    // Calculate average durations
    for (const summary of projectMap.values()) {
      const totalTests = summary.passed + summary.failed + summary.skipped;
      summary.avgDuration = totalTests > 0 ? summary.duration / totalTests : 0;
    }

    return Array.from(projectMap.values());
  }
}
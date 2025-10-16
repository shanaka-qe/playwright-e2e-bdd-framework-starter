/**
 * Admin Monitoring Workflow
 * 
 * Cross-application workflow that demonstrates admin monitoring capabilities
 * including system health checks, log analysis, and alert management
 */

import { BaseWorkflow, WorkflowStep, WorkflowContext } from '../BaseWorkflow';
import { ApplicationContext } from '../ApplicationContext';
import { DashboardPage } from '../../pages/adminapp/DashboardPage';
import { SystemLogsPage } from '../../pages/adminapp/SystemLogsPage';
import { WebappAPI } from '../../api/webapp/WebappAPI';
import { AdminAPI } from '../../api/adminapp/AdminAPI';

export interface MonitoringWorkflowOptions {
  checkInterval?: number;
  alertThresholds?: {
    errorRate?: number;
    responseTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  generateActivity?: boolean;
  triggerAlerts?: boolean;
}

export class AdminMonitoringWorkflow extends BaseWorkflow {
  private appContext: ApplicationContext;
  private options: MonitoringWorkflowOptions;

  constructor(
    browserContext: any,
    options: MonitoringWorkflowOptions = {}
  ) {
    super(browserContext, 'Admin Monitoring Workflow', {
      continueOnError: true,
      captureScreenshots: true,
      timeout: 300000
    });
    
    this.options = {
      checkInterval: 5000,
      alertThresholds: {
        errorRate: 0.05,
        responseTime: 2000,
        memoryUsage: 80,
        cpuUsage: 70
      },
      ...options
    };
    
    this.appContext = new ApplicationContext(browserContext);
  }

  protected defineSteps(): void {
    // Step 1: Setup and Authentication
    this.addStep({
      name: 'Setup Monitoring Environment',
      application: 'admin',
      execute: async (context: WorkflowContext) => {
        // Initialize applications
        await this.appContext.initializeApp('admin');
        await this.appContext.initializeApp('webapp');
        
        // Authenticate admin
        const adminCreds = this.configManager.getConfig('admin').getDefaultCredentials();
        await this.appContext.authenticate('admin', adminCreds!);
        
        // Authenticate webapp for activity generation
        if (this.options.generateActivity) {
          const webappCreds = this.configManager.getConfig('webapp').getDefaultCredentials();
          await this.appContext.authenticate('webapp', webappCreds!);
        }
        
        return {
          authenticated: true,
          monitoringEnabled: true,
          startTime: new Date()
        };
      },
      storeAs: 'setupData'
    });

    // Step 2: Initial System Health Check
    this.addStep({
      name: 'Initial System Health Check',
      application: 'admin',
      execute: async (context: WorkflowContext) => {
        const session = await this.appContext.getCurrentSession();
        const dashboard = new DashboardPage(session.page, session.locators);
        
        await dashboard.navigate();
        await dashboard.waitForMetricsLoad();
        
        const healthData = {
          systemStats: await dashboard.getSystemStats(),
          services: await dashboard.getServiceHealth(),
          metrics: await dashboard.getCurrentMetrics(),
          alerts: await dashboard.getActiveAlerts()
        };
        
        return healthData;
      },
      storeAs: 'initialHealthData'
    });

    // Step 3: Generate Activity (Optional)
    if (this.options.generateActivity) {
      this.addStep({
        name: 'Generate User Activity',
        application: 'webapp',
        execute: async (context: WorkflowContext) => {
          await this.appContext.switchTo('webapp');
          const api = this.appContext.api as WebappAPI;
          
          const activities = [];
          
          // Simulate various user activities
          // Upload document
          const uploadResult = await api.uploadDocument({
            file: Buffer.from('Test document content'),
            filename: 'monitoring-test.txt',
            project: 'Monitoring Test'
          });
          activities.push({ type: 'document_upload', result: uploadResult });
          
          // Search operations
          for (let i = 0; i < 5; i++) {
            const searchResult = await api.search({
              query: `test query ${i}`,
              filters: { type: 'document' }
            });
            activities.push({ type: 'search', result: searchResult });
          }
          
          // Feature generation (will create some load)
          const featureResult = await api.generateFeatures({
            documentId: uploadResult.id,
            count: 3
          });
          activities.push({ type: 'feature_generation', result: featureResult });
          
          // Simulate some errors
          if (this.options.triggerAlerts) {
            try {
              await api.get('/api/invalid-endpoint');
            } catch (error) {
              activities.push({ type: 'error', error: error.message });
            }
          }
          
          return {
            activitiesGenerated: activities.length,
            activities: activities.map(a => ({ type: a.type, success: !a.error }))
          };
        },
        storeAs: 'activityData'
      });
    }

    // Step 4: Monitor System Logs
    this.addStep({
      name: 'Analyze System Logs',
      application: 'admin',
      execute: async (context: WorkflowContext) => {
        await this.appContext.switchTo('admin');
        const session = await this.appContext.getCurrentSession();
        const logsPage = new SystemLogsPage(session.page, session.locators);
        
        await logsPage.navigate();
        
        // Analyze different log levels
        const logAnalysis = {
          errors: await logsPage.filterLogs({ level: 'error', timeRange: 'last-hour' }),
          warnings: await logsPage.filterLogs({ level: 'warning', timeRange: 'last-hour' }),
          info: await logsPage.filterLogs({ level: 'info', timeRange: 'last-5-minutes' })
        };
        
        // Search for specific patterns
        const patterns = [
          { pattern: 'timeout', category: 'performance' },
          { pattern: 'failed', category: 'errors' },
          { pattern: 'memory', category: 'resources' },
          { pattern: 'database', category: 'database' }
        ];
        
        const patternMatches = {};
        for (const { pattern, category } of patterns) {
          const matches = await logsPage.searchLogs(pattern);
          patternMatches[category] = matches.length;
        }
        
        // Enable real-time monitoring
        await logsPage.enableRealTimeUpdates();
        
        return {
          errorCount: logAnalysis.errors.length,
          warningCount: logAnalysis.warnings.length,
          infoCount: logAnalysis.info.length,
          patterns: patternMatches,
          realTimeEnabled: true
        };
      },
      storeAs: 'logAnalysisData'
    });

    // Step 5: Performance Monitoring
    this.addStep({
      name: 'Monitor System Performance',
      application: 'admin',
      execute: async (context: WorkflowContext) => {
        const session = await this.appContext.getCurrentSession();
        const dashboard = new DashboardPage(session.page, session.locators);
        const api = session.api as AdminAPI;
        
        await dashboard.navigate();
        
        // Collect performance metrics over time
        const performanceSnapshots = [];
        const iterations = 3;
        
        for (let i = 0; i < iterations; i++) {
          const metrics = await api.getSystemMetrics();
          performanceSnapshots.push({
            timestamp: new Date(),
            cpu: metrics.cpu,
            memory: metrics.memory,
            disk: metrics.disk,
            network: metrics.network,
            responseTime: metrics.averageResponseTime
          });
          
          // Wait before next check
          await session.page.waitForTimeout(this.options.checkInterval);
        }
        
        // Calculate averages and trends
        const avgMetrics = this.calculateAverageMetrics(performanceSnapshots);
        const trends = this.calculateTrends(performanceSnapshots);
        
        return {
          snapshots: performanceSnapshots.length,
          averages: avgMetrics,
          trends: trends,
          alerts: this.checkThresholds(avgMetrics)
        };
      },
      storeAs: 'performanceData'
    });

    // Step 6: Alert Management
    this.addStep({
      name: 'Manage System Alerts',
      application: 'admin',
      execute: async (context: WorkflowContext) => {
        const session = await this.appContext.getCurrentSession();
        const dashboard = new DashboardPage(session.page, session.locators);
        const api = session.api as AdminAPI;
        
        // Get current alerts
        const currentAlerts = await dashboard.getActiveAlerts();
        
        // Check if any alerts need attention
        const criticalAlerts = currentAlerts.filter(a => a.severity === 'critical');
        const highAlerts = currentAlerts.filter(a => a.severity === 'high');
        
        // Acknowledge some alerts
        const acknowledgedAlerts = [];
        for (const alert of criticalAlerts.slice(0, 2)) {
          await api.acknowledgeAlert({
            alertId: alert.id,
            note: 'Acknowledged by monitoring workflow'
          });
          acknowledgedAlerts.push(alert.id);
        }
        
        // Check alert rules
        const alertRules = await api.getAlertRules();
        const activeRules = alertRules.filter(r => r.enabled);
        
        return {
          totalAlerts: currentAlerts.length,
          criticalAlerts: criticalAlerts.length,
          highAlerts: highAlerts.length,
          acknowledgedCount: acknowledgedAlerts.length,
          activeRules: activeRules.length,
          alerts: currentAlerts.map(a => ({
            id: a.id,
            severity: a.severity,
            type: a.type,
            message: a.message
          }))
        };
      },
      storeAs: 'alertData'
    });

    // Step 7: Service Health Monitoring
    this.addStep({
      name: 'Check Service Health',
      application: 'admin',
      execute: async (context: WorkflowContext) => {
        const session = await this.appContext.getCurrentSession();
        const api = session.api as AdminAPI;
        
        // Check all services
        const serviceHealth = await api.getServiceHealth();
        
        // Detailed health checks
        const detailedHealth = {};
        for (const service of serviceHealth.services) {
          const details = await api.getServiceDetails(service.name);
          detailedHealth[service.name] = {
            status: details.status,
            uptime: details.uptime,
            lastRestart: details.lastRestart,
            errorRate: details.errorRate,
            avgResponseTime: details.avgResponseTime
          };
        }
        
        // Check dependencies
        const dependencies = await api.checkDependencies();
        
        return {
          healthyServices: serviceHealth.services.filter(s => s.status === 'healthy').length,
          unhealthyServices: serviceHealth.services.filter(s => s.status !== 'healthy').length,
          services: detailedHealth,
          dependencies: dependencies
        };
      },
      storeAs: 'serviceHealthData'
    });

    // Step 8: Database Monitoring
    this.addStep({
      name: 'Monitor Database Performance',
      application: 'admin',
      execute: async (context: WorkflowContext) => {
        const session = await this.appContext.getCurrentSession();
        const api = session.api as AdminAPI;
        
        // Get database metrics
        const dbMetrics = await api.getDatabaseMetrics();
        
        // Check slow queries
        const slowQueries = await api.getSlowQueries({
          threshold: 1000, // 1 second
          limit: 10
        });
        
        // Check connection pool
        const connectionPool = await api.getConnectionPoolStatus();
        
        return {
          database: {
            activeConnections: dbMetrics.activeConnections,
            poolSize: connectionPool.size,
            poolUtilization: connectionPool.utilization,
            avgQueryTime: dbMetrics.avgQueryTime,
            slowQueries: slowQueries.length,
            topSlowQueries: slowQueries.slice(0, 3).map(q => ({
              query: q.query.substring(0, 50) + '...',
              duration: q.duration,
              count: q.count
            }))
          }
        };
      },
      storeAs: 'databaseData'
    });

    // Step 9: Generate Monitoring Report
    this.addStep({
      name: 'Generate Monitoring Report',
      application: 'admin',
      execute: async (context: WorkflowContext) => {
        const report = {
          summary: {
            duration: Date.now() - context.state.data.setupData.startTime.getTime(),
            checksPerformed: context.state.stepResults.length,
            issuesFound: this.countIssues(context.state.data)
          },
          health: {
            initial: context.state.data.initialHealthData,
            services: context.state.data.serviceHealthData,
            database: context.state.data.databaseData
          },
          performance: context.state.data.performanceData,
          logs: {
            analysis: context.state.data.logAnalysisData,
            errorTrend: this.calculateErrorTrend(context.state.data)
          },
          alerts: context.state.data.alertData,
          recommendations: this.generateRecommendations(context.state.data)
        };
        
        // Take final dashboard screenshot
        const session = await this.appContext.getCurrentSession();
        const dashboard = new DashboardPage(session.page, session.locators);
        await dashboard.navigate();
        await this.captureScreenshot({
          name: 'monitoring_dashboard_final',
          application: 'admin',
          execute: async () => {}
        });
        
        return report;
      },
      storeAs: 'monitoringReport'
    });
  }

  /**
   * Calculate average metrics
   */
  private calculateAverageMetrics(snapshots: any[]): any {
    const sum = snapshots.reduce((acc, snap) => ({
      cpu: acc.cpu + snap.cpu.usage,
      memory: acc.memory + snap.memory.usagePercent,
      responseTime: acc.responseTime + snap.responseTime
    }), { cpu: 0, memory: 0, responseTime: 0 });
    
    return {
      cpu: sum.cpu / snapshots.length,
      memory: sum.memory / snapshots.length,
      responseTime: sum.responseTime / snapshots.length
    };
  }

  /**
   * Calculate trends
   */
  private calculateTrends(snapshots: any[]): any {
    if (snapshots.length < 2) return null;
    
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    
    return {
      cpu: last.cpu.usage - first.cpu.usage,
      memory: last.memory.usagePercent - first.memory.usagePercent,
      responseTime: last.responseTime - first.responseTime
    };
  }

  /**
   * Check thresholds
   */
  private checkThresholds(metrics: any): string[] {
    const alerts: string[] = [];
    const thresholds = this.options.alertThresholds!;
    
    if (metrics.cpu > thresholds.cpuUsage!) {
      alerts.push(`CPU usage (${metrics.cpu}%) exceeds threshold (${thresholds.cpuUsage}%)`);
    }
    
    if (metrics.memory > thresholds.memoryUsage!) {
      alerts.push(`Memory usage (${metrics.memory}%) exceeds threshold (${thresholds.memoryUsage}%)`);
    }
    
    if (metrics.responseTime > thresholds.responseTime!) {
      alerts.push(`Response time (${metrics.responseTime}ms) exceeds threshold (${thresholds.responseTime}ms)`);
    }
    
    return alerts;
  }

  /**
   * Count issues found
   */
  private countIssues(data: any): number {
    let issues = 0;
    
    issues += data.logAnalysisData?.errorCount || 0;
    issues += data.alertData?.criticalAlerts || 0;
    issues += data.serviceHealthData?.unhealthyServices || 0;
    
    return issues;
  }

  /**
   * Calculate error trend
   */
  private calculateErrorTrend(data: any): string {
    // This would analyze error patterns over time
    const errorCount = data.logAnalysisData?.errorCount || 0;
    
    if (errorCount > 100) return 'increasing';
    if (errorCount > 50) return 'stable';
    return 'decreasing';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(data: any): string[] {
    const recommendations: string[] = [];
    
    if (data.performanceData?.averages.cpu > 60) {
      recommendations.push('Consider scaling up CPU resources');
    }
    
    if (data.databaseData?.database.slowQueries > 5) {
      recommendations.push('Optimize slow database queries');
    }
    
    if (data.alertData?.criticalAlerts > 0) {
      recommendations.push('Address critical alerts immediately');
    }
    
    if (data.serviceHealthData?.unhealthyServices > 0) {
      recommendations.push('Investigate unhealthy services');
    }
    
    return recommendations;
  }

  /**
   * Get monitoring report
   */
  getReport(): any {
    return this.getData('monitoringReport');
  }
}
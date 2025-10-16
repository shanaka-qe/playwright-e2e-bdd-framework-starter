@adminapp @system-monitoring
Feature: System Monitoring
  As a system administrator
  I want to monitor system health and performance
  So that I can ensure optimal application performance

  Background:
    Given the admin app is accessible
    And I am on the system monitoring dashboard

  @smoke @critical
  Scenario: View system health overview
    When I view the system monitoring dashboard
    Then I should see overall system health status
    And I should see health indicators for all services
    And I should see current resource utilization
    And I should see uptime information

  @regression
  Scenario: Monitor database connections
    When I view the database monitoring section
    Then I should see PostgreSQL connection status
    And I should see ChromaDB connection status
    And I should see connection pool statistics
    And I should see query performance metrics

  @regression
  Scenario: Monitor service availability
    When I check the service availability panel
    Then I should see status for webapp service
    And I should see status for MCP platform service
    And I should see status for AI services (Ollama, CLIP)
    And I should see response time metrics for each service

  @regression
  Scenario: View performance metrics
    When I navigate to the performance metrics section
    Then I should see CPU usage graphs
    And I should see memory utilization graphs
    And I should see disk usage statistics
    And I should see network I/O metrics
    And the metrics should update in real-time

  @regression
  Scenario: Set up monitoring alerts
    When I configure a new alert for high CPU usage
    And I set the threshold to 80%
    And I save the alert configuration
    Then the alert should be active
    When CPU usage exceeds 80%
    Then I should receive an alert notification
    And the alert should be logged in the alerts history

  @regression
  Scenario: Export monitoring data
    Given I have monitoring data for the last 24 hours
    When I export performance metrics
    And I select CSV format
    Then a CSV file should be downloaded
    And the file should contain timestamped performance data

  @smoke
  Scenario: Historical data visualization
    When I select a time range for the last 7 days
    Then I should see historical performance charts
    And I should be able to zoom into specific time periods
    And I should see trend analysis information

  @regression
  Scenario: System resource alerts
    When system resources reach critical levels
    Then I should see visual warnings on the dashboard
    And I should receive immediate notifications
    And the alerts should include recommended actions
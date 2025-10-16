@adminapp @log-management
Feature: Admin App Log Management
  As a system administrator
  I want to manage and monitor application logs
  So that I can troubleshoot issues and monitor system health

  Background:
    Given the admin app is accessible
    And I am on the admin dashboard

  @smoke @critical
  Scenario: View application logs
    When I navigate to the logs section
    Then I should see a list of recent log entries
    And each log entry should display timestamp, level, and message
    And the logs should be ordered by timestamp (newest first)

  @regression
  Scenario: Filter logs by level
    Given I am viewing the logs section
    When I filter logs by "ERROR" level
    Then I should see only error-level log entries
    And the filter should be visually active
    When I clear the filter
    Then I should see all log levels again

  @regression
  Scenario: Search logs by content
    Given I am viewing the logs section
    When I search for "authentication"
    Then I should see only logs containing "authentication"
    And the search term should be highlighted in results
    When I clear the search
    Then I should see all logs again

  @regression
  Scenario: Export logs to file
    Given I am viewing filtered logs
    When I click the "Export" button
    And I select "JSON" format
    Then a log file should be downloaded
    And the file should contain the filtered log entries
    And the file should be in valid JSON format

  @regression
  Scenario: Real-time log streaming
    Given I am viewing the logs section
    And I enable real-time log streaming
    When new log entries are generated
    Then I should see them appear automatically
    And the view should scroll to show new entries
    And the streaming indicator should be active

  @regression
  Scenario: Log entry details
    Given I am viewing the logs section
    When I click on a log entry
    Then I should see detailed information about the entry
    And I should see the full stack trace (if applicable)
    And I should see associated metadata
    And I should be able to copy the log details

  @smoke
  Scenario: Pagination through log history
    Given there are more than 50 log entries
    When I view the logs section
    Then I should see pagination controls
    And I should see 50 entries per page by default
    When I navigate to the next page
    Then I should see the next set of log entries
    And the pagination should update accordingly

  @regression
  Scenario: Log retention and cleanup
    Given I am in the log management settings
    When I configure log retention to 30 days
    And I save the settings
    Then old logs should be automatically cleaned up
    And I should see a confirmation of the retention policy
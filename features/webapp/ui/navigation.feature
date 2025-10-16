@webapp @navigation
Feature: Webapp Navigation
  As a user of the webapp
  I want to navigate between different sections
  So that I can access all available functionality

  Background:
    Given the webapp is accessible
    And I am on the main dashboard

  @smoke @critical
  Scenario: Navigate through main tabs
    When I click on the "Overview" tab
    Then I should be on the Overview page
    And the "Overview" tab should be active
    When I click on the "Document Hub" tab
    Then I should be on the Document Hub page
    And the "Document Hub" tab should be active
    When I click on the "Test Features Generator" tab
    Then I should be on the Test Features Generator page
    And the "Test Features Generator" tab should be active
    When I click on the "Settings" tab
    Then I should be on the Settings page
    And the "Settings" tab should be active

  @smoke
  Scenario: Sidebar navigation functionality
    When I click the sidebar toggle button
    Then the sidebar should collapse
    And the main content should expand
    When I click the sidebar toggle button again
    Then the sidebar should expand
    And the main content should adjust accordingly

  @regression
  Scenario: Breadcrumb navigation
    Given I am on a nested page within Document Hub
    When I view the breadcrumb navigation
    Then I should see the current page path
    And I should be able to navigate to parent pages using breadcrumbs
    When I click on "Document Hub" in the breadcrumbs
    Then I should be taken to the Document Hub main page

  @regression
  Scenario: Browser back and forward navigation
    Given I navigate from Overview to Document Hub
    And then to Feature Generator
    When I click the browser back button
    Then I should be on the Document Hub page
    When I click the browser forward button
    Then I should be on the Feature Generator page
    And the correct tab should be active

  @regression
  Scenario: Responsive navigation on mobile
    Given I am using a mobile viewport
    When I view the navigation
    Then the navigation should be mobile-optimized
    And I should see a hamburger menu button
    When I click the hamburger menu
    Then the navigation menu should slide out
    And I should be able to navigate to different sections

  @regression
  Scenario: Keyboard navigation support
    When I use the Tab key to navigate
    Then I should be able to reach all interactive elements
    And the focus indicators should be visible
    When I press Enter on a navigation tab
    Then I should navigate to that section

  @smoke
  Scenario: Page loading states
    When I navigate to a new section
    Then I should see appropriate loading indicators
    And the page should load within 3 seconds
    And all interactive elements should be functional after loading

  @regression
  Scenario: Navigation state persistence
    Given I am on the Feature Generator page
    When I refresh the browser
    Then I should still be on the Feature Generator page
    And the correct tab should be active
    And my previous work should be preserved
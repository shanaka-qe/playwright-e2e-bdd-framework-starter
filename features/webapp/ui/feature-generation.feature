@webapp @feature-generation
Feature: Feature Generation
  As a QA engineer
  I want to generate test features from documents using AI
  So that I can quickly create comprehensive test scenarios

  Background:
    Given the webapp is accessible
    And I have uploaded a requirements document "user-requirements.pdf"
    And I am on the Test Features Generator page

  @smoke @critical
  Scenario: Generate features from uploaded document
    When I select the uploaded document "user-requirements.pdf"
    And I click "Generate Features"
    Then I should see the AI processing indicator
    When the generation is complete
    Then I should see generated Gherkin scenarios in the preview
    And the scenarios should be syntactically valid
    And I should see at least 3 different scenarios

  @regression
  Scenario: Edit generated feature content
    Given I have generated features from a document
    When I click "Edit" on a generated scenario
    And I modify the scenario content
    And I save the changes
    Then the scenario should be updated with my changes
    And the syntax should remain valid

  @smoke
  Scenario: Save generated features
    Given I have generated features from a document
    And I have reviewed the generated content
    When I click "Save Features"
    And I provide a feature file name "login-scenarios"
    Then the feature file should be saved
    And I should see it in the saved features list
    And I should see a success message "Features saved successfully"

  @regression
  Scenario: Download feature file
    Given I have saved a feature file "login-scenarios"
    When I click the download button for the feature
    Then a Gherkin feature file should be downloaded
    And the file should contain valid Gherkin syntax
    And the filename should be "login-scenarios.feature"

  @regression
  Scenario: Real-time preview updates
    When I start typing in the feature editor
    Then the preview should update in real-time
    And syntax highlighting should be applied
    And any syntax errors should be highlighted

  @regression
  Scenario: Feature generation with custom prompts
    Given I have selected a document for feature generation
    When I provide a custom prompt "Focus on error handling scenarios"
    And I click "Generate Features"
    Then the generated scenarios should reflect the custom prompt
    And I should see error handling test cases

  @regression
  Scenario: Manage saved features
    Given I have multiple saved feature files
    When I view the saved features list
    Then I should see all my saved features
    And I should be able to rename a feature file
    And I should be able to delete a feature file
    And I should be able to duplicate a feature file

  @regression
  Scenario: Feature generation history
    Given I have generated features multiple times
    When I view the generation history
    Then I should see previous generation attempts
    And I should be able to restore a previous version
    And I should see timestamps for each generation
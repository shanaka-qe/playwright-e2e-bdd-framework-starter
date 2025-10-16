@e2e-workflow @document-to-feature
Feature: Document to Feature Generation Workflow
  As a QA engineer
  I want to complete the full workflow from document upload to feature generation
  So that I can efficiently create test scenarios from requirements

  Background:
    Given all required services are running
    And I have a requirements document "complete-user-flow.pdf"

  @smoke @critical @e2e-workflow
  Scenario: Complete document to feature workflow
    Given the webapp is accessible
    When I navigate to the Document Hub
    And I upload the requirements document "complete-user-flow.pdf"
    Then the document should be uploaded successfully
    And the document should be processed
    
    When I navigate to the Test Features Generator
    And I select the uploaded document
    And I generate features using AI
    Then I should see generated Gherkin scenarios
    And the scenarios should be based on the document content
    
    When I review and edit the generated scenarios
    And I save the feature file as "user-flow-tests"
    Then the feature file should be saved successfully
    
    When I download the feature file
    Then I should receive a valid Gherkin file
    And the file should be ready for test automation

  @regression @e2e-workflow
  Scenario: Multi-document feature generation workflow
    Given the webapp is accessible
    When I upload multiple related documents:
      | document           | type        |
      | login-specs.pdf    | Functional  |
      | ui-mockups.png     | Visual      |
      | api-docs.json      | Technical   |
    Then all documents should be processed successfully
    
    When I navigate to the Test Features Generator
    And I select all uploaded documents
    And I generate comprehensive features
    Then I should see features covering all document types
    And the features should be interconnected
    And I should see UI, API, and visual test scenarios

  @regression @e2e-workflow
  Scenario: Document processing error recovery
    Given the webapp is accessible
    When I upload a corrupted document "corrupted-file.pdf"
    And the document processing fails
    Then I should see a clear error message
    And I should be able to retry the upload
    
    When I upload a valid replacement document
    Then the processing should succeed
    And I should be able to continue with feature generation

  @regression @e2e-workflow
  Scenario: Collaborative feature generation workflow
    Given multiple users are working on the same project
    When User A uploads a document and generates features
    And User B logs in and views the same project
    Then User B should see the document and generated features
    When User B makes edits to the features
    And User A refreshes their view
    Then User A should see User B's changes
    And there should be no conflicts in the feature content

  @regression @e2e-workflow
  Scenario: Version control in feature generation
    Given I have generated features from a document
    When I make significant changes to the generated features
    And I save a new version
    Then I should be able to see version history
    And I should be able to compare different versions
    And I should be able to restore a previous version if needed

  @performance @e2e-workflow
  Scenario: Large document processing workflow
    Given I have a large requirements document (50+ pages)
    When I upload the document
    Then the upload should complete within 2 minutes
    When the document is processed
    Then processing should complete within 5 minutes
    When I generate features from the large document
    Then feature generation should complete within 3 minutes
    And the generated features should cover all major sections
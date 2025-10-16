@webapp @document-management
Feature: Document Management
  As a QA engineer
  I want to upload and manage documents in the webapp
  So that I can create test cases from requirements documents

  Background:
    Given the webapp is accessible
    And I am on the Document Hub page

  @smoke @critical
  Scenario: Upload a PDF document successfully
    When I upload a PDF file "sample-requirements.pdf"
    Then I should see a success message "Document uploaded successfully"
    And the document should appear in the document list
    And the document should have status "Processing"
    When the document processing is complete
    Then the document status should be "Processed"

  @regression
  Scenario: Upload multiple document types
    When I upload the following documents:
      | filename           | type  | expected_status |
      | requirements.pdf   | PDF   | Processed       |
      | specs.docx        | DOCX  | Processed       |
      | notes.txt         | TXT   | Processed       |
      | user-story.md     | MD    | Processed       |
    Then all documents should be processed successfully
    And I should see 4 documents in the document list

  @regression
  Scenario: Document upload validation
    When I try to upload an unsupported file "malware.exe"
    Then I should see an error message "File type not supported"
    And the document should not appear in the document list

  @regression
  Scenario: Large file upload handling
    When I upload a large file "large-document.pdf" of size 60MB
    Then I should see an error message "File size exceeds limit"
    And the upload should be rejected

  @smoke
  Scenario: View document details
    Given I have uploaded a document "requirements.pdf"
    When I click on the document in the list
    Then I should see the document details modal
    And I should see the document metadata
    And I should see document processing information

  @regression
  Scenario: Delete a document
    Given I have uploaded a document "test-document.pdf"
    When I click the delete button for the document
    And I confirm the deletion
    Then the document should be removed from the list
    And I should see a confirmation message "Document deleted successfully"

  @regression
  Scenario: Search documents
    Given I have uploaded multiple documents
    When I search for "requirements"
    Then I should see only documents matching "requirements"
    And the search results should be highlighted

  @regression
  Scenario: Filter documents by type
    Given I have uploaded documents of different types
    When I filter by "PDF" type
    Then I should see only PDF documents
    And the filter should be visually active
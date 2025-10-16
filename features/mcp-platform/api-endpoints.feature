@mcp-platform @mcp-tools
Feature: MCP Platform Tools
  As a developer integrating with the MCP platform
  I want to use MCP tools for AI-powered QA assistance
  So that I can leverage domain knowledge and automation capabilities

  Background:
    Given the MCP platform is running
    And the MCP server is connected

  @smoke @critical @mcp
  Scenario: Query domain knowledge tool
    Given I have documents in the knowledge base
    When I invoke the "query_domain_knowledge" tool with:
      """
      {
        "query": "document upload requirements",
        "max_results": 5,
        "min_similarity": 0.7
      }
      """
    Then I should receive relevant knowledge chunks
    And each chunk should have a similarity score
    And the results should be limited to 5 items

  @regression @mcp
  Scenario: Generate test case tool
    When I invoke the "generate_test_case" tool with:
      """
      {
        "requirements": "User should be able to upload PDF documents",
        "context": "document management system",
        "test_type": "functional"
      }
      """
    Then I should receive generated Gherkin scenarios
    And the scenarios should be syntactically valid
    And the scenarios should match the requirements

  @regression @mcp
  Scenario: Get Playwright best practices tool
    When I invoke the "get_playwright_best_practices" tool
    Then I should receive best practices guidelines
    And the guidelines should include code examples
    And the response should be structured by category

  @regression @mcp
  Scenario: Generate Playwright code tool
    When I invoke the "generate_playwright_code" tool with:
      """
      {
        "feature_description": "Upload a document to the system",
        "page_objects": true,
        "typescript": true
      }
      """
    Then I should receive valid Playwright code
    And the code should use page object patterns
    And the code should be TypeScript compatible

  @regression @mcp
  Scenario: MCP tool error handling
    When I invoke a tool with invalid parameters
    Then I should receive a structured error response
    And the error should include helpful guidance
    And the error should not expose internal details

  @smoke @mcp
  Scenario: MCP server capabilities
    When I query the MCP server capabilities
    Then I should see the available tools
    And each tool should have a description
    And the tool schema should be valid
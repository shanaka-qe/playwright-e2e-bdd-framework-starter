/**
 * Accessibility Helpers
 * 
 * Provides utilities for accessibility testing and validation
 * Ensures UI elements meet WCAG guidelines and best practices
 */

import { Page, Locator, expect } from '@playwright/test';

export interface AccessibilityViolation {
  element: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  wcagCriteria?: string;
}

export class AccessibilityHelpers {
  constructor(private page: Page) {}

  /**
   * Validate page has proper heading hierarchy
   */
  async validateHeadingHierarchy(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = [];
    
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const currentLevel = parseInt(tagName.substring(1));
      const text = await heading.textContent();
      
      // Check for skipped heading levels
      if (previousLevel > 0 && currentLevel > previousLevel + 1) {
        violations.push({
          element: `${tagName}: ${text}`,
          issue: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
          severity: 'error',
          wcagCriteria: '1.3.1 Info and Relationships'
        });
      }
      
      // Check for multiple h1 elements
      if (currentLevel === 1 && previousLevel === 1) {
        violations.push({
          element: `${tagName}: ${text}`,
          issue: 'Multiple h1 elements found on page',
          severity: 'warning',
          wcagCriteria: '2.4.6 Headings and Labels'
        });
      }
      
      previousLevel = currentLevel;
    }
    
    return violations;
  }

  /**
   * Validate form elements have proper labels
   */
  async validateFormLabels(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = [];
    
    // Check input elements
    const inputs = await this.page.locator('input:not([type="hidden"]), textarea, select').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');
      const type = await input.getAttribute('type');
      
      // Check if input has any labeling mechanism
      let hasLabel = false;
      
      if (ariaLabel || ariaLabelledBy) {
        hasLabel = true;
      } else if (id) {
        const label = await this.page.locator(`label[for="${id}"]`).count();
        hasLabel = label > 0;
      }
      
      if (!hasLabel) {
        violations.push({
          element: `${await input.evaluate(el => el.tagName)}[type="${type}"]`,
          issue: 'Form element missing accessible label',
          severity: 'error',
          wcagCriteria: '1.3.1 Info and Relationships'
        });
      }
      
      // Warn about placeholder-only labeling
      if (!hasLabel && placeholder) {
        violations.push({
          element: `${await input.evaluate(el => el.tagName)}[placeholder="${placeholder}"]`,
          issue: 'Form element uses only placeholder for labeling',
          severity: 'warning',
          wcagCriteria: '3.3.2 Labels or Instructions'
        });
      }
    }
    
    return violations;
  }

  /**
   * Validate images have alt text
   */
  async validateImageAltText(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = [];
    
    const images = await this.page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      const role = await img.getAttribute('role');
      
      // Check for missing alt attribute
      if (alt === null && role !== 'presentation') {
        violations.push({
          element: `img[src="${src}"]`,
          issue: 'Image missing alt attribute',
          severity: 'error',
          wcagCriteria: '1.1.1 Non-text Content'
        });
      }
      
      // Check for empty alt text on informative images
      if (alt === '' && !src?.includes('decorative') && role !== 'presentation') {
        violations.push({
          element: `img[src="${src}"]`,
          issue: 'Potentially informative image has empty alt text',
          severity: 'warning',
          wcagCriteria: '1.1.1 Non-text Content'
        });
      }
    }
    
    return violations;
  }

  /**
   * Validate interactive elements are keyboard accessible
   */
  async validateKeyboardAccessibility(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = [];
    
    // Check for click handlers on non-interactive elements
    const clickableElements = await this.page.locator('[onclick], [ng-click], [data-click]').all();
    
    for (const element of clickableElements) {
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const role = await element.getAttribute('role');
      const tabindex = await element.getAttribute('tabindex');
      
      const interactiveTags = ['a', 'button', 'input', 'select', 'textarea'];
      const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab'];
      
      if (!interactiveTags.includes(tagName) && !interactiveRoles.includes(role || '')) {
        if (tabindex === null || tabindex === '-1') {
          violations.push({
            element: `${tagName}${role ? `[role="${role}"]` : ''}`,
            issue: 'Interactive element not keyboard accessible',
            severity: 'error',
            wcagCriteria: '2.1.1 Keyboard'
          });
        }
      }
    }
    
    return violations;
  }

  /**
   * Validate color contrast meets WCAG standards
   */
  async validateColorContrast(locator?: Locator): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = [];
    
    // This is a simplified check - for full contrast validation, use axe-core
    const elements = locator ? [locator] : [this.page.locator('body')];
    
    for (const element of elements) {
      const color = await element.evaluate(el => window.getComputedStyle(el).color);
      const backgroundColor = await element.evaluate(el => window.getComputedStyle(el).backgroundColor);
      
      // Check for potential low contrast combinations
      if (this.isPotentiallyLowContrast(color, backgroundColor)) {
        violations.push({
          element: await element.evaluate(el => el.tagName),
          issue: 'Potential color contrast issue',
          severity: 'warning',
          wcagCriteria: '1.4.3 Contrast (Minimum)'
        });
      }
    }
    
    return violations;
  }

  /**
   * Validate ARIA attributes are used correctly
   */
  async validateAriaUsage(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = [];
    
    // Check for invalid ARIA roles
    const elementsWithRoles = await this.page.locator('[role]').all();
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
      'definition', 'dialog', 'directory', 'document', 'feed', 'figure',
      'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link',
      'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math',
      'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
      'navigation', 'none', 'note', 'option', 'presentation', 'progressbar',
      'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader',
      'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton',
      'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term',
      'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
    ];
    
    for (const element of elementsWithRoles) {
      const role = await element.getAttribute('role');
      if (role && !validRoles.includes(role)) {
        violations.push({
          element: `[role="${role}"]`,
          issue: `Invalid ARIA role: ${role}`,
          severity: 'error',
          wcagCriteria: '4.1.2 Name, Role, Value'
        });
      }
    }
    
    // Check for aria-labelledby pointing to non-existent elements
    const elementsWithLabelledBy = await this.page.locator('[aria-labelledby]').all();
    
    for (const element of elementsWithLabelledBy) {
      const labelledBy = await element.getAttribute('aria-labelledby');
      if (labelledBy) {
        const ids = labelledBy.split(' ');
        for (const id of ids) {
          const labelElement = await this.page.locator(`#${id}`).count();
          if (labelElement === 0) {
            violations.push({
              element: await element.evaluate(el => el.tagName),
              issue: `aria-labelledby references non-existent element: ${id}`,
              severity: 'error',
              wcagCriteria: '1.3.1 Info and Relationships'
            });
          }
        }
      }
    }
    
    return violations;
  }

  /**
   * Validate focus indicators are visible
   */
  async validateFocusIndicators(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = [];
    
    // Get all focusable elements
    const focusableElements = await this.page.locator(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ).all();
    
    for (const element of focusableElements) {
      await element.focus();
      
      // Check if focus is visible
      const outlineWidth = await element.evaluate(el => 
        window.getComputedStyle(el).outlineWidth
      );
      const outlineStyle = await element.evaluate(el => 
        window.getComputedStyle(el).outlineStyle
      );
      const boxShadow = await element.evaluate(el => 
        window.getComputedStyle(el).boxShadow
      );
      
      if (outlineStyle === 'none' && boxShadow === 'none') {
        const elementDesc = await element.evaluate(el => 
          `${el.tagName}${el.id ? `#${el.id}` : ''}${el.className ? `.${el.className.split(' ')[0]}` : ''}`
        );
        
        violations.push({
          element: elementDesc,
          issue: 'Focus indicator not visible',
          severity: 'error',
          wcagCriteria: '2.4.7 Focus Visible'
        });
      }
    }
    
    return violations;
  }

  /**
   * Run comprehensive accessibility audit
   */
  async runAccessibilityAudit(): Promise<AccessibilityViolation[]> {
    const allViolations: AccessibilityViolation[] = [];
    
    // Run all validation checks
    const headingViolations = await this.validateHeadingHierarchy();
    const formViolations = await this.validateFormLabels();
    const imageViolations = await this.validateImageAltText();
    const keyboardViolations = await this.validateKeyboardAccessibility();
    const ariaViolations = await this.validateAriaUsage();
    const focusViolations = await this.validateFocusIndicators();
    
    allViolations.push(
      ...headingViolations,
      ...formViolations,
      ...imageViolations,
      ...keyboardViolations,
      ...ariaViolations,
      ...focusViolations
    );
    
    return allViolations;
  }

  /**
   * Assert page meets accessibility standards
   */
  async assertAccessible(options?: { 
    skipViolations?: string[]; 
    allowWarnings?: boolean 
  }): Promise<void> {
    const violations = await this.runAccessibilityAudit();
    
    // Filter violations based on options
    let relevantViolations = violations;
    
    if (options?.skipViolations) {
      relevantViolations = violations.filter(v => 
        !options.skipViolations!.some(skip => v.issue.includes(skip))
      );
    }
    
    if (options?.allowWarnings) {
      relevantViolations = relevantViolations.filter(v => v.severity === 'error');
    }
    
    // Assert no violations
    if (relevantViolations.length > 0) {
      const violationMessages = relevantViolations.map(v => 
        `${v.severity.toUpperCase()}: ${v.element} - ${v.issue} (WCAG ${v.wcagCriteria || 'N/A'})`
      );
      
      throw new Error(
        `Accessibility violations found:\n${violationMessages.join('\n')}`
      );
    }
  }

  /**
   * Get accessibility tree for debugging
   */
  async getAccessibilityTree(): Promise<any> {
    return await this.page.accessibility.snapshot();
  }

  /**
   * Helper to check for potentially low contrast
   */
  private isPotentiallyLowContrast(color: string, backgroundColor: string): boolean {
    // This is a simplified check - real contrast calculation requires RGB conversion
    const lightColors = ['white', 'rgb(255, 255, 255)', '#ffffff', '#fff'];
    const darkColors = ['black', 'rgb(0, 0, 0)', '#000000', '#000'];
    
    return (
      (lightColors.includes(color) && lightColors.includes(backgroundColor)) ||
      (darkColors.includes(color) && darkColors.includes(backgroundColor))
    );
  }

  /**
   * Check if element is screen reader accessible
   */
  async isScreenReaderAccessible(locator: Locator): Promise<boolean> {
    const isVisible = await locator.isVisible();
    const ariaHidden = await locator.getAttribute('aria-hidden');
    const role = await locator.getAttribute('role');
    
    // Element should be visible and not hidden from screen readers
    return isVisible && ariaHidden !== 'true' && role !== 'presentation';
  }

  /**
   * Get accessible name for element
   */
  async getAccessibleName(locator: Locator): Promise<string> {
    // Try different methods to get accessible name
    const ariaLabel = await locator.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;
    
    const ariaLabelledBy = await locator.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelTexts = [];
      for (const id of ariaLabelledBy.split(' ')) {
        const labelElement = this.page.locator(`#${id}`);
        const text = await labelElement.textContent();
        if (text) labelTexts.push(text);
      }
      if (labelTexts.length > 0) return labelTexts.join(' ');
    }
    
    const title = await locator.getAttribute('title');
    if (title) return title;
    
    // For form elements, check associated label
    const id = await locator.getAttribute('id');
    if (id) {
      const label = this.page.locator(`label[for="${id}"]`);
      const labelText = await label.textContent();
      if (labelText) return labelText;
    }
    
    // Fallback to text content
    return await locator.textContent() || '';
  }
}
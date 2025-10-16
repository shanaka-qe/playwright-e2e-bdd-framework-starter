/**
 * UI Pattern Locators
 * 
 * Provides locator strategies for common UI patterns and complex components
 * Implements best practices for locating modern web UI elements
 */

import { Page, Locator } from '@playwright/test';
import { RoleBasedLocators } from './RoleBasedLocators';

export class UIPatternLocators {
  private roleBasedLocators: RoleBasedLocators;

  constructor(private page: Page) {
    this.roleBasedLocators = new RoleBasedLocators(page);
  }

  // ============= Data Tables =============

  /**
   * Locate table cell by column header and row identifier
   */
  tableCellByHeaderAndRow(tableLocator: Locator, columnHeader: string, rowIdentifier: string): Locator {
    return tableLocator
      .locator('tr')
      .filter({ hasText: rowIdentifier })
      .locator('td')
      .nth(this.getColumnIndex(tableLocator, columnHeader));
  }

  /**
   * Get column index by header text
   */
  private async getColumnIndex(tableLocator: Locator, headerText: string): Promise<number> {
    const headers = await tableLocator.locator('th').allTextContents();
    return headers.findIndex(h => h.includes(headerText));
  }

  /**
   * Locate sortable table header
   */
  sortableTableHeader(headerText: string): Locator {
    return this.page.locator(`th[aria-sort]:has-text("${headerText}"), th.sortable:has-text("${headerText}")`);
  }

  /**
   * Locate table row by unique identifier
   */
  tableRow(identifier: string): Locator {
    return this.page.locator(`tr:has-text("${identifier}")`);
  }

  /**
   * Locate table action buttons (edit, delete, etc.)
   */
  tableRowAction(rowIdentifier: string, action: string): Locator {
    return this.tableRow(rowIdentifier)
      .locator(`button:has-text("${action}"), a:has-text("${action}"), [aria-label*="${action}" i]`);
  }

  // ============= Forms and Inputs =============

  /**
   * Locate form field by label with error handling
   */
  formFieldWithError(label: string): Locator {
    const field = this.roleBasedLocators.textboxByLabel(label);
    const errorMessage = this.page.locator(`[id="${label}-error"], [aria-describedby*="error"]:near(${field})`);
    return { field, errorMessage };
  }

  /**
   * Locate date picker input and calendar
   */
  datePicker(label: string): { input: Locator; calendar: Locator; } {
    const input = this.roleBasedLocators.textboxByLabel(label);
    const calendar = this.page.locator('[role="dialog"]:has([role="grid"]), .calendar-popup');
    return { input, calendar };
  }

  /**
   * Locate autocomplete/typeahead components
   */
  autocomplete(label: string): { input: Locator; suggestions: Locator; } {
    const input = this.roleBasedLocators.combobox(label);
    const suggestions = this.page.locator('[role="listbox"], .autocomplete-suggestions');
    return { input, suggestions };
  }

  /**
   * Locate multi-select components
   */
  multiSelect(label: string): { trigger: Locator; options: Locator; selectedItems: Locator; } {
    const trigger = this.page.locator(`[aria-label*="${label}" i], label:has-text("${label}") + div`);
    const options = this.page.locator('[role="option"]');
    const selectedItems = this.page.locator('.selected-item, [aria-selected="true"]');
    return { trigger, options, selectedItems };
  }

  /**
   * Locate file upload components
   */
  fileUpload(label?: string): { input: Locator; dropzone: Locator; preview: Locator; } {
    const input = label 
      ? this.page.locator(`input[type="file"][aria-label*="${label}" i]`)
      : this.page.locator('input[type="file"]');
    const dropzone = this.page.locator('[data-testid="drop-zone"], .dropzone, [role="button"]:has-text("Drop files")');
    const preview = this.page.locator('.file-preview, [data-testid="file-preview"]');
    return { input, dropzone, preview };
  }

  // ============= Navigation Patterns =============

  /**
   * Locate breadcrumb navigation
   */
  breadcrumb(): { container: Locator; items: Locator; current: Locator; } {
    const container = this.roleBasedLocators.navigation('breadcrumb');
    const items = container.locator('a, [role="link"]');
    const current = container.locator('[aria-current="page"]');
    return { container, items, current };
  }

  /**
   * Locate pagination controls
   */
  pagination(): { 
    container: Locator; 
    previous: Locator; 
    next: Locator; 
    pageNumbers: Locator;
    currentPage: Locator;
  } {
    const container = this.page.locator('[role="navigation"][aria-label*="pagination" i], .pagination');
    return {
      container,
      previous: container.locator('[aria-label*="previous" i], button:has-text("Previous")'),
      next: container.locator('[aria-label*="next" i], button:has-text("Next")'),
      pageNumbers: container.locator('[role="button"]:not([aria-label*="previous" i]):not([aria-label*="next" i])'),
      currentPage: container.locator('[aria-current="page"], .active')
    };
  }

  /**
   * Locate stepper/wizard navigation
   */
  stepper(): { 
    container: Locator; 
    steps: Locator; 
    currentStep: Locator;
    completedSteps: Locator;
  } {
    const container = this.page.locator('[role="navigation"], .stepper, .wizard');
    return {
      container,
      steps: container.locator('[role="link"], .step'),
      currentStep: container.locator('[aria-current="step"], .active-step'),
      completedSteps: container.locator('[aria-label*="completed" i], .completed')
    };
  }

  // ============= Overlays and Modals =============

  /**
   * Locate modal dialog components
   */
  modal(title?: string): { 
    dialog: Locator; 
    header: Locator; 
    body: Locator; 
    footer: Locator;
    closeButton: Locator;
  } {
    const dialog = title 
      ? this.roleBasedLocators.dialog(title)
      : this.roleBasedLocators.dialog();
    
    return {
      dialog,
      header: dialog.locator('header, [role="banner"], .modal-header'),
      body: dialog.locator('main, [role="main"], .modal-body'),
      footer: dialog.locator('footer, .modal-footer'),
      closeButton: dialog.locator('[aria-label*="close" i], button:has-text("×")')
    };
  }

  /**
   * Locate tooltip content
   */
  tooltip(triggerElement: Locator): Locator {
    const tooltipId = triggerElement.getAttribute('aria-describedby');
    if (tooltipId) {
      return this.page.locator(`#${tooltipId}`);
    }
    return this.page.locator('[role="tooltip"]:visible');
  }

  /**
   * Locate popover/dropdown menu
   */
  popover(trigger: string): { 
    trigger: Locator; 
    menu: Locator; 
    items: Locator;
  } {
    const triggerButton = this.roleBasedLocators.button(trigger);
    const menu = this.page.locator('[role="menu"]:visible, .dropdown-menu:visible');
    const items = menu.locator('[role="menuitem"]');
    return { trigger: triggerButton, menu, items };
  }

  // ============= Data Display =============

  /**
   * Locate card components
   */
  card(title: string): { 
    container: Locator; 
    header: Locator; 
    body: Locator;
    actions: Locator;
  } {
    const container = this.page.locator(
      `[role="article"]:has(h2:text-is("${title}")), ` +
      `[role="region"]:has(h2:text-is("${title}")), ` +
      `.card:has-text("${title}")`
    );
    
    return {
      container,
      header: container.locator('header, .card-header'),
      body: container.locator('main, .card-body'),
      actions: container.locator('footer, .card-actions')
    };
  }

  /**
   * Locate accordion/collapsible sections
   */
  accordion(sectionTitle: string): { 
    trigger: Locator; 
    content: Locator;
    isExpanded: () => Promise<boolean>;
  } {
    const trigger = this.page.locator(
      `[aria-expanded]:has-text("${sectionTitle}"), ` +
      `button:has-text("${sectionTitle}")`
    );
    const content = this.page.locator(
      `[aria-labelledby]:has-text("${sectionTitle}"), ` +
      `.accordion-content:below(:has-text("${sectionTitle}"))`
    );
    
    return {
      trigger,
      content,
      isExpanded: async () => {
        const expanded = await trigger.getAttribute('aria-expanded');
        return expanded === 'true';
      }
    };
  }

  /**
   * Locate tabs interface
   */
  tabs(containerLabel?: string): { 
    tablist: Locator; 
    tabs: Locator; 
    activeTab: Locator;
    panels: Locator;
    activePanel: Locator;
  } {
    const tablist = containerLabel
      ? this.page.locator(`[role="tablist"][aria-label*="${containerLabel}" i]`)
      : this.page.locator('[role="tablist"]');
    
    return {
      tablist,
      tabs: tablist.locator('[role="tab"]'),
      activeTab: tablist.locator('[role="tab"][aria-selected="true"]'),
      panels: this.page.locator('[role="tabpanel"]'),
      activePanel: this.page.locator('[role="tabpanel"]:visible')
    };
  }

  // ============= Feedback and Status =============

  /**
   * Locate alert/notification components
   */
  alert(type?: 'success' | 'error' | 'warning' | 'info'): Locator {
    if (type) {
      return this.page.locator(
        `[role="alert"].${type}, ` +
        `[role="alert"][class*="${type}"], ` +
        `.alert-${type}`
      );
    }
    return this.roleBasedLocators.alert();
  }

  /**
   * Locate loading indicators
   */
  loadingIndicator(): Locator {
    return this.page.locator(
      '[role="status"][aria-label*="loading" i], ' +
      '[aria-busy="true"], ' +
      '.spinner, .loading, ' +
      '[data-testid="loading-indicator"]'
    );
  }

  /**
   * Locate progress indicators
   */
  progress(label?: string): { 
    bar: Locator; 
    value: () => Promise<string>;
  } {
    const bar = label
      ? this.roleBasedLocators.progressbar(label)
      : this.roleBasedLocators.progressbar();
    
    return {
      bar,
      value: async () => {
        const ariaValue = await bar.getAttribute('aria-valuenow');
        const ariaText = await bar.getAttribute('aria-valuetext');
        return ariaText || ariaValue || '0';
      }
    };
  }

  // ============= Interactive Components =============

  /**
   * Locate slider/range components
   */
  slider(label: string): { 
    slider: Locator; 
    value: () => Promise<string>;
    setValue: (value: string) => Promise<void>;
  } {
    const sliderElement = this.roleBasedLocators.slider(label);
    
    return {
      slider: sliderElement,
      value: async () => {
        return await sliderElement.getAttribute('aria-valuenow') || '0';
      },
      setValue: async (value: string) => {
        await sliderElement.fill(value);
      }
    };
  }

  /**
   * Locate toggle/switch components
   */
  toggle(label: string): { 
    switch: Locator; 
    isOn: () => Promise<boolean>;
  } {
    const switchElement = this.roleBasedLocators.switch(label);
    
    return {
      switch: switchElement,
      isOn: async () => {
        const checked = await switchElement.getAttribute('aria-checked');
        return checked === 'true';
      }
    };
  }

  /**
   * Locate rating components
   */
  rating(label?: string): { 
    container: Locator; 
    stars: Locator;
    currentRating: () => Promise<number>;
  } {
    const container = label
      ? this.page.locator(`[aria-label*="${label}" i].rating, fieldset:has-text("${label}")`)
      : this.page.locator('.rating, [role="slider"][aria-label*="rating" i]');
    
    return {
      container,
      stars: container.locator('[role="radio"], .star'),
      currentRating: async () => {
        const selected = await container.locator('[aria-checked="true"], .selected').count();
        return selected;
      }
    };
  }

  // ============= Complex Patterns =============

  /**
   * Locate search interface components
   */
  searchInterface(): { 
    input: Locator; 
    submitButton: Locator;
    clearButton: Locator;
    results: Locator;
    resultCount: Locator;
    filters: Locator;
  } {
    return {
      input: this.roleBasedLocators.searchbox(),
      submitButton: this.roleBasedLocators.button('Search'),
      clearButton: this.page.locator('[aria-label*="clear" i]'),
      results: this.page.locator('[role="list"], .search-results'),
      resultCount: this.page.locator('[role="status"]:has-text("results"), .result-count'),
      filters: this.page.locator('.search-filters, [aria-label*="filter" i]')
    };
  }

  /**
   * Locate data grid with editing capabilities
   */
  editableGrid(gridLabel?: string): { 
    grid: Locator; 
    editableCell: (row: number, col: number) => Locator;
    saveButton: Locator;
    cancelButton: Locator;
  } {
    const grid = gridLabel
      ? this.roleBasedLocators.grid(gridLabel)
      : this.roleBasedLocators.grid();
    
    return {
      grid,
      editableCell: (row: number, col: number) => {
        return grid
          .locator('[role="row"]')
          .nth(row)
          .locator('[role="gridcell"]')
          .nth(col);
      },
      saveButton: this.page.locator('[aria-label*="save" i]'),
      cancelButton: this.page.locator('[aria-label*="cancel" i]')
    };
  }

  /**
   * Locate tree view components
   */
  treeView(label?: string): { 
    tree: Locator; 
    nodes: Locator;
    expandedNodes: Locator;
    selectedNodes: Locator;
    expandNode: (nodeName: string) => Promise<void>;
  } {
    const tree = label
      ? this.roleBasedLocators.tree(label)
      : this.roleBasedLocators.tree();
    
    return {
      tree,
      nodes: tree.locator('[role="treeitem"]'),
      expandedNodes: tree.locator('[role="treeitem"][aria-expanded="true"]'),
      selectedNodes: tree.locator('[role="treeitem"][aria-selected="true"]'),
      expandNode: async (nodeName: string) => {
        const node = tree.locator(`[role="treeitem"]:has-text("${nodeName}")`);
        const expandButton = node.locator('[aria-label*="expand" i]');
        if (await expandButton.isVisible()) {
          await expandButton.click();
        }
      }
    };
  }
}
/**
 * Authentication Helper
 * 
 * Handles authentication-related operations for E2E tests
 */

import { Page, expect } from '@playwright/test';
import { RoleBasedLocators } from './RoleBasedLocators';

export class AuthenticationHelper {
  private page: Page;
  private roleBasedLocators: RoleBasedLocators;

  constructor(page: Page) {
    this.page = page;
    this.roleBasedLocators = new RoleBasedLocators(page);
  }

  /**
   * Login to the application
   */
  async login(username?: string, password?: string): Promise<void> {
    const defaultUsername = username || process.env.TEST_USERNAME || 'test@example.com';
    const defaultPassword = password || process.env.TEST_PASSWORD || 'testpassword';

    // Navigate to login page if not already there
    const currentUrl = this.page.url();
    if (!currentUrl.includes('login') && !currentUrl.includes('auth')) {
      await this.page.goto('/login');
      await this.page.waitForLoadState('domcontentloaded');
    }

    // Fill in login form
    const usernameField = this.roleBasedLocators.textbox('Email').or(
      this.roleBasedLocators.textbox('Username').or(
        this.page.locator('input[type="email"], input[name="email"], input[name="username"]')
      )
    );
    await usernameField.fill(defaultUsername);

    const passwordField = this.roleBasedLocators.textbox('Password').or(
      this.page.locator('input[type="password"], input[name="password"]')
    );
    await passwordField.fill(defaultPassword);

    // Submit the form
    const loginButton = this.roleBasedLocators.button('Login').or(
      this.roleBasedLocators.button('Sign In').or(
        this.page.locator('button[type="submit"], input[type="submit"]')
      )
    );
    await loginButton.click();

    // Wait for successful login
    await this.page.waitForLoadState('networkidle');
    
    // Verify we're logged in by checking for dashboard or main app elements
    await expect(this.page.locator('nav, .sidebar, .dashboard, [data-testid="dashboard"]')).toBeVisible();
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    // Look for logout button/link
    const logoutButton = this.roleBasedLocators.button('Logout').or(
      this.roleBasedLocators.link('Logout').or(
        this.page.locator('a[href*="logout"], button[data-testid="logout"]')
      )
    );
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Check if user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check for elements that indicate logged-in state
      const loggedInIndicators = [
        this.page.locator('nav'),
        this.page.locator('.sidebar'),
        this.page.locator('.dashboard'),
        this.page.locator('[data-testid="dashboard"]'),
        this.page.locator('.user-menu'),
        this.page.locator('[data-testid="user-menu"]')
      ];

      for (const indicator of loggedInIndicators) {
        if (await indicator.isVisible()) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<{ username?: string; email?: string }> {
    try {
      // Look for user info in the UI
      const userMenu = this.page.locator('.user-menu, [data-testid="user-menu"], .profile-menu');
      if (await userMenu.isVisible()) {
        await userMenu.click();
        
        const usernameElement = userMenu.locator('.username, .user-name, [data-testid="username"]');
        const emailElement = userMenu.locator('.user-email, .email, [data-testid="email"]');
        
        const username = await usernameElement.textContent();
        const email = await emailElement.textContent();
        
        return { username, email };
      }
    } catch (error) {
      // If we can't get user info, return empty object
    }
    
    return {};
  }

  /**
   * Handle authentication errors
   */
  async handleAuthError(): Promise<void> {
    const errorMessage = this.page.locator('.error, .alert-error, [data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      throw new Error(`Authentication failed: ${errorText}`);
    }
  }
} 
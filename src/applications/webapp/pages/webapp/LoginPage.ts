/**
 * Login Page Object
 * 
 * Handles all interactions with the webapp login page
 * Implements fluent interface for chained operations
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { WebappBasePage } from './WebappBasePage';

export class LoginPage extends WebappBasePage {
  // Page elements using role-based locators
  public loginForm: Locator;
  public emailInput: Locator;
  public passwordInput: Locator;
  public loginButton: Locator;
  public rememberMeCheckbox: Locator;
  public forgotPasswordLink: Locator;
  public signUpLink: Locator;
  public errorMessage: Locator;
  public loadingSpinner: Locator;
  public socialLogins: {
    google?: Locator;
    github?: Locator;
    microsoft?: Locator;
  };

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.initializeElements();
  }

  private initializeElements(): void {
    this.loginForm = this.roleBasedLocators.form('Login');
    this.emailInput = this.roleBasedLocators.textboxByLabel('Email');
    this.passwordInput = this.roleBasedLocators.textboxByLabel('Password');
    this.loginButton = this.roleBasedLocators.button('Login');
    this.rememberMeCheckbox = this.roleBasedLocators.checkbox('Remember me');
    this.forgotPasswordLink = this.roleBasedLocators.link('Forgot password');
    this.signUpLink = this.roleBasedLocators.link('Sign up');
    this.errorMessage = this.roleBasedLocators.alert();
    this.loadingSpinner = this.roleBasedLocators.progressbar();
    
    // Social login buttons
    this.socialLogins = {
      google: this.roleBasedLocators.button('Continue with Google'),
      github: this.roleBasedLocators.button('Continue with GitHub'),
      microsoft: this.roleBasedLocators.button('Continue with Microsoft')
    };
  }

  async navigate(): Promise<void> {
    await this.navigateToWebapp('/login');
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await expect(this.loginForm).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  // ============= Fluent Interface Methods =============

  /**
   * Enter email address (fluent)
   */
  async withEmail(email: string): Promise<LoginPage> {
    await this.emailInput.fill(email);
    return this;
  }

  /**
   * Enter password (fluent)
   */
  async withPassword(password: string): Promise<LoginPage> {
    await this.passwordInput.fill(password);
    return this;
  }

  /**
   * Check remember me (fluent)
   */
  async withRememberMe(): Promise<LoginPage> {
    await this.rememberMeCheckbox.check();
    return this;
  }

  /**
   * Uncheck remember me (fluent)
   */
  async withoutRememberMe(): Promise<LoginPage> {
    await this.rememberMeCheckbox.uncheck();
    return this;
  }

  /**
   * Submit login form (fluent)
   */
  async submit(): Promise<LoginPage> {
    await this.loginButton.click();
    return this;
  }

  /**
   * Complete login flow with fluent interface
   * Example: await loginPage.withEmail('test@example.com').withPassword('pass123').withRememberMe().submit();
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.withEmail(email)
      .then(page => page.withPassword(password))
      .then(page => rememberMe ? page.withRememberMe() : page.withoutRememberMe())
      .then(page => page.submit());
    
    await this.waitForLoginComplete();
  }

  // ============= Standard Methods =============

  async enterCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async enterEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async checkRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.check();
  }

  async uncheckRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.uncheck();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async clickSignUp(): Promise<void> {
    await this.signUpLink.click();
  }

  // ============= Quick Login Methods =============

  async loginWithValidCredentials(): Promise<void> {
    await this.login('test@testoria.com', 'TestPass123!', false);
  }

  async loginWithInvalidCredentials(): Promise<void> {
    await this.login('invalid@example.com', 'wrongpassword', false);
    await this.waitForLoginError();
  }

  async loginAsAdmin(): Promise<void> {
    await this.login('admin@testoria.com', 'AdminPass123!', false);
  }

  // ============= Wait Methods =============

  async waitForLoginComplete(): Promise<void> {
    // Wait for either success or error
    await Promise.race([
      this.waitForSuccessfulLogin(),
      this.waitForLoginError()
    ]);
  }

  async waitForSuccessfulLogin(): Promise<void> {
    // Wait for redirect to dashboard or main app
    await expect(this.page).toHaveURL(/\/(dashboard|app)/, { timeout: 10000 });
    
    // Verify user is authenticated
    await expect(await this.isAuthenticated()).toBe(true);
  }

  async waitForLoginError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  async waitForLoadingToComplete(): Promise<void> {
    if (await this.loadingSpinner.isVisible()) {
      await expect(this.loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }
  }

  // ============= Validation Methods =============

  async getErrorMessage(): Promise<string> {
    await this.waitForLoginError();
    return await this.errorMessage.textContent() || '';
  }

  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async isRememberMeChecked(): Promise<boolean> {
    return await this.rememberMeCheckbox.isChecked();
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  async validateLoginForm(): Promise<void> {
    await expect(this.loginForm).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.rememberMeCheckbox).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  // ============= Form Validation Testing =============

  async verifyFormValidation(): Promise<void> {
    // Test empty form submission
    await this.clickLogin();
    await expect(this.hasError()).toBe(true);
    
    // Test invalid email format
    await this.enterEmail('invalid-email');
    await this.clickLogin();
    await expect(this.hasError()).toBe(true);
    
    // Test empty password
    await this.enterEmail('valid@email.com');
    await this.passwordInput.clear();
    await this.clickLogin();
    await expect(this.hasError()).toBe(true);
  }

  // ============= Social Login Methods =============

  async loginWithSocialProvider(provider: 'google' | 'github' | 'microsoft'): Promise<void> {
    const socialButton = this.socialLogins[provider];
    if (!socialButton) {
      throw new Error(`Social login provider ${provider} not available`);
    }
    
    await socialButton.click();
    
    // Wait for redirect to social provider
    await this.page.waitForURL(new RegExp(provider), { timeout: 10000 });
  }

  async hasSocialLogin(provider: 'google' | 'github' | 'microsoft'): Promise<boolean> {
    const socialButton = this.socialLogins[provider];
    return socialButton ? await socialButton.isVisible() : false;
  }

  // ============= Password Reset Flow =============

  async initiatePasswordReset(email: string): Promise<void> {
    await this.clickForgotPassword();
    
    // Wait for password reset page
    await expect(this.page).toHaveURL(/\/reset-password/);
    
    // Fill reset form
    const resetEmailInput = this.roleBasedLocators.textboxByLabel('Email');
    await resetEmailInput.fill(email);
    
    const resetButton = this.roleBasedLocators.button('Reset Password');
    await resetButton.click();
    
    // Wait for confirmation
    const confirmationMessage = this.roleBasedLocators.alert();
    await expect(confirmationMessage).toBeVisible();
    await expect(confirmationMessage).toContainText(/reset.*sent/i);
  }

  // ============= Utility Methods =============

  async clearForm(): Promise<void> {
    await this.emailInput.clear();
    await this.passwordInput.clear();
    if (await this.rememberMeCheckbox.isChecked()) {
      await this.uncheckRememberMe();
    }
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('/login');
  }

  async takeLoginScreenshot(name: string = 'login'): Promise<Buffer> {
    return await this.takeWebappScreenshot(name);
  }

  // ============= Page Object Validation =============

  async isLoaded(): Promise<boolean> {
    try {
      await this.validateLoginForm();
      return true;
    } catch {
      return false;
    }
  }

  async hasRequiredElements(): Promise<boolean> {
    const elements = [
      this.emailInput,
      this.passwordInput,
      this.loginButton,
      this.forgotPasswordLink
    ];
    
    for (const element of elements) {
      if (!await element.isVisible()) {
        return false;
      }
    }
    
    return true;
  }
}
/**
 * Configuration Exports
 * 
 * Central export point for all configuration utilities
 */

// Base configuration
export { BaseConfig } from './BaseConfig';
export type { ConfigSource, ValidationResult } from './BaseConfig';

// Application configurations
export { WebappConfig, getWebappConfig } from './WebappConfig';
export type { WebappConfigType } from './WebappConfig';

export { AdminConfig, getAdminConfig } from './AdminConfig';
export type { AdminConfigType } from './AdminConfig';

export { McpConfig, getMcpConfig } from './McpConfig';
export type { McpConfigType } from './McpConfig';

// Configuration manager
export { 
  ConfigManager, 
  ConfigPresets,
  getConfigManager 
} from './ConfigManager';

export type { 
  ApplicationType, 
  ConfigType,
  ConfigOverride,
  ConfigSnapshot 
} from './ConfigManager';

// Quick access helpers
export const config = {
  /**
   * Get webapp configuration
   */
  webapp: () => getConfigManager().getConfig('webapp'),
  
  /**
   * Get admin configuration
   */
  admin: () => getConfigManager().getConfig('admin'),
  
  /**
   * Get MCP configuration
   */
  mcp: () => getConfigManager().getConfig('mcp'),
  
  /**
   * Get configuration manager
   */
  manager: () => getConfigManager(),
  
  /**
   * Apply configuration preset
   */
  applyPreset: (preset: ConfigOverride[]) => {
    getConfigManager().overrideMultiple(preset);
  },
  
  /**
   * Quick environment switch
   */
  switchEnv: (env: string) => {
    getConfigManager().switchEnvironment(env);
  }
};
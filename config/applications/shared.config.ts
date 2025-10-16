/**
 * Shared Configuration
 * Common settings across all applications
 */

export interface SharedConfig {
  browser: {
    headless: boolean;
    slowMo: number;
    devtools: boolean;
  };
  screenshots: {
    mode: 'off' | 'only-on-failure' | 'on';
    quality: number;
  };
  video: {
    mode: 'off' | 'on' | 'retain-on-failure';
    size: { width: number; height: number };
  };
  trace: {
    mode: 'off' | 'on' | 'retain-on-failure';
  };
  parallel: {
    workers: number;
    fullyParallel: boolean;
  };
}

export const sharedConfig: SharedConfig = {
  browser: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: Number(process.env.SLOW_MO) || 0,
    devtools: false,
  },
  screenshots: {
    mode: 'only-on-failure',
    quality: 90,
  },
  video: {
    mode: 'retain-on-failure',
    size: { width: 1280, height: 720 },
  },
  trace: {
    mode: 'retain-on-failure',
  },
  parallel: {
    workers: process.env.CI ? 2 : 4,
    fullyParallel: true,
  },
};
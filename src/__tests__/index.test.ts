import {
  appUpgradeVersionCheck,
  AppUpgradeClient,
  PreferredAndroidMarket,
} from '../index';

import type {
  AppInfo,
  AlertInfo,
  VersionCheckResponse,
} from '../index';

// Mock the version-check module
jest.mock('../version-check', () => ({
  versionCheck: jest.fn(),
}));

// Need react-native mock for transitive import
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Alert: { alert: jest.fn() },
  Linking: { openURL: jest.fn() },
}));

describe('index exports', () => {
  it('should export appUpgradeVersionCheck as a function', () => {
    expect(typeof appUpgradeVersionCheck).toBe('function');
  });

  it('should export AppUpgradeClient as a class/function', () => {
    expect(typeof AppUpgradeClient).toBe('function');
  });

  it('should export PreferredAndroidMarket enum with expected values', () => {
    expect(PreferredAndroidMarket.GOOGLE).toBe('Google');
    expect(PreferredAndroidMarket.HUAWEI).toBe('Huawei');
    expect(PreferredAndroidMarket.AMAZON).toBe('Amazon');
    expect(PreferredAndroidMarket.OTHER).toBe('Other');
  });

  it('should have correct type definitions (compile-time check)', () => {
    // This test verifies that the TypeScript types are correctly exported
    // by using them — if types are wrong, compilation will fail
    const appInfo: AppInfo = {
      appId: 'com.test.app',
      appName: 'Test',
      appVersion: '1.0.0',
      platform: 'android',
      environment: 'production',
    };

    const alertInfo: AlertInfo = {
      title: 'Update',
      updateButtonTitle: 'Now',
    };

    const response: VersionCheckResponse = {
      found: true,
      forceUpgrade: false,
      message: 'test',
    };

    // Type assertions
    expect(appInfo).toBeDefined();
    expect(alertInfo).toBeDefined();
    expect(response).toBeDefined();
  });
});

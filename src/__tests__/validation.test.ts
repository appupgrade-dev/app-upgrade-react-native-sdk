import { validate } from '../validation';
import { AppInfo } from '../types';

describe('validate', () => {
  const validAppInfo: AppInfo = {
    appId: 'com.example.app',
    appName: 'Test App',
    appVersion: '1.0.0',
    platform: 'android',
    environment: 'production',
  };

  it('should return false when appInfo is undefined', () => {
    expect(validate(undefined)).toBe(false);
  });

  it('should return false when appInfo is null', () => {
    expect(validate(null)).toBe(false);
  });

  it('should return false when appId is empty', () => {
    const appInfo = { ...validAppInfo, appId: '' };
    expect(validate(appInfo)).toBe(false);
  });

  it('should return false when appName is empty', () => {
    const appInfo = { ...validAppInfo, appName: '' };
    expect(validate(appInfo)).toBe(false);
  });

  it('should return false when appVersion is empty', () => {
    const appInfo = { ...validAppInfo, appVersion: '' };
    expect(validate(appInfo)).toBe(false);
  });

  it('should return false when platform is empty', () => {
    const appInfo = { ...validAppInfo, platform: '' };
    expect(validate(appInfo)).toBe(false);
  });

  it('should return false when environment is empty', () => {
    const appInfo = { ...validAppInfo, environment: '' };
    expect(validate(appInfo)).toBe(false);
  });

  it('should return true for valid appInfo', () => {
    expect(validate(validAppInfo)).toBe(true);
  });
});

import { checkVersionAPI } from '../api';
import { AppInfo } from '../types';
import { AppUpgradeClient } from '../client';

describe('checkVersionAPI', () => {
  const validAppInfo: AppInfo = {
    appId: 'com.example.app',
    appName: 'Test App',
    appVersion: '1.0.0',
    platform: 'android',
    environment: 'production',
  };

  const mockGet = jest.fn();
  const mockClient = {
    getHttp: () => ({
      get: mockGet,
    }),
    isDebug: () => false,
  } as unknown as AppUpgradeClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return version data on successful 200 response', async () => {
    const mockResponse = {
      status: 200,
      data: { found: true, forceUpgrade: true, message: 'Please update' },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    const result = await checkVersionAPI(mockClient, validAppInfo);

    expect(result).toEqual({
      found: true,
      forceUpgrade: true,
      message: 'Please update',
    });
    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/versions/check',
      expect.objectContaining({
        params: expect.objectContaining({
          app_name: 'Test App',
          app_version: '1.0.0',
          platform: 'android',
          environment: 'production',
        }),
      }),
    );
  });

  it('should return undefined on non-200 response', async () => {
    const mockResponse = {
      status: 400,
      data: { found: false, forceUpgrade: false },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    const result = await checkVersionAPI(mockClient, validAppInfo);

    expect(result).toBeUndefined();
  });

  it('should return undefined and catch network errors', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network Error'));

    const result = await checkVersionAPI(mockClient, validAppInfo);

    expect(result).toBeUndefined();
  });

  it('should include appLanguage in params when provided', async () => {
    const appInfoWithLang: AppInfo = { ...validAppInfo, appLanguage: 'es' };
    const mockResponse = {
      status: 200,
      data: { found: false, forceUpgrade: false },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    await checkVersionAPI(mockClient, appInfoWithLang);

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/versions/check',
      expect.objectContaining({
        params: expect.objectContaining({
          app_language: 'es',
        }),
      }),
    );
  });

  it('should include customAttributes in params when provided', async () => {
    const appInfoWithAttrs: AppInfo = {
      ...validAppInfo,
      customAttributes: { deviceModel: 'Pixel 7', osVersion: '14' },
    };
    const mockResponse = {
      status: 200,
      data: { found: false, forceUpgrade: false },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    await checkVersionAPI(mockClient, appInfoWithAttrs);

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/versions/check',
      expect.objectContaining({
        params: expect.objectContaining({
          deviceModel: 'Pixel 7',
          osVersion: '14',
        }),
      }),
    );
  });

  it('should not allow customAttributes to override reserved params', async () => {
    const appInfoWithAttrs: AppInfo = {
      ...validAppInfo,
      customAttributes: {
        app_name: 'Override Name',
        app_version: '9.9.9',
        platform: 'ios',
        environment: 'development',
        app_language: 'fr',
        deviceModel: 'Pixel 7',
      },
    };
    const mockResponse = {
      status: 200,
      data: { found: false, forceUpgrade: false },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    await checkVersionAPI(mockClient, appInfoWithAttrs);

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/versions/check',
      expect.objectContaining({
        params: expect.objectContaining({
          app_name: 'Test App',
          app_version: '1.0.0',
          platform: 'android',
          environment: 'production',
          deviceModel: 'Pixel 7',
        }),
      }),
    );
  });

  it('should not include appLanguage in params when not provided', async () => {
    const mockResponse = {
      status: 200,
      data: { found: false, forceUpgrade: false },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    await checkVersionAPI(mockClient, validAppInfo);

    const callArgs = mockGet.mock.calls[0][1];
    expect(callArgs?.params).not.toHaveProperty('app_language');
  });
});

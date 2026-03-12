// Mock react-native modules before imports
const mockAlert = jest.fn();
const mockOpenURL = jest.fn().mockResolvedValue(true);
const mockAppStateAddEventListener = jest.fn();
let lastAppStateHandler: ((state: string) => Promise<void>) | null = null;

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Alert: {
    alert: (...args: any[]) => mockAlert(...args),
  },
  Linking: {
    openURL: (...args: any[]) => mockOpenURL(...args),
  },
  AppState: {
    addEventListener: (...args: any[]) => {
      lastAppStateHandler = args[1];
      return mockAppStateAddEventListener(...args);
    },
  },
}));

// Mock internal modules
jest.mock('../api', () => ({
  checkVersionAPI: jest.fn(),
}));

jest.mock('../validation', () => ({
  validate: jest.fn(),
}));

import { versionCheck, __resetForTests } from '../version-check';
import { checkVersionAPI } from '../api';
import { validate } from '../validation';
import { Platform, AppState } from 'react-native';
import { AppInfo, AlertInfo, PreferredAndroidMarket } from '../types';
import { AppUpgradeClient } from '../client';

const mockedValidate = validate as jest.MockedFunction<typeof validate>;
const mockedCheckVersion = checkVersionAPI as jest.MockedFunction<
  typeof checkVersionAPI
>;

describe('versionCheck', () => {
  const validAppInfo: AppInfo = {
    appId: 'com.example.app',
    appName: 'Test App',
    appVersion: '1.0.0',
    platform: 'android',
    environment: 'production',
  };

  const mockClient = {
    isDebug: () => false,
  } as AppUpgradeClient;

  const alertInfo: AlertInfo = {
    title: 'Update Available',
    updateButtonTitle: 'Update',
    laterButtonTitle: 'Later',
    onDismissCallback: jest.fn(),
    onLaterCallback: jest.fn(),
    onUpdateCallback: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    lastAppStateHandler = null;
    __resetForTests();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not call API when validation fails', async () => {
    mockedValidate.mockReturnValue(false);

    await versionCheck(mockClient, validAppInfo, alertInfo);

    expect(mockedValidate).toHaveBeenCalledWith(validAppInfo);
    expect(mockedCheckVersion).not.toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('should not show alert or throw when API returns undefined', async () => {
    mockedValidate.mockReturnValue(true);
    mockedCheckVersion.mockResolvedValue(undefined);

    await versionCheck(mockClient, validAppInfo, alertInfo);

    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('should not show alert when version is not found', async () => {
    mockedValidate.mockReturnValue(true);
    mockedCheckVersion.mockResolvedValue({
      found: false,
      forceUpgrade: false,
    });

    await versionCheck(mockClient, validAppInfo, alertInfo);

    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('should show force upgrade alert when forceUpgrade is true', async () => {
    mockedValidate.mockReturnValue(true);
    mockedCheckVersion.mockResolvedValue({
      found: true,
      forceUpgrade: true,
      message: 'Critical update required',
    });

    await versionCheck(mockClient, validAppInfo, alertInfo);

    expect(mockAlert).toHaveBeenCalledWith(
      'Update Available', // custom title from alertInfo
      'Critical update required',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Update' }),
      ]),
      expect.objectContaining({ cancelable: false }),
    );
  });

  it('should recheck on app resume for force upgrade', async () => {
    mockedValidate.mockReturnValue(true);
    mockedCheckVersion.mockResolvedValue({
      found: true,
      forceUpgrade: true,
      message: 'Critical update required',
    });

    await versionCheck(mockClient, validAppInfo, alertInfo);

    expect(mockAppStateAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
    expect(lastAppStateHandler).not.toBeNull();

    mockedCheckVersion.mockResolvedValueOnce({
      found: true,
      forceUpgrade: true,
      message: 'Still required',
    });

    await lastAppStateHandler?.('active');

    expect(mockAlert).toHaveBeenCalledTimes(2);
  });

  it('should call onUpdateCallback for force upgrade when Update is pressed', async () => {
    const onUpdateCallback = jest.fn();
    mockedValidate.mockReturnValue(true);
    mockedCheckVersion.mockResolvedValue({
      found: true,
      forceUpgrade: true,
      message: 'Critical update required',
    });

    await versionCheck(mockClient, validAppInfo, {
      onUpdateCallback,
    });

    const alertCall = mockAlert.mock.calls[0];
    const buttons = alertCall[2];
    const updateButton = buttons[0];
    updateButton.onPress();

    expect(onUpdateCallback).toHaveBeenCalledTimes(1);
  });

  it('should show upgrade (non-force) alert when forceUpgrade is false', async () => {
    mockedValidate.mockReturnValue(true);
    mockedCheckVersion.mockResolvedValue({
      found: true,
      forceUpgrade: false,
      message: 'New version available',
    });

    await versionCheck(mockClient, validAppInfo, alertInfo);

    expect(mockAlert).toHaveBeenCalledWith(
      'Update Available',
      'New version available',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Later' }),
        expect.objectContaining({ text: 'Update' }),
      ]),
      expect.objectContaining({ cancelable: true }),
    );
  });

  it('should use default alert titles when alertInfo is not provided', async () => {
    mockedValidate.mockReturnValue(true);
    mockedCheckVersion.mockResolvedValue({
      found: true,
      forceUpgrade: true,
      message: 'Update now',
    });

    await versionCheck(mockClient, validAppInfo);

    expect(mockAlert).toHaveBeenCalledWith(
      'Please update', // default title
      'Update now',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Update Now' }), // default button text
      ]),
      expect.objectContaining({ cancelable: false }),
    );
  });
});

describe('redirectToStore', () => {
  const baseAppInfo: AppInfo = {
    appId: 'com.example.app',
    appName: 'Test App',
    appVersion: '1.0.0',
    platform: 'android',
    environment: 'production',
  };

  const mockClient = {
    isDebug: () => false,
  } as AppUpgradeClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedValidate.mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Helper: trigger redirect by simulating force upgrade button press
  async function triggerUpdateButton(appInfo: AppInfo) {
    mockedCheckVersion.mockResolvedValue({
      found: true,
      forceUpgrade: true,
      message: 'Update',
    });

    await versionCheck(mockClient, appInfo, {
      title: 'Update',
      updateButtonTitle: 'Go',
    });

    // Get the onPress from the first button in the alert call
    const alertCall = mockAlert.mock.calls[0];
    const buttons = alertCall[2];
    const updateButton = buttons[0];
    updateButton.onPress();
  }

  it('should open Google Play Store by default (no preferredAndroidMarket)', async () => {
    (Platform as any).OS = 'android';
    await triggerUpdateButton(baseAppInfo);

    expect(mockOpenURL).toHaveBeenCalledWith(
      'https://play.google.com/store/apps/details?id=com.example.app',
    );
  });

  it('should open Google Play Store when preferredAndroidMarket is GOOGLE', async () => {
    (Platform as any).OS = 'android';
    const appInfo: AppInfo = {
      ...baseAppInfo,
      preferredAndroidMarket: PreferredAndroidMarket.GOOGLE,
    };

    await triggerUpdateButton(appInfo);

    expect(mockOpenURL).toHaveBeenCalledWith(
      'https://play.google.com/store/apps/details?id=com.example.app',
    );
  });

  it('should open Huawei AppGallery when preferredAndroidMarket is HUAWEI', async () => {
    (Platform as any).OS = 'android';
    const appInfo: AppInfo = {
      ...baseAppInfo,
      preferredAndroidMarket: PreferredAndroidMarket.HUAWEI,
    };

    await triggerUpdateButton(appInfo);

    expect(mockOpenURL).toHaveBeenCalledWith(
      'appmarket://details?id=com.example.app',
    );
  });

  it('should open Amazon Appstore when preferredAndroidMarket is AMAZON', async () => {
    (Platform as any).OS = 'android';
    const appInfo: AppInfo = {
      ...baseAppInfo,
      preferredAndroidMarket: PreferredAndroidMarket.AMAZON,
    };

    await triggerUpdateButton(appInfo);

    expect(mockOpenURL).toHaveBeenCalledWith(
      'https://www.amazon.com/gp/mas/dl/android?p=com.example.app',
    );
  });

  it('should open custom URL when preferredAndroidMarket is OTHER', async () => {
    (Platform as any).OS = 'android';
    const appInfo: AppInfo = {
      ...baseAppInfo,
      preferredAndroidMarket: PreferredAndroidMarket.OTHER,
      otherAndroidMarketUrl: 'https://custom-store.com/app/123',
    };

    await triggerUpdateButton(appInfo);

    expect(mockOpenURL).toHaveBeenCalledWith(
      'https://custom-store.com/app/123',
    );
  });

  it('should open Apple App Store on iOS', async () => {
    (Platform as any).OS = 'ios';
    const appInfo: AppInfo = {
      ...baseAppInfo,
      appId: '1549468967',
    };

    await triggerUpdateButton(appInfo);

    expect(mockOpenURL).toHaveBeenCalledWith(
      'https://apps.apple.com/app/id/1549468967',
    );
  });
});

describe('upgrade alert callbacks', () => {
  const validAppInfo: AppInfo = {
    appId: 'com.example.app',
    appName: 'Test App',
    appVersion: '1.0.0',
    platform: 'android',
    environment: 'production',
  };

  const mockClient = {
    isDebug: () => false,
  } as AppUpgradeClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedValidate.mockReturnValue(true);
    (Platform as any).OS = 'android';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call onLaterCallback when Later button is pressed', async () => {
    const onLaterCallback = jest.fn();
    mockedCheckVersion.mockResolvedValue({
      found: true,
      forceUpgrade: false,
      message: 'Update available',
    });

    await versionCheck(mockClient, validAppInfo, {
      onLaterCallback,
    });

    const alertCall = mockAlert.mock.calls[0];
    const buttons = alertCall[2];
    const laterButton = buttons[0]; // Later is first button
    laterButton.onPress();

    expect(onLaterCallback).toHaveBeenCalledTimes(1);
  });

  it('should call onUpdateCallback when Update button is pressed', async () => {
    const onUpdateCallback = jest.fn();
    mockedCheckVersion.mockResolvedValue({
      found: true,
      forceUpgrade: false,
      message: 'Update available',
    });

    await versionCheck(mockClient, validAppInfo, {
      onUpdateCallback,
    });

    const alertCall = mockAlert.mock.calls[0];
    const buttons = alertCall[2];
    const updateButton = buttons[1]; // Update is second button
    updateButton.onPress();

    expect(onUpdateCallback).toHaveBeenCalledTimes(1);
  });

  it('should call onDismissCallback when alert is dismissed', async () => {
    const onDismissCallback = jest.fn();
    mockedCheckVersion.mockResolvedValue({
      found: true,
      forceUpgrade: false,
      message: 'Update available',
    });

    await versionCheck(mockClient, validAppInfo, {
      onDismissCallback,
    });

    const alertCall = mockAlert.mock.calls[0];
    const options = alertCall[3]; // 4th arg is the options object
    options.onDismiss();

    expect(onDismissCallback).toHaveBeenCalledTimes(1);
  });
});

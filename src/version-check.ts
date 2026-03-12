import { AppUpgradeClient } from './client';
import { validate } from './validation';
import { checkVersionAPI } from './api';
import { Platform, Alert, Linking, AppState, AppStateStatus } from 'react-native';
import { AppInfo, AlertInfo, PreferredAndroidMarket } from './types';

type ForceUpgradeContext = {
  client: AppUpgradeClient;
  appInfo: AppInfo;
  alertInfo?: AlertInfo;
};

let forceUpgradeContext: ForceUpgradeContext | null = null;
let appStateListenerAttached = false;

function logDebug(client: AppUpgradeClient, message: string, data?: Record<string, unknown>): void {
  if (client.isDebug()) {
    console.log(`[AppUpgrade] ${message}`, data ?? {});
  }
}

export function __resetForTests(): void {
  forceUpgradeContext = null;
  appStateListenerAttached = false;
}

function ensureAppStateListener(): void {
  if (appStateListenerAttached) return;
  AppState.addEventListener('change', async (state: AppStateStatus) => {
    if (state === 'active' && forceUpgradeContext) {
      await versionCheck(
        forceUpgradeContext.client,
        forceUpgradeContext.appInfo,
        forceUpgradeContext.alertInfo,
      );
    }
  });
  appStateListenerAttached = true;
}

export async function versionCheck(
  client: AppUpgradeClient,
  appInfo: AppInfo,
  alertInfo?: AlertInfo,
): Promise<void> {
  if (!validate(appInfo)) {
    logDebug(client, 'Validation failed', { appInfo });
    return;
  }

  const version = await checkVersionAPI(client, appInfo);

  if (!version) {
    forceUpgradeContext = null;
    logDebug(client, 'No version response');
    return;
  }

  if (version.found) {
    const info: AlertInfo = alertInfo ?? {};

    if (version.forceUpgrade) {
      forceUpgradeContext = { client, appInfo, alertInfo: info };
      ensureAppStateListener();
      logDebug(client, 'Force upgrade required', { message: version.message });
      showForceUpgradeAlert(appInfo, info, version.message);
    } else {
      forceUpgradeContext = null;
      logDebug(client, 'Soft upgrade available', { message: version.message });
      showUpgradeAlert(appInfo, info, version.message);
    }
  } else {
    forceUpgradeContext = null;
    logDebug(client, 'No matching version found');
  }
}

function showForceUpgradeAlert(
  appInfo: AppInfo,
  alertInfo: AlertInfo,
  msg?: string,
): void {
  Alert.alert(
    alertInfo.title ?? 'Please update',
    msg,
    [
      {
        text: alertInfo.updateButtonTitle ?? 'Update Now',
        onPress: () => {
          alertInfo.onUpdateCallback?.();
          redirectToStore(appInfo);
        },
      },
    ],
    {
      cancelable: false,
    },
  );
}

function showUpgradeAlert(
  appInfo: AppInfo,
  alertInfo: AlertInfo,
  msg?: string,
): void {
  Alert.alert(
    alertInfo.title ?? 'Please update',
    msg,
    [
      {
        text: alertInfo.laterButtonTitle ?? 'Later',
        onPress: () => alertInfo.onLaterCallback?.(),
      },
      {
        text: alertInfo.updateButtonTitle ?? 'Update Now',
        onPress: () => {
          alertInfo.onUpdateCallback?.();
          redirectToStore(appInfo);
        },
      },
    ],
    {
      cancelable: true,
      onDismiss: () => alertInfo.onDismissCallback?.(),
    },
  );
}

function redirectToStore(appInfo: AppInfo): void {
  if (Platform.OS === 'android') {
    const googlePlayUrl = `https://play.google.com/store/apps/details?id=${appInfo.appId}`;

    switch (appInfo.preferredAndroidMarket) {
      case PreferredAndroidMarket.HUAWEI:
        openPreferredAndroidMarket(`appmarket://details?id=${appInfo.appId}`, googlePlayUrl);
        break;
      case PreferredAndroidMarket.AMAZON:
        openPreferredAndroidMarket(`https://www.amazon.com/gp/mas/dl/android?p=${appInfo.appId}`, googlePlayUrl);
        break;
      case PreferredAndroidMarket.OTHER:
        if (appInfo.otherAndroidMarketUrl) {
          openPreferredAndroidMarket(appInfo.otherAndroidMarketUrl, googlePlayUrl);
        } else {
          openPreferredAndroidMarket(googlePlayUrl);
        }
        break;
      case PreferredAndroidMarket.GOOGLE:
      default:
        openPreferredAndroidMarket(googlePlayUrl);
        break;
    }
  } else {
    Linking.openURL(`https://apps.apple.com/app/id/${appInfo.appId}`);
  }
}

function openPreferredAndroidMarket(url: string, defaultGooglePlaystoreUrl?: string): void {
  Linking.openURL(url).catch((err: Error) => {
    console.debug(
      'App Upgrade Error: Could not open the preferred android market. Defaulting to Google Playstore.',
      err.message,
    );
    if (defaultGooglePlaystoreUrl) {
      Linking.openURL(defaultGooglePlaystoreUrl);
    }
  });
}

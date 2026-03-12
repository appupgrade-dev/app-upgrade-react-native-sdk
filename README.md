# App Upgrade React Native SDK

[![npm version](https://img.shields.io/npm/v/app-upgrade-react-native-sdk.svg)](https://www.npmjs.com/package/app-upgrade-react-native-sdk)
[![license](https://img.shields.io/npm/l/app-upgrade-react-native-sdk.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

Official React Native / Expo SDK for [App Upgrade](https://appupgrade.dev) — a service to manage app version upgrades, force updates, and soft prompts across platforms.

For v1.x please refer to this [README](https://github.com/appupgrade-dev/app-upgrade-react-native-sdk/tree/v1.x).

## Features

- 🚀 **Force upgrade** — show a non-dismissable dialog that directs users to the app store
- 💡 **Soft upgrade** — show a dismissable prompt with "Update Now" and "Later" options
- 📱 **Cross-platform** — supports iOS, Android, and Expo
- 🏪 **Multi-store** — Apple App Store, Google Play, Amazon Appstore, Huawei AppGallery, and custom URLs
- 🔒 **TypeScript-first** — written in TypeScript with full type definitions

## Supported Stores

| Apple App Store | Google Play Store | Amazon Appstore | Huawei AppGallery | Custom URL |
|:---:|:---:|:---:|:---:|:---:|
| ✅ | ✅ | ✅ | ✅ | ✅ |

## Installation

```bash
npm install app-upgrade-react-native-sdk
```

```bash
# or with yarn
yarn add app-upgrade-react-native-sdk
```

```bash
# or with Expo
npx expo install app-upgrade-react-native-sdk
```

### Requirements

| Dependency | Minimum Version |
|------------|----------------|
| `react` | `>= 18.0.0` |
| `react-native` | `>= 0.72.0` |

## Quick Start

### 1. Get your API key

Register on [App Upgrade](https://appupgrade.dev), create a project, and copy your `x-api-key`.

### 2. Add the version check

```typescript
import { appUpgradeVersionCheck, AppUpgradeClient } from 'app-upgrade-react-native-sdk';
import type { AppInfo, AlertInfo } from 'app-upgrade-react-native-sdk';
import { Platform } from 'react-native';
import { useEffect, useMemo } from 'react';

const App = () => {
const client = useMemo(() => new AppUpgradeClient({
  apiKey: 'YOUR_API_KEY',
  debug: false, // Optional: enable console logs. Default: false
}), []);

  const appInfo: AppInfo = useMemo(() => ({
    appId: Platform.OS === 'ios' ? '1234567890' : 'com.example.myapp',
    // iOS: numeric App Store ID (not bundle ID)
    // Android: applicationId / package name
    appName: 'My App',
    appVersion: '1.0.0',
    platform: Platform.OS,            // 'android' | 'ios'
    environment: 'production',        // 'production' | 'development'
    appLanguage: 'en',                // Optional — for localized messages
  }), []);

  const alertConfig: AlertInfo = {    // Optional
    title: 'Update Available',
    updateButtonTitle: 'Update Now',
    laterButtonTitle: 'Later',
    onDismissCallback: () => console.log('Dismissed'),
    onLaterCallback: () => console.log('Later'),
    onUpdateCallback: () => console.log('Updating'),
  };

  useEffect(() => {
    appUpgradeVersionCheck(client, appInfo, alertConfig);
  }, [client, appInfo]);

  return (
    // your app JSX
  );
};
```

> **Tip:** Call the version check from `useEffect` (or when the app becomes active) so it runs once per session instead of every render.

## API Reference

### `AppUpgradeClient`

Initialize the client with your credentials before calling version check.

```typescript
const client = new AppUpgradeClient({
  apiKey: string;      // Your App Upgrade project key
  baseURL?: string;    // Override default API URL
  debug?: boolean;     // Enable SDK debug logs (default: false)
});
```

### `appUpgradeVersionCheck(client, appInfo, alertConfig?)`

Checks the app version with App Upgrade and shows an upgrade dialog when needed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client` | `AppUpgradeClient` | ✅ | The initialized API client |
| `appInfo` | `AppInfo` | ✅ | App metadata for the version check |
| `alertConfig` | `AlertInfo` | — | Customize the alert dialog |

### `AppInfo`

```typescript
interface AppInfo {
  appId: string;                                    // Store ID or package name
  appName: string;                                  // Display name
  appVersion: string;                               // Current version (e.g. "1.0.0")
  platform: string;                                 // "android" | "ios"
  environment: string;                              // "production" | "development"
  appLanguage?: string;                             // Locale code (e.g. "en", "es")
  preferredAndroidMarket?: PreferredAndroidMarket;  // Default: Google Play
  otherAndroidMarketUrl?: string;                   // Required when market is OTHER
  customAttributes?: Record<string, string>;        // Custom key-value pairs
}
```

### `AlertInfo`

```typescript
interface AlertInfo {
  title?: string;              // Dialog title (default: "Please update")
  updateButtonTitle?: string;  // Update button text (default: "Update Now")
  laterButtonTitle?: string;   // Later button text (default: "Later")
  onDismissCallback?: () => void;  // Non-force only
  onLaterCallback?: () => void;    // Non-force only
  onUpdateCallback?: () => void;   // Force + non-force
}
```

### `PreferredAndroidMarket`

```typescript
enum PreferredAndroidMarket {
  GOOGLE  = 'Google',   // Google Play Store (default)
  HUAWEI  = 'Huawei',   // Huawei AppGallery
  AMAZON  = 'Amazon',   // Amazon Appstore
  OTHER   = 'Other',    // Custom URL (requires otherAndroidMarketUrl)
}
```

## Advanced Usage

### Alternative Android Stores

```typescript
import { appUpgradeVersionCheck, PreferredAndroidMarket, AppUpgradeClient } from 'app-upgrade-react-native-sdk';
import type { AppInfo } from 'app-upgrade-react-native-sdk';

const client = new AppUpgradeClient({ apiKey: 'YOUR_API_KEY' });

const appInfo: AppInfo = {
  appId: 'com.example.myapp',
  appName: 'My App',
  appVersion: '1.0.0',
  platform: 'android',
  environment: 'production',
  preferredAndroidMarket: PreferredAndroidMarket.AMAZON,
};

appUpgradeVersionCheck(client, appInfo);
```

### Custom Store URL

```typescript
const appInfo: AppInfo = {
  appId: 'com.example.myapp',
  appName: 'My App',
  appVersion: '1.0.0',
  platform: 'android',
  environment: 'production',
  preferredAndroidMarket: PreferredAndroidMarket.OTHER,
  otherAndroidMarketUrl: 'https://my-custom-store.com/app/myapp',
};
```

> If the preferred marketplace fails to open, the SDK automatically falls back to the Google Play Store.

## Usage Notes

- `platform` and `appId` should match the current device platform. The SDK uses `platform` to talk to App Upgrade and `Platform.OS` to open the store.
- The iOS `appId` must be the numeric App Store ID. The Android `appId` must be the package name.
- `appUpgradeVersionCheck` is fire-and-forget. It triggers UI alerts and store redirects without returning a result to your app.
- For force upgrades, the SDK re-checks on app resume and will show the dialog again if the upgrade is still required.

## Callbacks

| Callback | Trigger | Use Case |
|----------|---------|----------|
| `onDismissCallback` | User taps outside the dialog (non-force only) | Analytics, custom logging |
| `onLaterCallback` | User taps "Later" (non-force only) | Schedule a reminder |
| `onUpdateCallback` | User taps "Update Now" | Analytics, cleanup tasks |

## Screenshots

### Android

**Force upgrade** — only the Update button is shown; the user cannot skip.
**Recommended upgrade** — both Update and Later buttons are shown.

![Android force upgrade](https://raw.githubusercontent.com/appupgrade-dev/app-upgrade-assets/main/images/forceupgrade_android.png)

### iOS

![iOS force upgrade](https://raw.githubusercontent.com/appupgrade-dev/app-upgrade-assets/main/images/forceupgrade_ios.jpg)

## Important Notes

1. The app must be **published** in the store for the redirect to work.
2. Store redirects may not work in **simulators** — test on a physical device.
3. Find a sample app here: [app-upgrade-react-native-demo-app](https://github.com/appupgrade-dev/app_upgrade_react_native_demo_app)
4. Read the integration guide: [How to force upgrade a React Native app](https://appupgrade.dev/blog/how-to-force-upgrade-react-native-app)

## Resources

- 📖 [Documentation](https://appupgrade.dev/docs/)
- ❓ [FAQ](https://appupgrade.dev/docs/app-upgrade-faq)
- 📝 [Changelog](CHANGELOG.md)
- 📧 Support: [support@appupgrade.dev](mailto:support@appupgrade.dev)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and [CODE OF CONDUCT](CODE_OF_CONDUCT.md) for details.

## License

[MIT](LICENSE) © [App Upgrade](https://appupgrade.dev)

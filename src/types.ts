/**
 * Enum for preferred Android market stores.
 */
export enum PreferredAndroidMarket {
  GOOGLE = 'Google',
  HUAWEI = 'Huawei',
  AMAZON = 'Amazon',
  OTHER = 'Other',
}

/**
 * App information required for version checking.
 */
export interface AppInfo {
  /** App ID in the store (e.g. package name for Android, numeric ID for iOS) */
  appId: string;
  /** Display name of the app */
  appName: string;
  /** Current version of the app (e.g. "1.0.0") */
  appVersion: string;
  /** Platform: "android" or "ios" */
  platform: string;
  /** Environment: "production", "development", etc. */
  environment: string;
  /** Optional app language code (e.g. "en", "es") */
  appLanguage?: string;
  /** Optional preferred Android market store */
  preferredAndroidMarket?: PreferredAndroidMarket;
  /** Required when preferredAndroidMarket is OTHER */
  otherAndroidMarketUrl?: string;
  /** Optional custom attributes to send with the version check */
  customAttributes?: Record<string, string>;
}

/**
 * Alert configuration for upgrade dialogs.
 */
export interface AlertInfo {
  /** Title of the alert dialog */
  title?: string;
  /** Text for the update button */
  updateButtonTitle?: string;
  /** Text for the later button (non-force upgrades only) */
  laterButtonTitle?: string;
  /** Called when the user dismisses the dialog */
  onDismissCallback?: () => void;
  /** Called when the user taps "Later" */
  onLaterCallback?: () => void;
  /** Called when the user taps "Update" */
  onUpdateCallback?: () => void;
}

/**
 * Response from the App Upgrade version check API.
 */
export interface VersionCheckResponse {
  /** Whether a matching version entry was found */
  found: boolean;
  /** Whether a force upgrade is required */
  forceUpgrade: boolean;
  /** Optional message to display to the user */
  message?: string;
}

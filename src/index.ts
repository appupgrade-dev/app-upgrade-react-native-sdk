import { AppUpgradeClient } from './client';
import { versionCheck } from './version-check';
import { PreferredAndroidMarket } from './types';

import type { AppInfo, AlertInfo, VersionCheckResponse } from './types';

export function appUpgradeVersionCheck(
  client: AppUpgradeClient,
  appInfo: AppInfo,
  alertInfo?: AlertInfo,
): void {
  versionCheck(client, appInfo, alertInfo);
}

export { AppUpgradeClient, PreferredAndroidMarket };

export type { AppInfo, AlertInfo, VersionCheckResponse };
import { AppInfo } from './types';

export function validate(appInfo?: AppInfo | null): boolean {
  if (!appInfo) return false;

  if (!appInfo.appId) return false;
  if (!appInfo.appName) return false;
  if (!appInfo.appVersion) return false;
  if (!appInfo.platform) return false;
  if (!appInfo.environment) return false;

  return true;
}
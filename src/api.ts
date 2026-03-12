import { AppUpgradeClient } from './client';
import { AppInfo, VersionCheckResponse } from './types';

export async function checkVersionAPI(
  client: AppUpgradeClient,
  appInfo: AppInfo,
): Promise<VersionCheckResponse | undefined> {
  try {
    const { appName, appVersion, platform, environment, appLanguage, customAttributes } =
      appInfo;

    const reservedKeys = new Set([
      'app_name',
      'app_version',
      'platform',
      'environment',
      'app_language',
    ]);

    const safeCustomAttributes: Record<string, string> = {};
    if (customAttributes) {
      for (const [key, value] of Object.entries(customAttributes)) {
        if (!reservedKeys.has(key)) {
          safeCustomAttributes[key] = value;
        }
      }
    }

    const params: Record<string, string> = {
      app_name: appName,
      app_version: appVersion,
      platform,
      environment,
      ...(appLanguage && { app_language: appLanguage }),
      ...safeCustomAttributes,
    };

    if (client.isDebug()) {
      console.log('[AppUpgrade] Version check request', {
        app_name: appName,
        app_version: appVersion,
        platform,
        environment,
        app_language: appLanguage,
        customAttributes: safeCustomAttributes,
      });
    }

    const response = await client.getHttp().get<VersionCheckResponse>(
      '/api/v1/versions/check',
      {
        params,
        validateStatus: (status) => status >= 200 && status < 500,
      },
    );

    if (client.isDebug()) {
      console.log('[AppUpgrade] Version check response', {
        status: response.status,
        data: response.data,
      });
    }

    if (response.status === 200) {
      return response.data;
    }

    return undefined;
  } catch {
    if (client.isDebug()) {
      console.log('[AppUpgrade] Version check failed');
    }
    return undefined;
  }
}

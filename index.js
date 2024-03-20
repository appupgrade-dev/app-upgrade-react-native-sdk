import { versionCheck } from "./src/version-check";

const PreferredAndroidMarket = {
  GOOGLE: 'Google',
  HUAWEI: 'Huawei',
  AMAZON: 'Amazon',
  OTHER: 'Other',
}

function appUpgradeVersionCheck(appInfo, xApiKey, alertInfo, baseUrl) {
  versionCheck(appInfo, xApiKey, alertInfo, baseUrl);
}

export { appUpgradeVersionCheck, PreferredAndroidMarket };

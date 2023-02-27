import { versionCheck } from "./src/version-check";

const PreferredAndroidMarket = {
  GOOGLE: 'Google',
  HUAWEI: 'Huawei',
  AMAZON: 'Amazon',
  OTHER: 'Other',
}

function appUpgradeVersionCheck(appInfo, xApiKey, alertInfo) {
  versionCheck(appInfo, xApiKey, alertInfo);
}

export { appUpgradeVersionCheck, PreferredAndroidMarket };

import { versionCheck } from "./src/version-check";

const PreferedAndroidMarket = {
  Google: 'Google',
  Huawei: 'Huawei',
  Amazon: 'Amazon',
  Other: 'Other',
}

function appUpgradeVersionCheck(appInfo, xApiKey, alertInfo) {
  versionCheck(appInfo, xApiKey, alertInfo);
}

export { appUpgradeVersionCheck, PreferedAndroidMarket };

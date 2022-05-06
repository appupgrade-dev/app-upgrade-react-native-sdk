import { versionCheck } from "./src/version-check";

function appUpgradeVersionCheck(appInfo, xApiKey, alertInfo) {
  versionCheck(appInfo, xApiKey, alertInfo);
}

export { appUpgradeVersionCheck };

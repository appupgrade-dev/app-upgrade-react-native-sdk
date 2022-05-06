import { validate } from "./validation";
import { checkVersionWithAppUpgrade } from "./api";
import { Alert, Linking } from "react-native";

async function versionCheck(appInfo, xApiKey, alertInfo) {
  const isValid = validate(appInfo, xApiKey);

  if (isValid) {
    const version = await checkVersionWithAppUpgrade(appInfo, xApiKey);
    if (!version) {
      console.error("App Upgrade Error: Version is null");
    } else if (version && version.found === true) {
      if (version.forceUpgrade === true) {
        console.info("App Upgrade: Version force upgrade is required.");
        // show force upgrade alert
        showForceUpgradeAlert(appInfo, alertInfo, version.message);
      } else {
        console.info(
          "App Upgrade: Version force upgrade is not required but upgrade is recommended."
        );
        // show upgrade alert
        showUpgradeAlert(appInfo, alertInfo, version.message);
      }
    } else {
      console.info(
        "App Upgrade: Version information not found. No action required."
      );
    }
  }
}

function showForceUpgradeAlert(appInfo, alertInfo, msg) {
  Alert.alert(
    alertInfo.title,
    msg,
    [
      {
        text: alertInfo.updateButtonTitle,
        onPress: () => redirectToStore(appInfo.appId),
      },
    ],
    {
      cancelable: false,
    }
  );
}

function showUpgradeAlert(appInfo, alertInfo, msg) {
  Alert.alert(
    alertInfo.title,
    msg,
    [
      {
        text: alertInfo.laterButtonTitle,
        onPress: () =>
          alertInfo.onLaterCallback ? alertInfo.onLaterCallback() : null,
      },
      {
        text: alertInfo.updateButtonTitle,
        onPress: () => redirectToStore(appInfo.appId),
      },
    ],
    {
      cancelable: true,
      onDismiss: () =>
        alertInfo.onDismissCallback ? alertInfo.onDismissCallback() : null,
    }
  );
}

function redirectToStore(appId) {
  Linking.openURL(`market://details?id=${appId}`);
}

export { versionCheck };
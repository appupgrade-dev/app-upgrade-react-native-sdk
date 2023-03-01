import { validate } from "./validation";
import { checkVersionWithAppUpgrade } from "./api";
import { Platform, Alert, Linking } from "react-native";
import { PreferredAndroidMarket } from "app-upgrade-react-native-sdk";

async function versionCheck(appInfo, xApiKey, alertInfo) {
  const isValid = validate(appInfo, xApiKey);

  if (isValid) {
    const version = await checkVersionWithAppUpgrade(appInfo, xApiKey);
    if (!version) {
      console.error("App Upgrade Error: Version is null.");
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
        onPress: () => {
          showForceUpgradeAlert(appInfo, alertInfo, msg)
          redirectToStore(appInfo)
        },
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
        onPress: () => redirectToStore(appInfo),
      },
    ],
    {
      cancelable: true,
      onDismiss: () =>
        alertInfo.onDismissCallback ? alertInfo.onDismissCallback() : null,
    }
  );
}

function redirectToStore(appInfo) {
  if (Platform.OS === 'android') {
    const defaultGooglePlaystoreUrl = `https://play.google.com/store/apps/details?id=${appInfo.appId}`;

    if (appInfo.preferredAndroidMarket === PreferredAndroidMarket.GOOGLE) {
      const url = `https://play.google.com/store/apps/details?id=${appInfo.appId}`
      openPreferredAndroidMarket(url, defaultGooglePlaystoreUrl);
    } else if (appInfo.preferredAndroidMarket === PreferredAndroidMarket.HUAWEI) {
      const url = `appmarket://details?id=${appInfo.appId}`;
      openPreferredAndroidMarket(url, defaultGooglePlaystoreUrl);
    } else if (appInfo.preferredAndroidMarket === PreferredAndroidMarket.AMAZON) {
      const url = `https://www.amazon.com/gp/mas/dl/android?p=${appInfo.appId}`;
      openPreferredAndroidMarket(url, defaultGooglePlaystoreUrl);
    } else if (appInfo.preferredAndroidMarket === PreferredAndroidMarket.OTHER) {
      Linking.openPreferredAndroidMarket(appInfo.otherAndroidMarketUrl);
    } else {
      Linking.openPreferredAndroidMarket(`https://play.google.com/store/apps/details?id=${appInfo.appId}`);
    }
  } else {
    Linking.openURL(`https://apps.apple.com/app/id/${appInfo.appId}`);
  }
}

function openPreferredAndroidMarket(url, defaultGooglePlaystoreUrl) {
  Linking.openURL(url).catch((err) => {
    console.debug("App Upgrade Error: Could not open the preferred android market. Defaulting to Google Playstore.", err.message);
    Linking.openURL(defaultGooglePlaystoreUrl);
  })
}

export { versionCheck };
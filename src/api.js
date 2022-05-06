import axios from "axios";

async function checkVersionWithAppUpgrade(appInfo, xApiKey) {
  try {
    const appUpgradeBaseUrl = "https://appupgrade.dev";
    const { appName, appVersion, platform, environment } = appInfo;

    const response = await axios.get(
      `${appUpgradeBaseUrl}/api/v1/versions/check?app_name=${appName}&app_version=${appVersion}&platform=${platform}&environment=${environment}`,
      {
        headers: {
          "x-api-key": xApiKey,
          "sdk": "react-native" //Telemetry purposes
        },
      }
    );

    if (response.status === 200) {
      console.info(
        "App Upgrade: Api Response: ",
        JSON.stringify(response.data)
      );
      return response.data;
    } else {
      console.info("App Upgrade:", response.data.message);
    }
  } catch (e) {
    console.error("App Upgrade Error:", e.message);
  }
}

export { checkVersionWithAppUpgrade };

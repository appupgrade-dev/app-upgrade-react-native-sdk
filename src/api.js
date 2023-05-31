import axios from "axios";
import axiosRetry from 'axios-retry';

async function checkVersionWithAppUpgrade(appInfo, xApiKey, appUpgradeBaseUrl) {
  try {
    const { appName, appVersion, platform, environment, appLanguage } = appInfo;

    axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay, retryCondition: () => true });

    const response = await axios.get(
      `${appUpgradeBaseUrl}/api/v1/versions/check`,
      {
        headers: {
          "x-api-key": xApiKey,
          "sdk": "react-native" //Telemetry purposes
        },
        params: {
          app_name: appName,
          app_version: appVersion,
          platform: platform,
          environment: environment,
          app_language: appLanguage,
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // default
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
      console.error("App Upgrade:", response.data.message);
    }
  } catch (e) {
    console.error("App Upgrade Error:", e.message);
  }
}

export { checkVersionWithAppUpgrade };

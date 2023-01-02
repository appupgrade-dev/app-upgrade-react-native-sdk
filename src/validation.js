function validate(appInfo, xApiKey) {
  if (!xApiKey || xApiKey === undefined || xApiKey === "") {
    console.error("App Upgrade Validation Error: xApiKey is required.");
    return false;
  } else if (appInfo === undefined || appInfo === "" || !appInfo) {
    console.error(
      "App Upgrade Validation Error: Please provide valid app info object."
    );
    return false;
  } else if (
    !appInfo.appId ||
    appInfo.appId === undefined ||
    appInfo.appId === ""
  ) {
    console.error("App Upgrade Validation Error: appId is required.");
    return false;
  } else if (
    !appInfo.appName ||
    appInfo.appName === undefined ||
    appInfo.appName === ""
  ) {
    console.error("App Upgrade Validation Error: appName is required.");
    return false;
  } else if (
    !appInfo.appName ||
    appInfo.appVersion === undefined ||
    appInfo.appVersion === ""
  ) {
    console.error("App Upgrade Validation Error: appVersion is required.");
    return false;
  } else if (
    !appInfo.platform ||
    appInfo.platform === undefined ||
    appInfo.platform === ""
  ) {
    console.error("App Upgrade Validation Error: platform is required.");
    return false;
  } else if (
    !appInfo.environment ||
    appInfo.environment === undefined ||
    appInfo.environment === ""
  ) {
    console.error("App Upgrade Validation Error: environment is required.");
    return false;
  } else {
    return true;
  }
}

export { validate };
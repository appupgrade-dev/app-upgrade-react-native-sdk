# App Upgrade: React-Native SDK

React-Native/Expo SDK for [App Upgrade](https://appupgrade.dev)

App Upgrade is a service let your users know when to upgrade your apps or force them to upgrade the app.

[![Twitter](https://img.shields.io/twitter/follow/app_upgrade?style=social)](https://twitter.com/app_upgrade)
[![YouTube](https://img.shields.io/youtube/channel/subscribers/UC0ZVJPYHFVuMwEsro4VZKXw?style=social)](https://www.youtube.com/channel/UC0ZVJPYHFVuMwEsro4VZKXw)

Many times we need to force upgrade mobile apps on users' mobile. Having faced this issue multiple times decided to find a better way to tackle this problem. After doing some research on how people are doing this there are so many custom solutions or checking with the play store or AppStore API if there is a new version available. Although this works if we just want to nudge users that there is a new version available. It doesn't solve the problem where we want to make a decision.. whether it's a soft graceful update or we want to force update. So here is this product that will make developers' life easy. We can set custom messages.. see the versions in beautify dashboard, and many exciting features in the roadmap ahead.

This SDK communicate with App Upgrade and check the version with store version information in App Upgrade. Based on response it will:
- If app needs force update will show a non-dismissable popup for update. On click it will launch app in app store for user to update.
- If app needs to be updated but not a force update, it will show a dismissable popup.
- If no action is required it won't do anything.

## Installation
Install via npm
```
npm i app-upgrade-react-native-sdk --save
```

Or if using Expo than you can use `expo install app-upgrade-react-native-sdk` as well.

## How to use it.
1. Register on App Upgrade and follow the instructions to create project and get the x-api-key.

2. Import the SDK and use it.
```
import {appUpgradeVersionCheck} from 'app-upgrade-react-native-sdk';

.....

const App: () => Node = () => {

  const xApiKey = "MDNmNmZkNDEtNmNkMi00NzY3LThjOWEtYWYxMGFjZWQ0ZjI2"; // Your project key
  const appInfo = {
    appId: 'com.android.com' or 'id1549468967', // Your app url in play store or app store
    appName: 'Wallpaper app', // Your app name
    appVersion: '1.0.0', // Your app version
    platform: 'android', // App Platform, android or ios
    environment: 'production', // App Environment, production, development
  };

  // Alert config is optional
  const alertConfig = {
    title: 'Please Update',
    updateButtonTitle: 'Update Now',
    laterButtonTitle: 'Later',
    onDismissCallback: () => { console.log('Dismiss') },
    onLaterCallback: () => { console.log('Later') }
  };

  appUpgradeVersionCheck(appInfo, xApiKey, alertConfig);

  return (
      <SafeAreaView style={backgroundStyle}>
        ...
      </SafeAreaView>
  );
};

```
### Note:
2. For opening the app store or play store the app should be live.
3. It might not be able to open the app store or play store in simulator. You can try it in physical device.
4. If you are using the same code base for both android and ios than you can detect the platform and provide the appId.

```
const appId = Platform.OS === 'android' ? 'com.android.chrome' : 'id310633997'
```

Expo Example:
```
import {appUpgradeVersionCheck} from 'app-upgrade-react-native-sdk';

.....

export default function App() {
  const xApiKey = "MDNmNmZkNDEtNmNkMi00NzY3LThjOWEtYWYxMGFjZWQ0ZjI2"; // Your project key
  const appInfo = {
    appId: 'com.android.com' or 'id1549468967', // Your app url in play store or app store
    appName: 'Wallpaper app', // Your app name
    appVersion: '1.0.0', // Your app version
    platform: 'android', // App Platform, android or ios
    environment: 'production', // App Environment, production, development
  };

  // Alert config is optional
  const alertConfig = {
    title: 'Please Update',
    updateButtonTitle: 'Update Now',
    laterButtonTitle: 'Later',
    onDismissCallback: () => { console.log('Dismiss') },
    onLaterCallback: () => { console.log('Later') }
  };

  appUpgradeVersionCheck(appInfo, xApiKey, alertConfig);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

```

## Example Screenshot
### Android
For force upgrade only Update button is enable and user cannot skip it.
For recommended upgrade Update and Later button is enable. User can skip it.

![image](https://raw.githubusercontent.com/appupgrade-dev/app-upgrade-react-native-sdk/main/screenshots/forceupgrade_android.png)

### iOS

![image](https://raw.githubusercontent.com/appupgrade-dev/app-upgrade-react-native-sdk/main/screenshots/forceupgrade_ios.jpg)


### Callbacks Documentations
SDK provides you two callbacks.
1. onDismissCallback
    onDismissCallback callback is called when the dismisses the popup, by clicking elsewhere on the screen. In the non-force upgrade, SDK will show a popup with the Later button and the Update Now button. If the user just clicks outside elsewhere the popup it will dismiss and SDK will call onDismissCallback.

2. onLaterCallback
    If the user clicks on the Later button the SDK will call the onLaterCallback. You can use these for tracking purposes or for something else. onLaterCallback can be used to set a timer and remind the user later that can be done from the app.

## App Upgrade Docs
For more information visit [App Upgrade](https://appupgrade.dev)

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

### Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and [CODE OF CONDUCT](CODE_OF_CONDUCT.md) for details.

### License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

### Happy Coding!!!

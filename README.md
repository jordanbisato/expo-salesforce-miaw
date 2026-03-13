# expo-salesforce-miaw

This module provides a native integration for the Salesforce Messaging In-App and Web (MIAW) SDK for React Native applications, with full support for Expo (SDK 53+). [Salesforce Messaging In-App and Web (MIAW)](https://developer.salesforce.com/docs/service/messaging-in-app/guide/overview.html)

It allows you to easily add Salesforce chat functionality to your app, leveraging native iOS and Android SDKs for the best performance and user experience.

(Features)
**Native Bridge**: Direct communication with native Salesforce MIAW SDKs.

**Expo Support**: Automatic configuration via Expo Config Plugin.

**Unified Interface**: Simple and consistent JavaScript API for both platforms.

**Session Management**: Control over the conversationId for chat persistence.

**Customization**: Support for hidden pre-chat fields.

### Installation

To install the module, run the following command in your React Native or Expo project:

```bash
yarn add @jordanbisato/expo-salesforce-miaw
```

### 1. Configuration

Add Plugin to `app.json`
Add the plugin to your app.json or app.config.js configuration. The plugin name is the same as the package name:

```json
{
  "expo": {
    "plugins": ["@jordanbisato/expo-salesforce-miaw"]
  }
}
```

The plugin will automatically configure the necessary permissions in `Info.plist` (iOS) and `build.gradle` settings (Android).

### EXCLUSIVE FOR EXPO SDK 53:

If you are using Expo SDK 53, you need to download the `/plugins/salesforce-miaw-sdk53.js` to your `/plugins` folder on project root folder.

You need it because Salesforce chat uses Kotlin Android Gradle Plugin version 2.2.10 or above, but SDK 53 uses 1.9.x.

After it, add this line to your `app.json` file:

```json
{
  "expo": {
    "plugins": "./plugins/salesforce-miaw-sdk53.js"
  }
}
```

### 2. App Rebuild

After installation and configuration, you need to rebuild your application for the native changes to be applied:

```bash
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

### 3. API List

## configure(config)

Configures the SDK manually. Returns a `Promise<boolean>`.

```javascript
import SalesForceMIAW from "@jordanbisato/expo-salesforce-miaw";

const config = {
  url: "YOUR_SALESFORCE_URL",
  orgId: "YOUR_ORG_ID",
  developerName: "YOUR_DEPLOYMENT_NAME",
  //Optional:
  conversationId: undefined, //send the GUID received on the last SalesForceMIAW.configure() to enter on the same conversation session.
  //Optional:
  preChatFields: {
    FirstName: "Test",
    LastName: "User",
  },
  //Optional:
  hiddenPreChatFields: {
    Segment: "VIP",
  },
};

const conversationID = SalesForceMIAW.configure(config);
if (conversationID) {
  console.log(
    "SalesForceMiaw configured with conversationID: ",
    conversationID,
  );
}
```

## openChat()

Opens the chat interface. Returns a `Promise<boolean>`.

```javascript
import SalesForceMIAW from "@jordanbisato/expo-salesforce-miaw";

SalesForceMIAW.openChat();
```

## closeChat()

Closes the chat interface. Returns a Promise<boolean>.

```javascript
import SalesForceMIAW from "@jordanbisato/expo-salesforce-miaw";

SalesForceMIAW.closeChat();
```

### 4. Error fix

## Kotlin version

```
Module was compiled with an incompatible version of Kotlin. The binary version of its metadata is 2.2.0, expected version is 2.0.0.
```

See the `1. Configuration` EXCLUSIVE FOR EXPO SDK 53 part.

## META-INF

```
3 files found with path 'META-INF/versions/9/OSGI-INF/MANIFEST.MF' from inputs
```

You need to download the `/plugins/salesforce-miaw-METAINF.js` to your `/plugins` folder on project root folder.

After it, add this line to your `app.json` file:

```json
{
  "expo": {
    "plugins": "./plugins/salesforce-miaw-METAINF.js"
  }
}

Licença (License)
MIT
```

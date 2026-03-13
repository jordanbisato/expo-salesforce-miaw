# expo-salesforce-miaw

This module provides a native integration for the Salesforce Messaging In-App and Web (MIAW) SDK for React Native applications, with full support for Expo (SDK 53+). [Salesforce Messaging In-App and Web (MIAW)](https://developer.salesforce.com/docs/service/messaging-in-app/guide/overview.html)

It allows you to easily add Salesforce chat functionality to your app, leveraging native iOS and Android SDKs for the best performance and user experience.

(Features)
**Native Bridge**: Direct communication with native Salesforce MIAW SDKs.

**Expo Support**: Automatic configuration via Expo Config Plugin.

**Unified Interface**: Simple and consistent JavaScript API for both platforms.

**Session Management**: Control over the conversationId for chat persistence.

**Customization**: Support for hidden pre-chat fields.

##Installation

To install the module, run the following command in your React Native or Expo project:

```bash
yarn add @jordanbisato/expo-salesforce-miaw
```

##Configuration

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

### 2. Add Salesforce Config File

Download the `config.json` file from your Salesforce admin dashboard and add it to your project.

**For iOS**: Add the file to your project in Xcode.

**For Android**: Place the file in the `android/app/src/main/assets` directory.

### 3. App Rebuild

After installation and configuration, you need to rebuild your application for the native changes to be applied:

```bash
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

## API

### configure(config)

Configures the SDK manually. Returns a `Promise<boolean>`.

```javascript
import SalesForceMIAW from "@/modules/expo-salesforce-miaw-local";

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

### openChat()

Opens the chat interface. Returns a `Promise<boolean>`.

```javascript
import SalesForceMIAW from "@/modules/expo-salesforce-miaw-local";

SalesForceMIAW.openChat();
```

### closeChat()

Closes the chat interface. Returns a Promise<boolean>.

```javascript
import SalesForceMIAW from "@/modules/expo-salesforce-miaw-local";

SalesForceMIAW.closeChat();
```

Licença (License)
MIT

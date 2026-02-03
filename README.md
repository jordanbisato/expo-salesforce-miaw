### STATUS:

iOS:
Methods: OK
Building OK
Set configuration SalesForce: OK
Open chat: OK
Sending message: ERROR

Android:
Methods: OK
Building: ERROR

If you have the knowledge to make this work, please make a PR! (:

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
npm install ./path/to/expo-salesforce-miaw
# or
yarn add ./path/to/expo-salesforce-miaw
```

##Configuration

Add Plugin to `app.json`
Add the plugin to your app.json or app.config.js configuration. The plugin name is the same as the package name:

```json
{
  "expo": {
    "plugins": ["expo-salesforce-miaw"]
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
import { configure } from "expo-salesforce-miaw";

const config = {
  url: "YOUR_SALESFORCE_URL",
  orgId: "YOUR_ORG_ID",
  developerName: "YOUR_DEPLOYMENT_NAME",
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

configure(config).then((success) => {
  if (success) {
    console.log("Salesforce MIAW configured successfully!");
  }
});
```

### configureFromFile(fileName)

Configures the SDK using the `config.json` file. Returns a `Promise<boolean>`.

```javascript
import { configureFromFile } from "expo-salesforce-miaw";

// The file must be 'config.json' in assets (Android) or in the bundle (iOS)
configureFromFile("config").then((success) => {
  if (success) {
    console.log("Salesforce MIAW configured successfully from file!");
  }
});
```

### openChat()

Opens the chat interface. Returns a `Promise<boolean>`.

```javascript
import { openChat } from "expo-salesforce-miaw";

openChat();
```

### closeChat()

Closes the chat interface. Returns a Promise<boolean>.

```javascript
import { closeChat } from "expo-salesforce-miaw";

closeChat();
```

### getConversationId()

Returns the current conversation ID. Returns a Promise<string | null>.

```javascript
import { getConversationId } from "expo-salesforce-miaw";

getConversationId().then((id) => {
  console.log("Current conversation ID:", id);
});
```

### setConversationId(newId)

Sets a new conversation ID. Returns a Promise<boolean>.

```javascript
import { setConversationId } from "expo-salesforce-miaw";

setConversationId("new-custom-conversation-id");
```

### clearConversationId()

Clears the current conversation ID and generates a new one. Returns a Promise<string> with the new ID.

```javascript
import { clearConversationId } from "expo-salesforce-miaw";

clearConversationId().then((newId) => {
  console.log("New conversation ID:", newId);
});
```

### setPreChatFields(fields)

Sets hidden pre-chat fields. Returns a Promise<boolean>.

```javascript
import { setPreChatFields } from "expo-salesforce-miaw";

const fields = {
  FirstName: "Test",
  LastName: "User",
  Email: "test.user@example.com",
};

setPreChatFields(fields);
```

### setHiddenPreChatFields(fields)

Sets hidden pre-chat fields. Returns a Promise<boolean>.

```javascript
import { setHiddenPreChatFields } from "expo-salesforce-miaw";

const fields = {
  FirstName: "Test",
  LastName: "User",
  Email: "test.user@example.com",
};

setHiddenPreChatFields(fields);
```

### registerPushToken(token)

Registers the push notification token. Returns a Promise<boolean>.

```javascript
import { registerPushToken } from "expo-salesforce-miaw";

// Obtain the token from the notification service (e.g., Expo Notifications)
const token = "your-push-notification-token";
registerPushToken(token);
```

```bash
cd example
npm install
npm start
```

Licença (License)
MIT

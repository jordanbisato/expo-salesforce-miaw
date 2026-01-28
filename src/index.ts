import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR = 
  `The package 'expo-salesforce-miaw' doesn\'t seem to be linked. Make sure: \n\n` + 
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) + 
  '- You rebuilt the app after installing the package\n' + 
  '- You are not using Expo Go\n';

const ExpoSalesforceMIAW = NativeModules.ExpoSalesforceMIAW 
  ? NativeModules.ExpoSalesforceMIAW 
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface SalesforceMIAWConfig {
  url: string;
  orgId: string;
  developerName: string;
  conversationId?: string;
}

export function configure(config: SalesforceMIAWConfig): Promise<boolean> {
  return ExpoSalesforceMIAW.configure(config);
}

export function configureFromFile(fileName: string): Promise<boolean> {
  return ExpoSalesforceMIAW.configureFromFile(fileName);
}

export function openChat(): Promise<boolean> {
  return ExpoSalesforceMIAW.openChat();
}

export function closeChat(): Promise<boolean> {
  return ExpoSalesforceMIAW.closeChat();
}

export function getConversationId(): Promise<string | null> {
  return ExpoSalesforceMIAW.getConversationId();
}

export function setConversationId(newId: string): Promise<boolean> {
  return ExpoSalesforceMIAW.setConversationId(newId);
}

export function clearConversationId(): Promise<string> {
  return ExpoSalesforceMIAW.clearConversationId();
}

export function setHiddenPreChatFields(fields: Record<string, string>): Promise<boolean> {
  return ExpoSalesforceMIAW.setHiddenPreChatFields(fields);
}

export function registerPushToken(token: string): Promise<boolean> {
  return ExpoSalesforceMIAW.registerPushToken(token);
}

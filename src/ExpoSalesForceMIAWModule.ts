import { NativeModule, requireNativeModule } from "expo";

import {
  ExpoSalesForceMIAWModuleEvents,
  SalesForceMIAWConfig,
} from "./ExpoSalesForceMIAW.types";

declare class ExpoSalesForceMIAWModule extends NativeModule<ExpoSalesForceMIAWModuleEvents> {
  openChat(): void;
  configure(config: SalesForceMIAWConfig): Promise<boolean>;
  closeChat(): void;
  setPreChatFields(fields: Record<string, string>): Promise<boolean>;
  setHiddenPreChatFields(fields: Record<string, string>): Promise<boolean>;
  registerPushToken(token: string): Promise<boolean>;
  getConversationId(): Promise<string | null>;
  clearConversationId(): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoSalesForceMIAWModule>(
  "ExpoSalesForceMIAW",
);

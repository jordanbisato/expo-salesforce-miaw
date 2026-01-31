import { NativeModule } from "expo";
import { ExpoSalesForceMIAWModuleEvents, SalesForceMIAWConfig } from "./ExpoSalesForceMIAW.types";
declare class ExpoSalesForceMIAWModule extends NativeModule<ExpoSalesForceMIAWModuleEvents> {
    openChat(): void;
    configure(config: SalesForceMIAWConfig): Promise<boolean>;
    closeChat(): void;
    setHiddenPreChatFields(fields: Record<string, string>): Promise<boolean>;
    registerPushToken(token: string): Promise<boolean>;
    getConversationId(): Promise<string | null>;
    clearConversationId(): Promise<string>;
}
declare const _default: ExpoSalesForceMIAWModule;
export default _default;
//# sourceMappingURL=ExpoSalesForceMIAWModule.d.ts.map
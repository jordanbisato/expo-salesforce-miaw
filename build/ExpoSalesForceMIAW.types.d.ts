import type { StyleProp, ViewStyle } from "react-native";
export type OnLoadEventPayload = {
    url: string;
};
export type ExpoSalesForceMIAWViewProps = {
    url: string;
    onLoad: (event: {
        nativeEvent: OnLoadEventPayload;
    }) => void;
    style?: StyleProp<ViewStyle>;
};
export interface SalesForceMIAWConfig {
    url: string;
    orgId: string;
    developerName: string;
    conversationId?: string;
    preChatFields?: Record<string, string>;
    hiddenPreChatFields?: Record<string, string>;
}
export type ExpoSalesForceMIAWModuleEvents = {
    openChat(): void;
    configure(config: SalesForceMIAWConfig): Promise<boolean>;
    closeChat(): void;
    setPreChatFields(fields: Record<string, string>): Promise<boolean>;
    setHiddenPreChatFields(fields: Record<string, string>): Promise<boolean>;
    registerPushToken(token: string): Promise<boolean>;
    getConversationId(): Promise<string | null>;
    clearConversationId(): Promise<string>;
};
//# sourceMappingURL=ExpoSalesForceMIAW.types.d.ts.map
// Reexport the native module. On web, it will be resolved to ExpoSalesForceMIAWModule.web.ts
// and on native platforms to ExpoSalesForceMIAWModule.ts
export { default } from "./ExpoSalesForceMIAWModule";
export * from "./ExpoSalesForceMIAW.types";
// import { SalesForceMIAWConfig } from "./ExpoSalesForceMIAW.types";
// // Importamos o módulo já instanciado via requireNativeModule
// import ExpoSalesForceMIAW from "./ExpoSalesForceMIAWModule";
// export function configure(config: SalesForceMIAWConfig): Promise<boolean> {
//   return ExpoSalesForceMIAW.configure(config);
// }
// export function configureFromFile(fileName: string): Promise<boolean> {
//   return ExpoSalesForceMIAW.configureFromFile(fileName);
// }
// export function openChat(): void {
//   return ExpoSalesForceMIAW.openChat();
// }
// export function closeChat(): void {
//   // Ajustado para bater com o nome da função no Swift (closeChat)
//   return ExpoSalesForceMIAW.closeChat();
// }
// export function getConversationId(): Promise<string | null> {
//   return ExpoSalesForceMIAW.getConversationId();
// }
// export function setConversationId(newId: string): Promise<boolean> {
//   return ExpoSalesForceMIAW.setConversationId(newId);
// }
// export function clearConversationId(): Promise<string> {
//   return ExpoSalesForceMIAW.clearConversationId();
// }
// export function setHiddenPreChatFields(
//   fields: Record<string, string>,
// ): Promise<boolean> {
//   return ExpoSalesForceMIAW.setHiddenPreChatFields(fields);
// }
// export function registerPushToken(token: string): Promise<boolean> {
//   return ExpoSalesForceMIAW.registerPushToken(token);
// }
//# sourceMappingURL=index.js.map
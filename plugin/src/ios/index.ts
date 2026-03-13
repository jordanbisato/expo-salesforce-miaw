import { ConfigPlugin, withInfoPlist } from "expo/config-plugins";

export const withSalesforceMIAWiOS: ConfigPlugin = (config) => {
  config = withConfigureInfoPlist(config);
  return config;
};

const withConfigureInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    // Adiciona descrições de privacidade se não existirem
    infoPlist.NSCameraUsageDescription =
      infoPlist.NSCameraUsageDescription ||
      "This application needs camera access to send pictures in chat.";

    infoPlist.NSPhotoLibraryUsageDescription =
      infoPlist.NSPhotoLibraryUsageDescription ||
      "This application needs photo library access to send pictures in chat.";

    // Configurações para download de transcrição e anexos
    infoPlist.LSSupportsOpeningDocumentsInPlace = true;
    infoPlist.UIFileSharingEnabled = true;

    return config;
  });
};

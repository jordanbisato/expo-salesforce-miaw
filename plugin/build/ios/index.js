"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSalesforceMIAWiOS = void 0;
const config_plugins_1 = require("expo/config-plugins");
const withSalesforceMIAWiOS = (config) => {
    config = withConfigureInfoPlist(config);
    return config;
};
exports.withSalesforceMIAWiOS = withSalesforceMIAWiOS;
const withConfigureInfoPlist = (config) => {
    return (0, config_plugins_1.withInfoPlist)(config, (config) => {
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

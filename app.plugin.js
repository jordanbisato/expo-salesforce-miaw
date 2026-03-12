const {
  withInfoPlist,
  withAppBuildGradle,
  withProjectBuildGradle,
  createRunOncePlugin,
} = require('@expo/config-plugins');

/**
 * Configurações para a plataforma iOS usando CocoaPods (Podfile)
 */
const withSalesforceMIAWiOS = (config, props) => {
  // 1. Adiciona descrições de privacidade no Info.plist
  config = withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    infoPlist.NSCameraUsageDescription =
      infoPlist.NSCameraUsageDescription ||
      'This application needs camera access to send pictures in chat.';

    infoPlist.NSPhotoLibraryUsageDescription =
      infoPlist.NSPhotoLibraryUsageDescription ||
      'This application needs photo library access to send pictures in chat.';

    infoPlist.LSSupportsOpeningDocumentsInPlace = true;
    infoPlist.UIFileSharingEnabled = true;

    return config;
  });

  return config;
};

/**
 * Configurações para a plataforma Android
 */
const withSalesforceMIAWAndroid = (config, props) => {
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    const salesforceRepos = `
        maven { url "https://s3.amazonaws.com/inapp.salesforce.com/public/android" }`;
    if (!contents.includes('inapp.salesforce.com')) {
      console.log('📦 Adicionando repositórios Maven da Salesforce após os repositórios padrão...');

      // Tenta encontrar o final do bloco de repositórios em allprojects
      // Procuramos por jitpack ou mavenCentral como âncoras comuns de fim de lista
      const jitpackRegex = /maven\s*{\s*url\s*['"]https:\/\/www\.jitpack\.io['"]\s*}/;
      const mavenCentralRegex = /mavenCentral\(\)/;

      if (contents.match(jitpackRegex)) {
        contents = contents.replace(jitpackRegex, (match) => `${match}${salesforceRepos}`);
      } else if (contents.match(mavenCentralRegex)) {
        // Se não achar jitpack, tenta depois do mavenCentral
        contents = contents.replace(mavenCentralRegex, (match) => `${match}${salesforceRepos}`);
      } else {
        // Fallback: se não achar as âncoras, adiciona no início como antes para não quebrar o build
        contents = contents.replace(
          /allprojects\s*{\s*repositories\s*{/,
          `allprojects {\n    repositories {${salesforceRepos}`,
        );
      }

    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    if (!buildGradle.includes('dataBinding')) {
      config.modResults.contents = buildGradle.replace(
        /android\s*{/,
        `android {
    buildFeatures {
        dataBinding true
    }`
      );
    }

    return config;
  });

  return config;
};

const withSalesforceMIAW = (config, props = {}) => {
  config = withSalesforceMIAWiOS(config, props);
  config = withSalesforceMIAWAndroid(config, props);
  return config;
};

module.exports = createRunOncePlugin(
  withSalesforceMIAW,
  'expo-salesforce-miaw',
  '1.3.2'
);

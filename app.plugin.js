const {
  withInfoPlist,
  withAppBuildGradle,
  withProjectBuildGradle,
  withDangerousMod,
  createRunOncePlugin,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

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

  // 2. Modificações no Podfile: Fontes de Specs e Dependência Nativa
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');

      if (!fs.existsSync(podfilePath)) {
        return config;
      }

      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Fontes otimizadas: Usamos a CDN do CocoaPods em vez do repositório Git padrão
      // A CDN é muito mais rápida e evita o travamento em "Installing CocoaPods"
      const sfSource = "source 'https://github.com/salesforce/service-sdk-ios-specs.git'";
      const cocoapodsCDN = "source 'https://cdn.cocoapods.org/'";

      // Adiciona as fontes no topo do arquivo se não existirem
      if (!podfileContent.includes('service-sdk-ios-specs.git')) {
        // Removemos qualquer referência a fontes Git antigas do CocoaPods se existirem para forçar CDN
        podfileContent = podfileContent.replace("source 'https://github.com/CocoaPods/Specs.git'", "");

        // Injetamos a fonte do Salesforce e a CDN do CocoaPods no topo
        if (!podfileContent.includes('source ')) {
          podfileContent = `${sfSource}\n${cocoapodsCDN}\n\n${podfileContent}`;
        } else {
          podfileContent = `${sfSource}\n${podfileContent}`;
        }
      }

      // Configuração da dependência do SDK
      const podName = 'Messaging-InApp-UI';
      const podVersion = props.iosVersion ? `, '~> ${props.iosVersion}'` : '';
      const podLine = `  pod '${podName}'${podVersion}`;

      // Injeta o pod se ele ainda não estiver presente
      if (!podfileContent.includes(podName)) {
        const searchString = 'use_expo_modules!';
        if (podfileContent.includes(searchString)) {
          podfileContent = podfileContent.replace(
            searchString,
            `${searchString}\n${podLine}`
          );
        } else {
          const lastEndIndex = podfileContent.lastIndexOf('end');
          if (lastEndIndex !== -1) {
            podfileContent =
              podfileContent.slice(0, lastEndIndex) +
              `${podLine}\n` +
              podfileContent.slice(lastEndIndex);
          }
        }
      }

      fs.writeFileSync(podfilePath, podfileContent);
      return config;
    },
  ]);

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
  // config = withSalesforceMIAWiOS(config, props);
  config = withSalesforceMIAWAndroid(config, props);
  return config;
};

module.exports = createRunOncePlugin(
  withSalesforceMIAW,
  'expo-salesforce-miaw',
  '1.3.2'
);

import { ConfigPlugin, ExportedConfig } from "expo/config-plugins";

const {
  withAppBuildGradle,
  withProjectBuildGradle,
} = require("@expo/config-plugins");

interface GradleModResults {
  language: string;
  contents: string;
}

interface GradleConfig extends ExportedConfig {
  modResults: GradleModResults;
}

export const withSalesforceMIAWAndroid: ConfigPlugin = (
  config: ExportedConfig,
) => {
  config = withConfigureGradle(config);
  return config;
};

const withConfigureGradle: ConfigPlugin = (
  config: ExportedConfig,
): ExportedConfig => {
  config = withAppBuildGradle(
    config,
    async (config: GradleConfig): Promise<GradleConfig> => {
      let contents: string = config.modResults.contents;

      if (!contents.includes("dataBinding")) {
        console.log("📦 [expo-salesforce-miaw] Habilitando dataBinding...");

        // Verifica se já existe buildFeatures
        if (contents.includes("buildFeatures")) {
          contents = contents.replace(
            /buildFeatures\s*{/,
            "buildFeatures {\n        dataBinding true",
          );
        } else {
          contents = contents.replace(
            /android\s*{/,
            "android {\n    buildFeatures {\n        dataBinding true\n    }",
          );
        }
      }

      config.modResults.contents = contents;
      return config;
    },
  );

  return withProjectBuildGradle(
    config,
    async (config: GradleConfig): Promise<GradleConfig> => {
      let contents: string = config.modResults.contents;

      const salesforceRepos = `
        maven { url "https://s3.amazonaws.com/inapp.salesforce.com/public/android" }`;

      if (!contents.includes("inapp.salesforce.com")) {
        // Âncoras para garantir que fiquem depois dos repositórios padrão (melhora performance de build)
        const jitpackRegex =
          /maven\s*{\s*url\s*['"]https:\/\/www\.jitpack\.io['"]\s*}/;
        const mavenCentralRegex = /mavenCentral\(\)/;

        if (contents.match(jitpackRegex)) {
          contents = contents.replace(
            jitpackRegex,
            (match: string) => `${match}${salesforceRepos}`,
          );
        } else if (contents.match(mavenCentralRegex)) {
          contents = contents.replace(
            mavenCentralRegex,
            (match: string) => `${match}${salesforceRepos}`,
          );
        } else {
          // Fallback
          contents = contents.replace(
            /allprojects\s*{\s*repositories\s*{/,
            `allprojects {\n    repositories {${salesforceRepos}`,
          );
        }
      }
      config.modResults.contents = contents;
      return config;
    },
  );
};

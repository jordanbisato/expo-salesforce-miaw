"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSalesforceMIAWAndroid = void 0;
const { withAppBuildGradle, withProjectBuildGradle, } = require("@expo/config-plugins");
const withSalesforceMIAWAndroid = (config) => {
    config = withConfigureGradle(config);
    return config;
};
exports.withSalesforceMIAWAndroid = withSalesforceMIAWAndroid;
const withConfigureGradle = (config) => {
    config = withAppBuildGradle(config, async (config) => {
        let contents = config.modResults.contents;
        if (!contents.includes("dataBinding")) {
            console.log("📦 [expo-salesforce-miaw] Habilitando dataBinding...");
            // Verifica se já existe buildFeatures
            if (contents.includes("buildFeatures")) {
                contents = contents.replace(/buildFeatures\s*{/, "buildFeatures {\n        dataBinding true");
            }
            else {
                contents = contents.replace(/android\s*{/, "android {\n    buildFeatures {\n        dataBinding true\n    }");
            }
        }
        config.modResults.contents = contents;
        return config;
    });
    return withProjectBuildGradle(config, async (config) => {
        let contents = config.modResults.contents;
        const salesforceRepos = `
        maven { url "https://s3.amazonaws.com/inapp.salesforce.com/public/android" }`;
        if (!contents.includes("inapp.salesforce.com")) {
            // Âncoras para garantir que fiquem depois dos repositórios padrão (melhora performance de build)
            const jitpackRegex = /maven\s*{\s*url\s*['"]https:\/\/www\.jitpack\.io['"]\s*}/;
            const mavenCentralRegex = /mavenCentral\(\)/;
            if (contents.match(jitpackRegex)) {
                contents = contents.replace(jitpackRegex, (match) => `${match}${salesforceRepos}`);
            }
            else if (contents.match(mavenCentralRegex)) {
                contents = contents.replace(mavenCentralRegex, (match) => `${match}${salesforceRepos}`);
            }
            else {
                // Fallback
                contents = contents.replace(/allprojects\s*{\s*repositories\s*{/, `allprojects {\n    repositories {${salesforceRepos}`);
            }
        }
        config.modResults.contents = contents;
        return config;
    });
};

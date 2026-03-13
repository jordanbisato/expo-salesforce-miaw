/**
 *
 * app.json:
 * {
 *   "plugins": [
 *     "./plugins/salesforce-miaw-METAINF.js"
 *   ]
 * }
 */

const {
  withAppBuildGradle,
  createRunOncePlugin,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// ========================================
// 1. App Build Gradle (android/app/build.gradle)
// ========================================

function withAndroidAppBuildGradle(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // 2.4 Add packagingOptions //When you get META-INF errors on Android build
    if (!contents.includes('META-INF/versions/9/OSGI-INF/MANIFEST.MF')) {
      contents = contents.replace(/android\s*{[\s\S]*?}/m, (match) => {
        if (match.includes('packagingOptions')) {
          return match.replace(
            /packagingOptions\s*{([\s\S]*?)}/m,
            `packagingOptions {
              resources {
                excludes += ["META-INF/versions/9/OSGI-INF/MANIFEST.MF"]
              }
            }`,
          );
        }
        return match.replace(
          /android\s*{/,
          `android {
            packagingOptions {
              resources {
                excludes += ["META-INF/versions/9/OSGI-INF/MANIFEST.MF"]
              }
            }`,
        );
      });
    }

    config.modResults.contents = contents;
    return config;
  });
}

function withSalesforceAndroid(config) {
  config = withAndroidAppBuildGradle(config);
  return config;
}

// Exportar como run-once plugin
module.exports = createRunOncePlugin(
  withSalesforceAndroid,
  'salesforce-miaw-METAINF',
  '1.0.0',
);

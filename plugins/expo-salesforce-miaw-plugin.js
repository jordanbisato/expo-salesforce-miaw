/**
 *
 * app.json:
 * {
 *   "plugins": [
 *     "./plugins/expo-salesforce-miaw-plugin.js"
 *   ]
 * }
 */

const {
  withProjectBuildGradle,
  withAppBuildGradle,
  withGradleProperties,
  createRunOncePlugin,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// ========================================
// 1. Project Build Gradle (android/build.gradle)
// ========================================

function withAndroidProjectBuildGradle(config) {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // 1.2 Update Kotlin Gradle Plugin to use with Expo SDK 53
    const kotlinPluginLine =
      "        classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.2.10')";
    const kotlinGradlePluginRegex =
      /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin:.*['"]\)/;

    if (contents.match(kotlinGradlePluginRegex)) {
      console.log('Updating Kotlin Gradle Plugin to 2.2.10...');
      contents = contents.replace(kotlinGradlePluginRegex, kotlinPluginLine);
    } else {
      console.log('Add Kotlin Gradle Plugin to 2.2.10...');
      const dependenciesBlockRegex =
        /(buildscript\s*{\s*repositories\s*{[^}]*}\s*dependencies\s*{)/;
      if (contents.match(dependenciesBlockRegex)) {
        contents = contents.replace(dependenciesBlockRegex, `$1\n${kotlinPluginLine}`);
      } else {
        console.warn('Error when trying to add Kotlin Gradle Plugin 2.2.10.');
      }
    }

    config.modResults.contents = contents;
    return config;
  });
}

// ========================================
// 2. App Build Gradle (android/app/build.gradle)
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
  config = withAndroidProjectBuildGradle(config);
  config = withAndroidAppBuildGradle(config);
  return config;
}

// Exportar como run-once plugin
module.exports = createRunOncePlugin(
  withSalesforceAndroid,
  'expo-salesforce-miaw-plugin',
  '1.0.0',
);

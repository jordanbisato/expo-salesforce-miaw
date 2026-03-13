"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const android_1 = require("./android");
const ios_1 = require("./ios");
const withSalesforceMIAW = (config) => {
    config = (0, ios_1.withSalesforceMIAWiOS)(config);
    config = (0, android_1.withSalesforceMIAWAndroid)(config);
    return config;
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withSalesforceMIAW, "expo-salesforce-miaw", "1.3.2");

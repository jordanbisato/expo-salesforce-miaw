import { ConfigPlugin, createRunOncePlugin } from "expo/config-plugins";
import { withSalesforceMIAWAndroid } from "./android";
import { withSalesforceMIAWiOS } from "./ios";

const withSalesforceMIAW: ConfigPlugin = (config) => {
  config = withSalesforceMIAWiOS(config);
  config = withSalesforceMIAWAndroid(config);
  return config;
};

export default createRunOncePlugin(
  withSalesforceMIAW,
  "expo-salesforce-miaw",
  "1.3.2",
);

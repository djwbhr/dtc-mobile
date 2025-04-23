import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "dtc-mobile",
  slug: "dtc-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "dtc-mobile",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.dtc.mobile",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.dtc.mobile",
    googleServicesFile: "./google-services.json",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/splash-icon.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      }
    ],
    "expo-dev-client",
    [
      "expo-notifications",
      {
        "icon": "./assets/images/icon.png",
        "color": "#ffffff"
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    EMULATOR_HOST: process.env.EMULATOR_HOST,
    DEVICE_HOST: process.env.DEVICE_HOST,
    API_PORT: process.env.API_PORT,
    WEB_PORT: process.env.WEB_PORT,
  },
});

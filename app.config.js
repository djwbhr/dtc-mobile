import 'dotenv/config';

export default {
  name: 'DTC Mobile',
  slug: 'dtc-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.dtc.mobile'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.dtc.mobile',
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    EMULATOR_HOST: process.env.EMULATOR_HOST,
    DEVICE_HOST: process.env.DEVICE_HOST,
    API_PORT: process.env.API_PORT,
    WEB_PORT: process.env.WEB_PORT,
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    eas: {
      projectId: 'your-project-id'
    }
  }
}; 
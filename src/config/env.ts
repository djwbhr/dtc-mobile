import { Platform } from 'react-native';
import Constants from 'expo-constants';

const {
  EMULATOR_HOST = '10.0.2.2',
  DEVICE_HOST = '192.168.1.161',
  API_PORT = '3001',
  WEB_PORT = '5173',
} = Constants.expoConfig?.extra || {};

const HOST = Platform.select({
  android: Platform.isTV ? DEVICE_HOST : EMULATOR_HOST,
  ios: 'localhost',
  default: DEVICE_HOST,
});

export const API_URL = `http://${HOST}:${API_PORT}`;
export const WEBVIEW_URL = `http://${HOST}:${WEB_PORT}`;

export const config = {
  API_URL,
  WEBVIEW_URL,
  isEmulator: HOST === EMULATOR_HOST,
  apiPort: API_PORT,
  webPort: WEB_PORT,
}; 
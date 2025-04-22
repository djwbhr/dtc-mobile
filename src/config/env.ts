import { Platform } from 'react-native';
import Constants from 'expo-constants';

const {
  EMULATOR_HOST = '10.0.2.2',
  DEVICE_HOST = '192.168.1.161',
  API_PORT = '3001',
  WEB_PORT = '5173',
} = Constants.expoConfig?.extra || {};

// Определяем, запущено ли приложение в эмуляторе Android
const isAndroidEmulator = Platform.OS === 'android' && Constants.isDevice === false;

const HOST = Platform.select({
  // Для Android: используем 10.0.2.2 в эмуляторе, иначе IP устройства
  android: isAndroidEmulator ? EMULATOR_HOST : DEVICE_HOST,
  // Для iOS используем localhost в симуляторе, иначе IP устройства
  ios: Constants.isDevice ? DEVICE_HOST : 'localhost',
  // Для остальных платформ используем IP устройства
  default: DEVICE_HOST,
});

export const API_URL = `http://${HOST}:${API_PORT}`;
export const WEBVIEW_URL = `http://${HOST}:${WEB_PORT}`;

export const config = {
  API_URL,
  WEBVIEW_URL,
  isEmulator: !Constants.isDevice,
  apiPort: API_PORT,
  webPort: WEB_PORT,
}; 
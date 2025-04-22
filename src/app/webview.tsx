import React, { useRef } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { View, StyleSheet, Alert, Platform } from "react-native";

// Для эмулятора Android используем 10.0.2.2
// Для физического устройства используем IP-адрес компьютера
const WEBVIEW_URL = Platform.select({
  android: "http://10.0.2.2:5173",
  ios: "http://localhost:5173",
  default: "http://192.168.1.161:5173",
});

const API_URL = Platform.select({
  android: "http://10.0.2.2:3001",
  ios: "http://localhost:3001",
  default: "http://192.168.1.161:3001",
});

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);

  const handleFileDownload = async (url: string) => {
    try {
      const filename = url.split("/").pop();
      const downloadPath = `${FileSystem.documentDirectory}downloads/${filename}`;
      const downloadResult = await FileSystem.downloadAsync(url, downloadPath);

      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Ошибка скачивания", "Не удалось скачать файл");
    }
  };

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      await response.json();
      webViewRef.current?.reload();
      Alert.alert("Success", "File uploaded successfully");
    } catch (error) {
      console.error("File operation error:", error);
      Alert.alert("Error", "Failed to process file");
    }
  };

  const injectedJavaScript = `
    window.API_BASE_URL = '${API_URL}';
    
    // Настройка axios
    if (window.axios) {
      window.axios.defaults.baseURL = window.API_BASE_URL + '/api';
    }

    // Обработка выбора файла
    document.addEventListener('click', function(e) {
      if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
        e.preventDefault();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'file-select' }));
      }
    }, true);

    // Обработка загрузки файлов
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (typeof url === 'string' && url.startsWith('/uploads/')) {
        url = window.API_BASE_URL + url;
      }
      return originalFetch(url, options);
    };
  `;

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "file-select") {
        handleFileSelect();
      } else if (data.type === "download") {
        handleFileDownload(data.url);
      }
    } catch (error) {
      console.error("Error handling WebView message:", error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: WEBVIEW_URL }}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        onMessage={handleWebViewMessage}
        onError={(e) => console.error("WebView error:", e.nativeEvent)}
        allowFileAccess={true}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        mixedContentMode="always"
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});

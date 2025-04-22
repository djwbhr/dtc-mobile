import React, { useRef } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { config, API_URL, WEBVIEW_URL } from "../config/env";

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);

  const handleFileDownload = async (url: string) => {
    try {
      const filename = url.split("/").pop();
      if (!filename) {
        throw new Error("Invalid file URL");
      }

      // Создаем директорию для загрузок, если её нет
      const downloadDir = `${FileSystem.documentDirectory}downloads`;
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, {
          intermediates: true,
        });
      }

      const downloadPath = `${downloadDir}/${filename}`;

      // Проверяем, доступно ли приложение для шаринга
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Sharing is not available");
      }

      const downloadResult = await FileSystem.downloadAsync(url, downloadPath);
      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri, {
          UTI: ".pdf", // Для iOS
          mimeType: "application/pdf", // Для Android
          dialogTitle: "Открыть файл с помощью...",
        });
      } else {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert(
        "Ошибка скачивания",
        error instanceof Error ? error.message : "Не удалось скачать файл"
      );
    }
  };

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri:
          Platform.OS === "android"
            ? file.uri
            : file.uri.replace("file://", ""),
        type: file.mimeType || "application/octet-stream",
        name: file.name || "file",
      } as any);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      // Уведомляем веб-приложение об успешной загрузке
      webViewRef.current?.injectJavaScript(`
        (function() {
          if (typeof window.onUploadSuccess === 'function') {
            window.onUploadSuccess(${JSON.stringify(responseData)});
          } else {
            window.location.reload();
          }
          true;
        })();
      `);

      Alert.alert("Успех", "Файл успешно загружен");
    } catch (error) {
      console.error("File operation error:", error);
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось обработать файл"
      );
    }
  };

  const injectedJavaScript = `
    window.API_BASE_URL = '${API_URL}';
    console.log('Running in ${config.isEmulator ? "emulator" : "device"} mode');
    console.log('API URL:', '${API_URL}');
    console.log('WebView URL:', '${WEBVIEW_URL}');
    
    // Настройка axios
    if (window.axios) {
      window.axios.defaults.baseURL = window.API_BASE_URL + '/api';
    }

    // Обработка выбора файла
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (target instanceof HTMLInputElement && target.type === 'file') {
        e.preventDefault();
        e.stopPropagation();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'file-select' }));
        return false;
      }
    }, true);

    // Обработка скачивания файлов
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (target instanceof HTMLAnchorElement) {
        const href = target.getAttribute('href');
        if (href && (
          href.startsWith('/uploads/') || 
          href.startsWith(window.API_BASE_URL + '/uploads/')
        )) {
          e.preventDefault();
          e.stopPropagation();
          const fullUrl = href.startsWith('/') ? window.API_BASE_URL + href : href;
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'download',
            url: fullUrl
          }));
          return false;
        }
      }
    }, true);

    // Обработка загрузки файлов
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (typeof url === 'string') {
        // Обработка URL для загруженных файлов
        if (url.startsWith('/uploads/')) {
          url = window.API_BASE_URL + url;
        }
        // Обработка URL для API запросов
        else if (url.startsWith('/api/')) {
          url = window.API_BASE_URL + url;
        }
      }
      return originalFetch(url, options);
    };

    // Функция для обновления списка файлов
    window.onUploadSuccess = function(data) {
      console.log('Upload successful:', data);
      if (typeof window.reloadFileList === 'function') {
        window.reloadFileList();
      } else {
        window.location.reload();
      }
    };

    true;
  `;

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case "file-select":
          handleFileSelect();
          break;
        case "download":
          if (!data.url) {
            throw new Error("Download URL is missing");
          }
          handleFileDownload(data.url);
          break;
        default:
          console.warn("Unknown message type:", data.type);
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
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        cacheEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});

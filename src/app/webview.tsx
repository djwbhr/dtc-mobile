import React, { useRef, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";

export default function WebViewScreen() {
  // Поменять на IP-адрес вашего компьютера в локальной сети
  // Для эмулятора:
  // const { url = "http://10.0.2.2:5173/" } = useLocalSearchParams();
  // Для физического устройства:
  const { url = "http://192.168.1.161:5173/" } = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    // Handle messages from web app
    switch (data.type) {
      case "AUTHENTICATION_REQUIRED":
        // Handle authentication request
        break;
      default:
        console.log("Unknown message type:", data.type);
    }
  };

  const sendMessageToWeb = (message: any) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url as string }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

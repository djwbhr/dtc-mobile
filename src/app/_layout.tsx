import { Stack } from "expo-router";
import { useEffect } from "react";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

export default function Layout() {
  useEffect(() => {
    // Создаем директорию для загрузок, если её нет
    const createDownloadsDir = async () => {
      const dir = `${FileSystem.documentDirectory}downloads`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
    };
    createDownloadsDir();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Главная",
        }}
      />
      <Stack.Screen
        name="webview"
        options={{
          title: "Веб-приложение",
        }}
      />
    </Stack>
  );
}

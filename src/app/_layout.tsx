import { Stack } from "expo-router";
import { useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { registerForPushNotificationsAsync, sendTokenToServer, setupNotificationHandlers } from "@/utils/notifications";
export default function Layout() {

  useEffect(() => {
    // Регистрация для получения уведомлений
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        sendTokenToServer(token.data);
      }
    });

    // Настройка обработчиков уведомлений
    const cleanup = setupNotificationHandlers(
      (notification) => {
        console.log("Notification received:", notification);
      },
      (response) => {
        console.log("Notification response:", response);
        // Здесь можно добавить логику обработки нажатия на уведомление
      }
    );

    return cleanup;
  }, []);

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

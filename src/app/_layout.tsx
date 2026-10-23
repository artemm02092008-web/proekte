import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, useWindowDimensions } from "react-native"; // <-- ДОБАВЛЕН useWindowDimensions
import { AppProvider } from "../context/AppContext";

export default function RootLayout() {
  const { width, height } = useWindowDimensions(); // <-- ПОЛУЧАЕМ РЕАЛЬНЫЙ РАЗМЕР ЭКРАНА

  // Если экран больше 600px (планшет или ПК), добавляем рамку как у телефона.
  // Если экран меньше (обычный телефон), приложение занимает 100% экрана.
  const isLargeScreen = width > 600;

  return (
    <AppProvider>
      <View style={styles.mainWrapper}>
        <StatusBar style="light" />
        <View
          style={[
            styles.phoneFrame,
            isLargeScreen
              ? {
                  width: 430,
                  height: "95%",
                  maxHeight: 932,
                  borderRadius: 40,
                  borderWidth: 8,
                  borderColor: "#2C2C2E",
                }
              : { width: "100%", height: "100%" },
          ]}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="workshop" />
            <Stack.Screen name="create-server" />
            <Stack.Screen name="server-settings" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="language" />
            <Stack.Screen name="premium" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="success" />
            <Stack.Screen name="appearance" />
            <Stack.Screen name="frames" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="invite" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="explore" />

            {/* Экраны для участников и чатов */}
            <Stack.Screen name="members" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="call/[id]" />
          </Stack>
        </View>
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneFrame: {
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
    // Убрали жесткие width/maxWidth, теперь они зависят от размера экрана
  },
});

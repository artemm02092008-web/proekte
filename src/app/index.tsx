import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { auth } from "../firebase/config";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Проверяем, вошел ли пользователь
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Если пользователь есть в системе -> сразу на главную (Мастерскую)
        router.replace("/workshop");
      } else {
        // Если пользователя нет -> показываем экран приветствия (или логина)
        router.replace("/login");
        // Если у тебя есть отдельный экран приветствия, можешь написать router.replace("/welcome");
      }
    });

    return () => unsubscribe();
  }, []);

  // Пока идет проверка (доли секунды), показываем крутилку
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8A56FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
  },
});

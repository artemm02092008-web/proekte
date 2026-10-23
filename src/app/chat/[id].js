import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { auth, db } from "../../firebase/config"; // Проверьте путь к конфигу
import ChatScreen from "../../screens/ChatScreen"; // Проверьте путь (у вас в screens, а не components)

export default function ChatPage() {
  const { id, recipientId } = useLocalSearchParams();
  const router = useRouter();

  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipient = async () => {
      // Если ID собеседника не передан, ставим заглушку
      if (!recipientId) {
        setRecipient({ displayName: "Пользователь", username: "user" });
        setLoading(false);
        return;
      }

      try {
        // Ищем пользователя в базе по его ID
        const docRef = doc(db, "users", recipientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRecipient(docSnap.data()); // Нашли! Берем реальные имя и почту
        } else {
          setRecipient({ displayName: "Неизвестный", username: "unknown" });
        }
      } catch (error) {
        console.log("Ошибка загрузки профиля:", error);
        setRecipient({ displayName: "Ошибка", username: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipient();
  }, [recipientId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8A56FF" />
      </View>
    );
  }

  // Берем ID текущего пользователя из Firebase Auth
  const currentUserId = auth.currentUser?.uid;

  return (
    <ChatScreen
      visible={true}
      chatId={id}
      recipient={recipient}
      currentUserId={currentUserId}
      onClose={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
  },
});

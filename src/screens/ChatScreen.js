import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { db } from "../firebase/config";
import { useCitiesGame } from "../hooks/useCitiesGame"; // <-- ИМПОРТ ИГРЫ

const COLORS = {
  bg: "#0F0E13",
  card: "#16151B",
  textMain: "#FFFFFF",
  textSub: "#656469",
  accent: "#8A56FF",
  inputBg: "#1A1920",
};

export default function ChatScreen({
  chatId,
  recipient,
  currentUserId,
  onClose,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userData } = useApp() || {};

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef(null);

  const currentName = userData?.displayName || "Вы";

  // Функция для отправки сообщений от бота
  const sendBotMessage = async (botText) => {
    const botMsg = {
      chatId: chatId,
      senderId: "orbit_bot",
      senderName: "🎮 Игровой Бот",
      text: botText,
      createdAt: serverTimestamp(),
      readBy: ["orbit_bot"],
    };
    await addDoc(collection(db, "messages"), botMsg);
  };

  // Подключаем игру
  const { handleGameMessage } = useCitiesGame(
    chatId,
    currentUserId,
    currentName,
    sendBotMessage
  );

  // 1. СЛУШАЕМ СООБЩЕНИЯ
  useEffect(() => {
    if (!chatId) return;

    const q = query(collection(db, "messages"), where("chatId", "==", chatId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      msgs.sort(
        (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
      );
      setMessages(msgs);
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100
      );
    });

    return () => unsubscribe();
  }, [chatId]);

  // 2. ОТМЕЧАЕМ СООБЩЕНИЯ КАК ПРОЧИТАННЫЕ
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    const q = query(collection(db, "messages"), where("chatId", "==", chatId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(async (docSnap) => {
        const data = docSnap.data();
        const readBy = data.readBy || [];

        if (
          data.senderId !== currentUserId &&
          !readBy.includes(currentUserId)
        ) {
          await updateDoc(doc(db, "messages", docSnap.id), {
            readBy: [...readBy, currentUserId],
          });
        }
      });
    });

    return () => unsubscribe();
  }, [chatId, currentUserId]);

  if (!recipient) return null;

  const sendMessage = async () => {
    const messageText = text.trim();
    if (messageText === "") return;

    setText("");

    // 1. Проверяем, не игра ли это
    const isGameHandled = await handleGameMessage(messageText);
    if (isGameHandled) return;

    // 2. Обычное сообщение
    const newMessage = {
      chatId: chatId,
      senderId: currentUserId,
      senderName: currentName,
      text: messageText,
      createdAt: serverTimestamp(),
      readBy: [currentUserId],
    };

    try {
      await addDoc(collection(db, "messages"), newMessage);
    } catch (error) {
      console.log("Ошибка отправки:", error);
      alert("Не удалось отправить сообщение");
    }
  };

  const goHome = () => {
    router.replace("/workshop");
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back" size={24} color="#A3A2A8" />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>

        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName} numberOfLines={1}>
            {recipient.displayName || "Пользователь"}
          </Text>
          <Text style={styles.recipientStatus} numberOfLines={1}>
            @{recipient.username || "user"}
          </Text>
        </View>

        <TouchableOpacity style={styles.homeButton} onPress={goHome}>
          <Ionicons name="home-outline" size={22} color="#A3A2A8" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={
            messages.length === 0
              ? styles.emptyMessagesList
              : styles.messagesList
          }
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateTitle}>
                Это начало вашей переписки
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Напишите первое сообщение. Или сыграйте в города: /города
              </Text>
            </View>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              const isBot = msg.senderId === "orbit_bot";
              const time = msg.createdAt
                ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  )
                : "...";

              const isReadByOther = msg.readBy && msg.readBy.length > 1;

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isMe ? styles.myRow : styles.theirRow,
                  ]}
                >
                  {!isMe && (
                    <Text
                      style={[styles.senderName, isBot && { color: "#FACC15" }]}
                    >
                      {msg.senderName || "Пользователь"}
                    </Text>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isMe ? styles.myBubble : styles.theirBubble,
                      isBot && {
                        backgroundColor: "#2C2C35",
                        borderColor: "#FACC15",
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text style={styles.messageText}>{msg.text}</Text>
                    <View style={styles.timeAndStatusRow}>
                      <Text style={styles.timestampText}>{time}</Text>

                      {isMe && !isBot && (
                        <Ionicons
                          name="checkmark-done"
                          size={14}
                          color={
                            isReadByOther ? "#4ADE80" : "rgba(255,255,255,0.4)"
                          }
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Написать... (или /города)"
            placeholderTextColor="#4E4D53"
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            style={
              text.trim().length > 0
                ? [styles.sendButton, styles.sendButtonActive]
                : styles.sendButton
            }
            onPress={sendMessage}
          >
            <Ionicons
              name="send"
              size={18}
              color="#FFF"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1920",
  },
  backButton: { flexDirection: "row", alignItems: "center", width: 70 },
  backText: { color: "#A3A2A8", fontSize: 14, marginLeft: 4 },
  recipientInfo: { alignItems: "center", flex: 1 },
  recipientName: { color: COLORS.textMain, fontWeight: "bold", fontSize: 15 },
  recipientStatus: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  homeButton: {
    width: 70,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  keyboardView: { flex: 1 },
  messagesList: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 20 },
  emptyMessagesList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  emptyStateTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: COLORS.textSub,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  messageRow: { flexDirection: "row", marginBottom: 14, width: "100%" },
  myRow: { justifyContent: "flex-end" },
  theirRow: { justifyContent: "flex-start" },
  senderName: {
    color: COLORS.accent,
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: "600",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "relative",
  },
  myBubble: { backgroundColor: COLORS.accent, borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: COLORS.card, borderBottomLeftRadius: 2 },
  messageText: { color: COLORS.textMain, fontSize: 15, lineHeight: 20 },
  timeAndStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  timestampText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#121118",
    borderTopWidth: 1,
    borderTopColor: "#1A1920",
    width: "100%",
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.textMain,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#232229",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  sendButtonActive: { backgroundColor: COLORS.accent },
});

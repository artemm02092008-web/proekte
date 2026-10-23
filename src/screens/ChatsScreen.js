import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebase/config";
import { useTranslation } from "../hooks/useTranslation"; // <-- ПЕРЕВОДЫ

const COLORS = {
  bg: "#1E1F22",
  textMain: "#F2F3F5",
  textMuted: "#949BA4",
  highlight: "#2B2D31",
  accent: "#5865F2",
  divider: "#313338",
};

export const ChatsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.id !== auth.currentUser?.uid);
      setUsers(usersList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((u) =>
    (u.displayName || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const openChat = (recipientId) => {
    const currentUserId = auth.currentUser.uid;
    const chatId = [currentUserId, recipientId].sort().join("_");
    router.push({ pathname: `/chat/${chatId}`, params: { recipientId } });
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#F47FFF",
      "#5865F2",
      "#23A55A",
      "#FAA61A",
      "#EB459E",
      "#00B0F4",
    ];
    const index = (name?.length || 0) % colors.length;
    return colors[index];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ВЕРХНЯЯ ШАПКА С КНОПКОЙ НАЗАД И ЗАГОЛОВКОМ */}
      <View style={styles.headerFullWidth}>
        <View style={styles.headerTopRow}>
          {/* Кнопка Назад */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/workshop")}
          >
            <Ionicons name="chevron-back" size={26} color={COLORS.textMain} />
          </TouchableOpacity>

          {/* Заголовок с переводом */}
          <Text style={styles.headerTitle}>
            {t({
              ru: "Сообщения",
              en: "Messages",
              es: "Mensajes",
              fr: "Messages",
              de: "Nachrichten",
            })}
          </Text>

          {/* Иконка почты */}
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="mail" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              placeholder={t({
                ru: "Поиск пользователей...",
                en: "Search users...",
                es: "Buscar usuarios...",
                fr: "Rechercher des utilisateurs...",
                de: "Benutzer suchen...",
              })}
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>
      </View>

      {/* СПИСОК ПОЛЬЗОВАТЕЛЕЙ */}
      <View style={styles.contentRow}>
        <View style={styles.chatsListContainer}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.accent}
              style={{ marginTop: 50 }}
            />
          ) : filteredUsers.length === 0 ? (
            <Text
              style={{
                color: COLORS.textMuted,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              {t({
                ru: "Пользователи не найдены. Пригласите друзей!",
                en: "No users found. Invite friends!",
                es: "No se encontraron usuarios. ¡Invita a amigos!",
                fr: "Aucun utilisateur trouvé. Invitez des amis !",
                de: "Keine Benutzer gefunden. Freunde einladen!",
              })}
            </Text>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {filteredUsers.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.chatItem}
                  onPress={() => openChat(u.id)}
                >
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: getAvatarColor(u.displayName),
                        width: 46,
                        height: 46,
                        borderRadius: 23,
                        marginRight: 14,
                      },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {(u.displayName || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatName} numberOfLines={1}>
                      {u.displayName ||
                        t({
                          ru: "Без имени",
                          en: "No name",
                          es: "Sin nombre",
                          fr: "Sans nom",
                          de: "Kein Name",
                        })}
                    </Text>
                    <Text style={styles.chatMessage} numberOfLines={1}>
                      {u.email ||
                        t({
                          ru: "Нет почты",
                          en: "No email",
                          es: "Sin correo",
                          fr: "Pas d'e-mail",
                          de: "Keine E-Mail",
                        })}
                    </Text>
                  </View>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  headerFullWidth: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.textMain,
    fontSize: 24,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
    marginLeft: 10, // Чтобы компенсировать кнопку назад
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2D31",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#2B2D31",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentRow: { flex: 1 },
  chatsListContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    width: "100%",
    backgroundColor: COLORS.highlight,
  },
  avatarCircle: { justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  chatInfo: { flex: 1, justifyContent: "center", overflow: "hidden" },
  chatName: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  chatMessage: { color: COLORS.textMuted, fontSize: 13, marginTop: 3 },
});

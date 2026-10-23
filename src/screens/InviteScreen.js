import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimatedLogo } from "../components/AnimatedLogo"; // Ваш логотип
import { auth, db } from "../firebase/config"; // Проверьте путь

const COLORS = {
  bg: "#0F0E13",
  card: "#1C1B22",
  textMain: "#FFFFFF",
  textSub: "#8E8E93",
  accent: "#8A56FF",
  green: "#4ADE80",
};

export default function InviteScreen() {
  const router = useRouter();
  const { serverId, serverName } = useLocalSearchParams(); // Получаем данные сервера из ссылки

  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]); // Кого уже пригласили

  const inviteLink = `orbit.app/invite/${serverId || "masters"}`;

  // 1. Загрузка реальных пользователей из базы (кроме себя)
  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((u) => u.id !== auth.currentUser.uid);
        setUsers(list);
      } catch (error) {
        console.log("Ошибка загрузки пользователей:", error);
      }
    };
    fetchUsers();
  }, []);

  // 2. Копирование ссылки
  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert("Успешно", "Ссылка скопирована в буфер обмена!");
  };

  // 3. Отправка приглашения
  const handleInvite = async (recipientId, recipientName) => {
    try {
      // Создаем уведомление для пользователя
      await addDoc(collection(db, "notifications"), {
        userId: recipientId,
        title: "Приглашение на сервер",
        message: `${
          auth.currentUser.displayName || "Пользователь"
        } приглашает вас на сервер "${serverName || "Мастерская"}"`,
        type: "server_invite",
        serverId: serverId,
        createdAt: serverTimestamp(),
        read: false,
      });

      // Добавляем в список "Отправлено"
      setInvitedUsers((prev) => [...prev, recipientId]);
    } catch (error) {
      console.log(error);
      Alert.alert("Ошибка", "Не удалось отправить приглашение");
    }
  };

  // Фильтрация по поиску
  const filteredUsers = users.filter((u) =>
    (u.displayName || "").toLowerCase().includes(searchText.toLowerCase())
  );

  // Генерация цвета для аватарки
  const getAvatarColor = (name) => {
    const colors = ["#F47FFF", "#5865F2", "#23A55A", "#FAA61A", "#EB459E"];
    return colors[(name?.length || 0) % colors.length];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <AnimatedLogo size={28} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.pageTitle}>Пригласить на сервер</Text>

        {/* Карточка сервера */}
        <View style={styles.serverCard}>
          <View style={styles.serverIcon}>
            <MaterialCommunityIcons
              name="layers"
              size={24}
              color={COLORS.accent}
            />
          </View>
          <View>
            <Text style={styles.serverName}>{serverName || "Мастерская"}</Text>
            <Text style={styles.serverStats}>8 участников · 5 в сети</Text>
          </View>
        </View>

        {/* Ссылка-приглашение */}
        <Text style={styles.sectionLabel}>Пригласительная ссылка</Text>
        <View style={styles.linkRow}>
          <Feather name="link" size={18} color={COLORS.textSub} />
          <Text style={styles.linkText}>{inviteLink}</Text>
        </View>

        <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
          <Text style={styles.copyBtnText}>Копировать ссылку</Text>
        </TouchableOpacity>

        {/* Настройки ссылки */}
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Срок действия · 7 дней</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSub} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Лимит использований · 10</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSub} />
          </TouchableOpacity>
        </View>

        {/* Поиск друзей */}
        <Text style={styles.sectionLabel}>Отправить в личные сообщения</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textSub} />
          <TextInput
            placeholder="Найти контакт"
            placeholderTextColor={COLORS.textSub}
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Список друзей */}
        {filteredUsers.map((user) => {
          const isInvited = invitedUsers.includes(user.id);
          return (
            <View key={user.id} style={styles.userRow}>
              <View style={styles.userInfo}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: getAvatarColor(user.displayName) },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {(user.displayName || "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>
                    {user.displayName || "Без имени"}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statusText}>В сети</Text>
                  </View>
                </View>
              </View>

              {isInvited ? (
                <View style={styles.invitedBadge}>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                  <Text style={styles.invitedText}>Отправлено</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.inviteBtn}
                  onPress={() => handleInvite(user.id, user.displayName)}
                >
                  <Text style={styles.inviteBtnText}>Пригласить</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#FFF", fontSize: 16, marginLeft: 4 },
  logoContainer: { justifyContent: "center", alignItems: "center" },

  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  pageTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  serverCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  serverIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  serverName: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  serverStats: { color: COLORS.textSub, fontSize: 13, marginTop: 2 },

  sectionLabel: { color: COLORS.textSub, fontSize: 13, marginBottom: 8 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  linkText: { color: "#FFF", fontSize: 14 },

  copyBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  copyBtnText: { color: "#FFF", fontSize: 15, fontWeight: "600" },

  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  settingText: { color: "#FFF", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#2C2C2E" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: "#FFF", marginLeft: 8 },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  userName: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  statusText: { color: COLORS.textSub, fontSize: 12 },

  inviteBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteBtnText: { color: "#FFF", fontSize: 13, fontWeight: "600" },

  invitedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  invitedText: { color: COLORS.textSub, fontSize: 13, fontWeight: "500" },
});

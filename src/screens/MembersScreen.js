import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { AnimatedLogo } from "../components/AnimatedLogo"; // <-- ДОБАВИЛИ ИМПОРТ ЛОГОТИПА
import { useApp } from "../context/AppContext";
import { db } from "../firebase/config";

const COLORS = {
  bg: "#0F0E13",
  textMain: "#FFFFFF",
  textSub: "#656469",
  accent: "#8A56FF",
  inputBg: "#1A1920",
  online: "#00C853",
};

export default function MembersScreen({ onStartCall, onOpenChat, onBack }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useApp();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const loadedUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMembers(loadedUsers);
      } catch (error) {
        console.log("Ошибка загрузки участников:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    const name = member.displayName || "Пользователь";
    const email = member.email || "";
    return (
      name.toLowerCase().includes(query) || email.toLowerCase().includes(query)
    );
  });

  const renderMemberRow = (member) => {
    const isMe = member.id === userData?.uid || member.id === userData?.id;
    const name = member.displayName || "Без имени";
    const emailName = member.email ? member.email.split("@")[0] : "user";
    const isOnline = true;
    const avatarImage = member.photoURL;
    const initials = name.substring(0, 2).toUpperCase();
    const isOwner = isMe;

    return (
      <View
        key={member.id}
        style={[styles.memberRow, !isOnline && { opacity: 0.4 }]}
      >
        <View style={styles.avatarContainer}>
          {avatarImage ? (
            <Image source={{ uri: avatarImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          {isOnline ? <View style={styles.statusDot} /> : null}
        </View>

        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.memberName,
                isOwner ? { color: "#E6A23C" } : { color: COLORS.textMain },
              ]}
            >
              {name} {isMe ? "(Вы)" : ""}
            </Text>
            {isOwner ? (
              <Svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="#E6A23C"
                style={{ marginLeft: 4 }}
              >
                <Path d="M2 4l3 5 7-6 7 6 3-5v14H2V4z" />
              </Svg>
            ) : null}
          </View>
          <Text style={styles.usernameText}>@{emailName}</Text>
        </View>

        {!isMe && isOnline ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onOpenChat && onOpenChat(member.id)}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                  stroke="#A3A2A8"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={() => onStartCall && onStartCall(member.id)}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  stroke="#8A56FF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19l-7-7 7-7"
              stroke="#A3A2A8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>

        {/* ЗАМЕНИЛИ ТЕКСТ OPIUM НА ЛОГОТИП */}
        <View style={styles.logoContainer}>
          <AnimatedLogo size={28} />
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Участники</Text>
        <Text style={styles.subtitle}>
          Всего в сети: {members.length} участников
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Найти по имени или @username"
          placeholderTextColor="#4E4D53"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView style={styles.scroll}>
          {filteredMembers.length === 0 ? (
            <Text
              style={{
                color: COLORS.textSub,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              Участники не найдены
            </Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Все участники</Text>
              {filteredMembers.map(renderMemberRow)}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#A3A2A8", fontSize: 16, marginLeft: 4 },

  // Стиль для контейнера логотипа
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  titleContainer: { paddingHorizontal: 16, marginTop: 8 },
  title: { fontSize: 28, fontWeight: "bold", color: COLORS.textMain },
  subtitle: { color: COLORS.textSub, fontSize: 13, marginTop: 4 },
  searchContainer: { paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textMain,
    fontSize: 15,
  },
  scroll: { paddingHorizontal: 16 },
  sectionTitle: {
    color: COLORS.textSub,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    justifyContent: "space-between",
  },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#232229",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: { color: COLORS.textMain, fontWeight: "600", fontSize: 14 },
  statusDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  memberInfo: { marginLeft: 12, flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  memberName: { fontWeight: "600", fontSize: 15 },
  usernameText: { color: COLORS.textSub, fontSize: 13, marginTop: 1 },
  actionsRow: { flexDirection: "row", alignItems: "center" },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    backgroundColor: "#16151B",
    borderRadius: 8,
  },
  callButton: { backgroundColor: "#1F192E" },
});

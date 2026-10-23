import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedLogo } from "../components/AnimatedLogo"; // <-- ДОБАВИЛИ ИМПОРТ
import { useApp } from "../context/AppContext";
import { auth, db } from "../firebase/config";
import i18n from "../i18n";

export const ProfileScreen = () => {
  const router = useRouter();
  const { isPremium, userData, setUserFrame, themeColors, updateAvatar } =
    useApp() || {};
  const primary = themeColors?.primary || "#7C6AFA";

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("main");
  const [customStatus, setCustomStatus] = useState("");
  const [avatarSource, setAvatarSource] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isFramesModalVisible, setIsFramesModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempStatus, setTempStatus] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace("/login");
      }
    });
    return unsubscribe;
  }, []);

  // Синхронизируем статус из Firestore при загрузке
  useEffect(() => {
    if (userData?.status) {
      setCustomStatus(userData.status);
    }
  }, [userData]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      Alert.alert(i18n.t("error"), "Не удалось выйти из аккаунта");
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/workshop");
  };

  const handleSelectAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Сжимаем для Base64
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setAvatarSource(uri);
        await updateAvatar(uri);
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось получить доступ к галерее.");
    }
  };

  const openEditModal = () => {
    setTempName(user?.displayName || "");
    setTempStatus(customStatus);
    setIsEditModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (tempName.trim() === "") {
      Alert.alert("Ошибка", "Имя не может быть пустым.");
      return;
    }

    try {
      // Обновляем имя в Firebase Auth
      if (user) {
        await updateProfile(user, { displayName: tempName.trim() });
      }

      // Обновляем имя и статус в Firestore
      await updateDoc(doc(db, "users", user.uid), {
        displayName: tempName.trim(),
        status: tempStatus.trim(),
      });

      setCustomStatus(tempStatus.trim());
      setIsEditModalVisible(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Ошибка", "Не удалось сохранить изменения");
    }
  };

  if (!user) return <View style={styles.safeArea} />;

  const frameColor =
    isPremium && userData?.frame !== "default"
      ? userData?.frame === "gold"
        ? "#FFD700"
        : userData?.frame === "purple"
        ? "#9D4EDD"
        : userData?.frame === "green"
        ? "#4ADE80"
        : userData?.frame === "fire"
        ? "#FF4500"
        : primary
      : primary;

  // Достаем реальные данные пользователя
  const displayName = user.displayName || "Пользователь";
  const emailOrUsername = user.email ? user.email.split("@")[0] : "user";

  // Форматируем реальную дату регистрации
  const joinDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Недавно";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFF" />
          <Text style={styles.backText}>{i18n.t("back")}</Text>
        </TouchableOpacity>
        <View style={styles.orbitIndicator}>
          {/* ЗАМЕНИЛИ ИКОНКУ НА ANIMATED LOGO КАК В WORKSHOP */}
          <AnimatedLogo size={20} />
          <Text style={styles.orbitText}>ORBIT</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>{i18n.t("profile")}</Text>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Feather name="more-horizontal" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Info Row */}
        <View style={styles.profileRow}>
          <TouchableOpacity
            style={[styles.avatarContainer, { borderColor: frameColor }]}
            onPress={handleSelectAvatar}
          >
            {avatarSource || userData?.photoURL || user.photoURL ? (
              <Image
                source={{
                  uri: avatarSource || userData?.photoURL || user.photoURL,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="account"
                  size={40}
                  color={primary}
                />
              </View>
            )}
            <View style={styles.editBadge}>
              <Feather name="camera" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.statusInfo}>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusLabel}>{i18n.t("in_network")}</Text>
            </View>
            <View style={styles.statusRow}>
              <Feather name="clock" size={14} color="#8E8E93" />
              <Text style={styles.customStatusText} numberOfLines={1}>
                {customStatus || "Статус не установлен"}
              </Text>
            </View>
          </View>
        </View>

        {/* Name & Username */}
        <Text style={styles.displayName}>{displayName}</Text>
        <View style={styles.usernameRow}>
          <Text style={styles.usernameText}>@{emailOrUsername}</Text>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: primary }]}
          onPress={openEditModal}
        >
          <Feather name="edit-2" size={16} color="#FFF" />
          <Text style={styles.editButtonText}>{i18n.t("edit_profile")}</Text>
        </TouchableOpacity>

        {/* Frames Button (Premium only) */}
        {isPremium && (
          <TouchableOpacity
            style={styles.framesButton}
            onPress={() => setIsFramesModalVisible(true)}
          >
            <Text style={[styles.framesButtonText, { color: primary }]}>
              {i18n.t("choose_frame")}
            </Text>
          </TouchableOpacity>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabToggle,
              activeTab === "main" && styles.tabToggleActive,
            ]}
            onPress={() => setActiveTab("main")}
          >
            <Text
              style={
                activeTab === "main" ? styles.tabTextActive : styles.tabText
              }
            >
              Главное
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabToggle,
              activeTab === "wishlist" && styles.tabToggleActive,
            ]}
            onPress={() => setActiveTab("wishlist")}
          >
            <Text
              style={
                activeTab === "wishlist" ? styles.tabTextActive : styles.tabText
              }
            >
              Вишлист
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Tab Content */}
        {activeTab === "main" && (
          <>
            {/* Balance */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceLeft}>
                <FontAwesome5 name="gem" size={20} color="#8A56FF" />
                <Text style={styles.balanceLabel}>Баланс Orbit</Text>
              </View>
              <View style={styles.balanceRight}>
                <Text style={styles.balanceValue}>0</Text>
                <Text style={styles.balanceCurrency}>ORB</Text>
              </View>
            </View>

            {/* Date */}
            <Text style={styles.metaLabel}>В числе участников с</Text>
            <View style={styles.metaRow}>
              <Feather name="calendar" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{joinDate}</Text>
            </View>

            {/* Friends & Note */}
            <View style={styles.listContainer}>
              <TouchableOpacity style={styles.listItem}>
                <Feather name="users" size={20} color="#FFF" />
                <Text style={styles.listText}>Друзья</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#8E8E93"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.listItem}>
                <Feather name="file-text" size={20} color="#FFF" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listText}>Заметка</Text>
                  <Text style={styles.listSub}>Видна только вам</Text>
                </View>
                <Feather name="plus" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Wishlist Tab Content */}
        {activeTab === "wishlist" && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Вишлист пуст</Text>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF453A" />
          <Text style={styles.logoutText}>{i18n.t("logout")}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Редактировать профиль</Text>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>ИМЯ</Text>
            <TextInput
              style={styles.textInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Введите имя"
              placeholderTextColor="#656469"
            />
          </View>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>СТАТУС</Text>
            <TextInput
              style={styles.textInput}
              value={tempStatus}
              onChangeText={setTempStatus}
              placeholder="Введите статус"
              placeholderTextColor="#656469"
            />
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: primary }]}
            onPress={handleSaveChanges}
          >
            <Text style={styles.saveBtnText}>Сохранить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setIsEditModalVisible(false)}
          >
            <Text style={styles.closeBtnText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Frames Modal */}
      <Modal
        visible={isFramesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFramesModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFramesModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.bottomSheetContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Выберите рамку</Text>

            <View style={styles.framesGrid}>
              {["default", "gold", "purple", "green", "fire"].map((frame) => {
                const isSelected =
                  userData?.frame === frame ||
                  (!userData?.frame && frame === "default");

                const frameBorderColor =
                  frame === "default"
                    ? primary
                    : frame === "gold"
                    ? "#FFD700"
                    : frame === "purple"
                    ? "#9D4EDD"
                    : frame === "green"
                    ? "#4ADE80"
                    : "#FF4500";

                const frameTitle =
                  frame === "default"
                    ? "Стандарт"
                    : frame === "gold"
                    ? "Золото"
                    : frame === "purple"
                    ? "Фиолет"
                    : frame === "green"
                    ? "Зеленый"
                    : "Огонь";

                return (
                  <TouchableOpacity
                    key={frame}
                    style={styles.frameWrapper}
                    onPress={() => {
                      if (setUserFrame) setUserFrame(frame);
                      setIsFramesModalVisible(false);
                    }}
                  >
                    <View
                      style={[
                        styles.framePreview,
                        { borderColor: frameBorderColor },
                        isSelected && {
                          backgroundColor: "rgba(255,255,255,0.06)",
                        },
                      ]}
                    >
                      {avatarSource || userData?.photoURL || user.photoURL ? (
                        <Image
                          source={{
                            uri:
                              avatarSource ||
                              userData?.photoURL ||
                              user.photoURL,
                          }}
                          style={styles.framePreviewImage}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="account"
                          size={32}
                          color="#8E8E93"
                        />
                      )}

                      {isSelected && (
                        <View
                          style={[
                            styles.selectedBadge,
                            { backgroundColor: frameBorderColor },
                          ]}
                        >
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.frameLabel,
                        isSelected && {
                          color: frameBorderColor,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {frameTitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0F0E13" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#FFF", fontSize: 14, marginLeft: 4 },
  orbitIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  orbitText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: { fontSize: 28, fontWeight: "400", color: "#FFF" },

  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarImage: { width: 68, height: 68, borderRadius: 18 },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  editBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#2C2C2E",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0F0E13",
  },
  statusInfo: { gap: 8, flex: 1 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  statusLabel: { color: "#4ADE80", fontSize: 12, fontWeight: "500" },
  customStatusText: { color: "#8E8E93", fontSize: 12, flex: 1 },

  displayName: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },
  usernameRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  usernameText: { color: "#8E8E93", fontSize: 14 },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  editButtonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },

  framesButton: {
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  framesButtonText: { fontSize: 14, fontWeight: "600" },

  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#2C2C2E",
    marginBottom: 24,
  },
  tabToggle: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: -2,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabToggleActive: { borderBottomColor: "#7C6AFA" },
  tabText: { color: "#8E8E93", fontSize: 14, fontWeight: "500" },
  tabTextActive: { color: "#FFF", fontSize: 14, fontWeight: "600" },

  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1C1B22",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  balanceLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  balanceLabel: { color: "#FFF", fontSize: 15, fontWeight: "500" },
  balanceRight: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  balanceValue: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  balanceCurrency: { color: "#8E8E93", fontSize: 12, fontWeight: "600" },

  metaLabel: { color: "#656469", fontSize: 12, marginBottom: 8 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  metaText: { color: "#FFF", fontSize: 14 },

  listContainer: {
    backgroundColor: "#1C1B22",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 32,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  listText: { color: "#FFF", fontSize: 15, fontWeight: "500" },
  listSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "#2C2C2E", marginLeft: 44 },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 69, 58, 0.1)",
    padding: 16,
    borderRadius: 16,
  },
  logoutText: {
    color: "#FF453A",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },

  emptyState: { alignItems: "center", padding: 40 },
  emptyStateText: { color: "#656469", fontSize: 14 },

  // ---------- Edit Modal ----------
  modalContainer: {
    flex: 1,
    backgroundColor: "#0F0E13",
    padding: 20,
    justifyContent: "center",
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  inputBlock: { marginBottom: 20 },
  inputLabel: {
    color: "#656469",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#1C1B22",
    color: "#FFF",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  saveBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  saveBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  closeBtn: { padding: 14, alignItems: "center" },
  closeBtnText: { color: "#656469", fontSize: 15 },

  // ---------- Frames Bottom Sheet ----------
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    backgroundColor: "#1C1B22",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    minHeight: 320,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3A3A3C",
    alignSelf: "center",
    marginBottom: 16,
  },
  bottomSheetTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  framesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  frameWrapper: {
    width: "20%",
    alignItems: "center",
    marginBottom: 16,
  },
  framePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
    backgroundColor: "#0F0E13",
  },
  framePreviewImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  selectedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1C1B22",
  },
  frameLabel: {
    color: "#8E8E93",
    fontSize: 11,
    textAlign: "center",
  },
});

import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedLogo } from "../components/AnimatedLogo";
import { useApp } from "../context/AppContext";
import { db } from "../firebase/config";
import i18n from "../i18n";

export const WorkshopScreen = () => {
  const router = useRouter();
  const {
    servers,
    activeServer,
    setActiveServerId,
    themeColors,
    createChannel,
    userData,
  } = useApp();

  const [expandedSections, setExpandedSections] = useState({
    info: true,
    general: true,
    voice: true,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [channelType, setChannelType] = useState("general");

  const [memberCount, setMemberCount] = useState(0);

  const primaryColor = themeColors?.primary || "#8A56FF";

  useEffect(() => {
    if (!activeServer?.id) {
      setMemberCount(0);
      return;
    }

    const unsub = onSnapshot(doc(db, "servers", activeServer.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const members = data.members || [];
        setMemberCount(members.length + 1);
      }
    });

    return () => unsub();
  }, [activeServer?.id]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -50) {
          router.push("/members");
        }
      },
    })
  ).current;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const openCreateModal = (type) => {
    setChannelType(type);
    setNewChannelName("");
    setIsModalVisible(true);
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      Alert.alert("Ошибка", "Введите название канала");
      return;
    }
    if (!activeServer) {
      Alert.alert("Ошибка", "Сначала создайте сервер");
      return;
    }

    const created = await createChannel(activeServer.id, {
      name: newChannelName.trim(),
      type: channelType,
    });

    if (created) {
      setIsModalVisible(false);
      setNewChannelName("");
    }
  };

  const channels = activeServer?.channels || [];
  const infoChannels = channels.filter((c) => c.type === "info");
  const generalChannels = channels.filter((c) => c.type === "general");
  const voiceChannels = channels.filter((c) => c.type === "voice");

  const openChat = (channelId, channelName) => {
    router.push(`/chat/${channelId}?name=${encodeURIComponent(channelName)}`);
  };

  const openCall = (channelId, channelName) => {
    router.push(`/call/${channelId}?name=${encodeURIComponent(channelName)}`);
  };

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* ШАПКА БЕЗ КНОПКИ НАЗАД */}
        <View style={[styles.header, { justifyContent: "flex-end" }]}>
          <View style={styles.orbitIndicator}>
            <AnimatedLogo size={20} />
            <Text style={styles.orbitText}>ORBIT</Text>
          </View>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.sidebar}>
            <TouchableOpacity style={styles.sidebarIcon}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color="#8E8E93"
              />
            </TouchableOpacity>
            <View style={styles.sidebarDivider} />

            {servers.map((server) => (
              <TouchableOpacity
                key={server.id}
                style={[
                  styles.sidebarIcon,
                  activeServer?.id === server.id && {
                    borderWidth: 1,
                    borderColor: primaryColor,
                    backgroundColor: "#2C2C35",
                  },
                ]}
                onPress={() => setActiveServerId(server.id)}
              >
                {server.icon ? (
                  <Image
                    source={{ uri: server.icon }}
                    style={styles.serverImage}
                  />
                ) : (
                  <Text
                    style={[
                      styles.sidebarTextIcon,
                      activeServer?.id === server.id && { color: primaryColor },
                    ]}
                  >
                    {server.name.substring(0, 2).toUpperCase()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.sidebarIcon, styles.sidebarPlus]}
              onPress={() => router.push("/create-server")}
            >
              <Ionicons name="add" size={24} color={primaryColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.contentArea}>
            <TouchableOpacity
              style={styles.serverHeader}
              onPress={() => router.push("/server-settings")}
            >
              <View>
                <Text style={styles.serverTitle}>
                  {activeServer ? activeServer.name : i18n.t("workshop")}
                </Text>
                <View style={styles.serverStatus}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.serverStatusText}>
                    {memberCount} {i18n.t("in_network")} · {memberCount}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() =>
                router.push({
                  pathname: "/invite",
                  params: {
                    serverId: activeServer?.id || "masters",
                    serverName: activeServer?.name || "Мастерская",
                  },
                })
              }
            >
              <Feather name="user-plus" size={16} color={primaryColor} />
              <Text style={[styles.inviteText, { color: primaryColor }]}>
                {i18n.t("invite")}
              </Text>
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {!servers.length ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {i18n.t("no_servers")}
                  </Text>
                </View>
              ) : (
                <>
                  {/* Секция info */}
                  <View style={styles.sectionHeader}>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                      onPress={() => toggleSection("info")}
                    >
                      <Ionicons
                        name={
                          expandedSections.info
                            ? "chevron-down"
                            : "chevron-forward"
                        }
                        size={16}
                        color="#8E8E93"
                      />
                      <Text style={styles.sectionTitle}>
                        {i18n.t("information_section")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addButtonSmall}
                      onPress={() => openCreateModal("info")}
                    >
                      <Ionicons name="add" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                  {expandedSections.info && (
                    <View style={styles.sectionContent}>
                      {infoChannels.length > 0 ? (
                        infoChannels.map((ch) => (
                          <TouchableOpacity
                            key={ch.id}
                            onPress={() => openChat(ch.id, ch.name)}
                            style={styles.channelRow}
                          >
                            <Text style={styles.channelText}># {ch.name}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.emptySectionText}>
                          {i18n.t("empty_section")}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Секция general */}
                  <View style={styles.sectionHeader}>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                      onPress={() => toggleSection("general")}
                    >
                      <Ionicons
                        name={
                          expandedSections.general
                            ? "chevron-down"
                            : "chevron-forward"
                        }
                        size={16}
                        color="#8E8E93"
                      />
                      <Text style={styles.sectionTitle}>
                        {i18n.t("chat_section")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addButtonSmall}
                      onPress={() => openCreateModal("general")}
                    >
                      <Ionicons name="add" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                  {expandedSections.general && (
                    <View style={styles.sectionContent}>
                      {generalChannels.length > 0 ? (
                        generalChannels.map((ch) => (
                          <TouchableOpacity
                            key={ch.id}
                            onPress={() => openChat(ch.id, ch.name)}
                            style={styles.channelRow}
                          >
                            <Text style={styles.channelText}># {ch.name}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.emptySectionText}>
                          {i18n.t("empty_section")}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Секция voice */}
                  <View style={styles.sectionHeader}>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                      onPress={() => toggleSection("voice")}
                    >
                      <Ionicons
                        name={
                          expandedSections.voice
                            ? "chevron-down"
                            : "chevron-forward"
                        }
                        size={16}
                        color="#8E8E93"
                      />
                      <Text style={styles.sectionTitle}>
                        {i18n.t("voice_section")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addButtonSmall}
                      onPress={() => openCreateModal("voice")}
                    >
                      <Ionicons name="add" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                  {expandedSections.voice && (
                    <View style={styles.sectionContent}>
                      {voiceChannels.length > 0 ? (
                        voiceChannels.map((ch) => (
                          <TouchableOpacity
                            key={ch.id}
                            onPress={() => openCall(ch.id, ch.name)}
                            style={styles.channelRow}
                          >
                            <Text style={styles.channelText}>🔊 {ch.name}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.emptySectionText}>
                          {i18n.t("empty_section")}
                        </Text>
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>

        <View style={styles.bottomPanelWrapper}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => router.push("/workshop")}
            >
              <MaterialCommunityIcons
                name="hexagon-multiple"
                size={24}
                color={primaryColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => router.push("/chats")}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color="#8E8E93"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => router.push("/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#8E8E93"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => router.push("/profile")}
            >
              {userData?.photoURL ? (
                <Image
                  source={{ uri: userData.photoURL }}
                  style={styles.tabAvatarImage}
                />
              ) : (
                <View
                  style={[styles.tabAvatar, { backgroundColor: primaryColor }]}
                >
                  <Text style={styles.tabAvatarText}>АК</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={isModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Создать канал</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Название канала"
                placeholderTextColor="#666"
                value={newChannelName}
                onChangeText={setNewChannelName}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalBtnCancel}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.modalBtnCancelText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalBtnSave,
                    { backgroundColor: primaryColor },
                  ]}
                  onPress={handleCreateChannel}
                >
                  <Text style={styles.modalBtnSaveText}>Создать</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1A1A1E" },
  header: {
    flexDirection: "row",
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
  mainContainer: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 64,
    backgroundColor: "#1A1A1E",
    alignItems: "center",
    paddingTop: 10,
    borderRightWidth: 1,
    borderRightColor: "#2C2C2E",
  },
  sidebarIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  sidebarPlus: { backgroundColor: "#2C2C2E" },
  sidebarTextIcon: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  serverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  sidebarDivider: {
    width: 32,
    height: 2,
    backgroundColor: "#2C2C2E",
    marginBottom: 12,
  },
  contentArea: { flex: 1, backgroundColor: "#1A1A1E" },
  serverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  serverTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  serverStatus: { flexDirection: "row", alignItems: "center" },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 6,
  },
  serverStatusText: { color: "#8E8E93", fontSize: 12 },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2E",
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  inviteText: { fontSize: 14, fontWeight: "500" },
  scrollContent: { paddingHorizontal: 12, paddingBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: "#8E8E93",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginLeft: 4,
    flex: 1,
  },
  addButtonSmall: { padding: 4 },
  sectionContent: { paddingHorizontal: 24, paddingBottom: 12 },
  emptySectionText: { color: "#666", fontSize: 13, fontStyle: "italic" },
  channelRow: { paddingVertical: 6 },
  channelText: { color: "#A3A2A8", fontSize: 14, paddingVertical: 4 },
  emptyState: { alignItems: "center", marginTop: 40, paddingHorizontal: 20 },
  emptyStateText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomPanelWrapper: { backgroundColor: "#2C2C2E" },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#1A1A1E",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tabAvatarText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  tabAvatarImage: { width: 26, height: 26, borderRadius: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#1A1A1E",
    color: "#FFF",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalBtnCancel: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#1A1A1E",
    marginRight: 8,
  },
  modalBtnCancelText: { color: "#FFF", fontSize: 16 },
  modalBtnSave: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginLeft: 8,
  },
  modalBtnSaveText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});

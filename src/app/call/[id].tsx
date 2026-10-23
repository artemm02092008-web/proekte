import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { useApp } from "../../context/AppContext";
import { db } from "../../firebase/config";
import { useWebRTC } from "../../hooks/useWebRTC";

const COLORS = {
  bg: "#0F0E13",
  card: "#1C1B22",
  textMain: "#FFFFFF",
  textSub: "#656469",
  accent: "#8A56FF",
  green: "#4ADE80",
};

export default function CallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userData } = useApp() || {};

  // Получаем ID канала из URL
  const { id } = useLocalSearchParams();

  // Приводим к string для TypeScript
  const channelId = (id as string) || "lounge-room";
  const channelName = (id as string) || "lounge";

  const currentUserId = userData?.uid || "user_123";
  const displayName = userData?.displayName || "Вы";

  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  // 1. Инициализируем WebRTC
  const { localStream, remoteStream, isConnected } = useWebRTC(
    channelId,
    currentUserId
  );

  // 2. Добавляем себя в список участников при входе в канал
  useEffect(() => {
    if (!channelId || !currentUserId) return;
    const channelRef = doc(db, "channels", channelId);

    const myData = {
      id: currentUserId,
      name: displayName,
      initials: displayName[0]?.toUpperCase() || "Я",
      isMuted: false,
    };

    updateDoc(channelRef, {
      activeParticipants: arrayUnion(myData),
    }).catch((e) => console.log("Ошибка входа в канал:", e));

    // При выходе экрана удаляем себя из списка
    return () => {
      updateDoc(channelRef, {
        activeParticipants: arrayRemove(myData),
      }).catch((e) => console.log("Ошибка выхода из канала:", e));
    };
  }, [channelId, currentUserId, displayName]);

  // 3. Слушаем изменения участников в реальном времени
  useEffect(() => {
    if (!channelId) return;
    const unsub = onSnapshot(doc(db, "channels", channelId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setParticipants(data.activeParticipants || []);
      }
    });
    return () => unsub();
  }, [channelId]);

  // 4. Обработчик кнопки "Микрофон" (ИСПРАВЛЕНО ДЛЯ TYPESCRIPT)
  const toggleMute = () => {
    if (localStream) {
      // @ts-ignore
      localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // 5. Выход из канала
  const handleLeave = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/workshop");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Шапка */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity onPress={handleLeave} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#A3A2A8" />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
        <View style={styles.orbitIndicator}>
          <AnimatedLogo size={20} />
          <Text style={styles.orbitText}>ORBIT</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Заголовок канала */}
        <View style={styles.titleRow}>
          <View style={styles.channelIcon}>
            <Ionicons name="volume-high" size={24} color={COLORS.accent} />
          </View>
          <View>
            <Text style={styles.channelName}>{channelName}</Text>
            <Text style={styles.channelSub}>Мастерская · голосовой канал</Text>
          </View>
        </View>

        {/* Участники и время */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Участники · {participants.length}</Text>
          <Text style={styles.metaText}>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Сетка участников */}
        <View style={styles.grid}>
          {participants.map((p: any) => (
            <View
              key={p.id}
              style={[
                styles.participantCard,
                p.id === currentUserId &&
                  !isMuted && { borderColor: COLORS.accent, borderWidth: 1 },
              ]}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{p.initials}</Text>
                </View>
                <View
                  style={[
                    styles.micBadge,
                    p.isMuted || (p.id === currentUserId && isMuted)
                      ? styles.micMuted
                      : styles.micActive,
                  ]}
                >
                  <Ionicons
                    name={
                      p.isMuted || (p.id === currentUserId && isMuted)
                        ? "mic-off"
                        : "mic"
                    }
                    size={10}
                    color="#FFF"
                  />
                </View>
              </View>
              <Text style={styles.participantName}>
                {p.id === currentUserId ? "Вы" : p.name}
              </Text>
              <Text style={styles.participantStatus}>
                {p.isMuted || (p.id === currentUserId && isMuted)
                  ? "Микрофон выключен"
                  : "Говорит"}
              </Text>
            </View>
          ))}
        </View>

        {/* Статус связи */}
        <View style={styles.connectionStatus}>
          <MaterialCommunityIcons
            name="signal"
            size={16}
            color={isConnected ? COLORS.green : "#FF453A"}
          />
          <Text
            style={[
              styles.connectionText,
              { color: isConnected ? COLORS.green : "#FF453A" },
            ]}
          >
            {isConnected
              ? "Подключено · хорошая связь"
              : "Подключение к серверу..."}
          </Text>
        </View>

        {/* Нижние кнопки управления */}
        <View
          style={[
            styles.controls,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.controlItem}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
              <Ionicons
                name={isMuted ? "mic-off" : "mic"}
                size={24}
                color={isMuted ? "#FF453A" : "#FFF"}
              />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Микрофон</Text>
          </View>

          <View style={styles.controlItem}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="headset" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Наушники</Text>
          </View>

          <View style={styles.controlItem}>
            <TouchableOpacity
              style={[styles.controlButton, styles.hangupButton]}
              onPress={handleLeave}
            >
              <Ionicons
                name="call"
                size={24}
                color="#FF453A"
                style={{ transform: [{ rotate: "135deg" }] }}
              />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Отключиться</Text>
          </View>
        </View>
      </View>
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
    paddingBottom: 10,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#A3A2A8", fontSize: 14, marginLeft: 4 },
  orbitIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  orbitText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },

  content: { flex: 1, paddingHorizontal: 20 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  channelIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(138, 86, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  channelName: { color: "#FFF", fontSize: 22, fontWeight: "600" },
  channelSub: { color: COLORS.textSub, fontSize: 12, marginTop: 2 },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metaText: { color: COLORS.textSub, fontSize: 12 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  participantCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2C2C35",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFF", fontSize: 20, fontWeight: "600" },
  micBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  micMuted: { backgroundColor: "#FF453A" },
  micActive: { backgroundColor: COLORS.accent },
  participantName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  participantStatus: {
    color: COLORS.textSub,
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },

  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  connectionText: { color: COLORS.green, fontSize: 12, marginLeft: 6 },

  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: "auto",
    paddingTop: 20,
  },
  controlItem: { alignItems: "center" },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  hangupButton: { backgroundColor: "rgba(255, 69, 58, 0.15)" },
  controlLabel: { color: COLORS.textSub, fontSize: 11 },
});

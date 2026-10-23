import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { AnimatedLogo } from "../components/AnimatedLogo"; // <-- ДОБАВИЛИ ИМПОРТ
import { useApp } from "../context/AppContext";

const COLORS = {
  bg: "#0F0E13",
  card: "#16151B",
  textMain: "#FFFFFF",
  textSub: "#656469",
  purpleCard: "#1E1830",
};

export const SettingsScreen = () => {
  const router = useRouter();
  // Берем язык и ЦВЕТА ТЕМЫ из контекста
  const { language, themeColors } = useApp() || {};
  const primary = themeColors?.primary || "#8A56FF";

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/workshop");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
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
        <View style={styles.orbitIndicator}>
          {/* ЗАМЕНИЛИ SVG-ИКОНКУ НА ANIMATED LOGO */}
          <AnimatedLogo size={20} />
          <Text style={styles.orbitText}>ORBIT</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Настройки</Text>

        {/* Premium Card */}
        <TouchableOpacity
          style={[styles.premiumCard, { borderColor: primary + "40" }]}
          onPress={() => router.push("/premium")}
        >
          <View
            style={[styles.premiumIcon, { backgroundColor: primary + "33" }]}
          >
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={14} r={7} fill={primary} />
              <Path
                d="M12 4C7 4 3 8 3 13"
                stroke="#FFF"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={styles.premiumTextContainer}>
            <Text style={styles.premiumTitle}>Orbit Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Больше пространства для общения
            </Text>
          </View>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 5l7 7-7 7"
              stroke={primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Main Settings List */}
        <View style={styles.sectionCard}>
          <MenuItem
            icon={<AccountIcon />}
            title="Учётная запись"
            onPress={() => router.push("/profile")}
          />
          <MenuItem
            icon={<BellIcon />}
            title="Уведомления"
            onPress={() => {}}
          />
          <MenuItem
            icon={<PaletteIcon />}
            title="Внешний вид"
            onPress={() => router.push("/appearance")}
          />
          <MenuItem
            icon={<LanguageIcon />}
            title="Язык"
            value={
              language === "ru"
                ? "Русский"
                : language === "en"
                ? "English"
                : "Español"
            }
            onPress={() => router.push("/language")}
            isLast
          />
        </View>

        {/* Support Section */}
        <Text style={styles.sectionLabel}>Поддержка</Text>
        <View style={styles.sectionCard}>
          <MenuItem icon={<HelpIcon />} title="Поддержка" onPress={() => {}} />
          <MenuItem
            icon={<LogIcon />}
            title="Отправить логи"
            onPress={() => {}}
            isLast
          />
        </View>

        {/* Updates Section */}
        <Text style={styles.sectionLabel}>Что нового</Text>
        <View style={styles.sectionCard}>
          <MenuItem
            icon={<SparklesIcon color={primary} />}
            title="Обновления Orbit"
            value="2.8"
            onPress={() => {}}
            isLast
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.push("/login")}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="#FF453A"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Orbit для вас · версия 2.8.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Компонент строки меню
const MenuItem = ({ icon, title, value, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    onPress={onPress}
  >
    <View style={styles.menuIconContainer}>{icon}</View>
    <Text style={styles.menuTitle}>{title}</Text>
    {value && <Text style={styles.menuValue}>{value}</Text>}
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5l7 7-7 7"
        stroke="#656469"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </TouchableOpacity>
);

// Иконки
const AccountIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
      stroke="#FFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const BellIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
      stroke="#FFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const PaletteIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-1c0-1.1.9-2 2-2h1c2.76 0 5-2.24 5-5 0-5.52-4.48-10-10-10z"
      stroke="#FFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={7.5} cy={10.5} r={1.5} fill="#FFF" />
    <Circle cx={12} cy={7.5} r={1.5} fill="#FFF" />
    <Circle cx={16.5} cy={10.5} r={1.5} fill="#FFF" />
  </Svg>
);
const LanguageIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"
      stroke="#FFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const HelpIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke="#FFF" strokeWidth={2} />
    <Path
      d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"
      stroke="#FFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const LogIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke="#FFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
      stroke="#FFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
// Иконка "Обновления" теперь принимает цвет темы
const SparklesIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z"
      stroke={color || "#8A56FF"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 3v4M3 5h4M19 17v4M17 19h4"
      stroke={color || "#8A56FF"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#A3A2A8", fontSize: 16, marginLeft: 4 },
  orbitIndicator: { flexDirection: "row", alignItems: "center", gap: 6 },
  orbitText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  pageTitle: {
    fontSize: 32,
    fontWeight: "400",
    color: "#FFF",
    marginBottom: 20,
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purpleCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#3A2B5C",
  },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(138, 86, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  premiumTextContainer: { flex: 1 },
  premiumTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  premiumSubtitle: { color: "#A09AB5", fontSize: 12 },
  sectionLabel: {
    fontSize: 14,
    color: "#656469",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#232229" },
  menuIconContainer: { width: 28, marginRight: 12, alignItems: "center" },
  menuTitle: { flex: 1, color: "#FFF", fontSize: 16 },
  menuValue: { color: "#656469", fontSize: 14, marginRight: 8 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 69, 58, 0.1)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  logoutText: {
    color: "#FF453A",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  footerText: { color: "#656469", fontSize: 12, textAlign: "center" },
});

import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { AnimatedLogo } from "../components/AnimatedLogo"; // <-- ДОБАВИЛИ ИМПОРТ
import { useApp } from "../context/AppContext";

const COLORS = {
  bg: "#0F0E13",
  card: "#16151B",
  textMain: "#FFFFFF",
  textSub: "#656469",
  border: "#232229",
};

const THEMES = [
  { id: "purple", name: "Фиолетовый", color: "#8A56FF" },
  { id: "blue", name: "Синий", color: "#4F5DED" },
  { id: "green", name: "Зеленый", color: "#00C853" },
];

export const AppearanceScreen = () => {
  const router = useRouter();
  // Берем глобальную тему и функцию смены из контекста
  const { activeTheme, changeTheme } = useApp() || {};

  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [syncAcrossClients, setSyncAcrossClients] = useState(false);
  const [scale, setScale] = useState(100);
  const [defaultTextSize, setDefaultTextSize] = useState(true);

  // Текущая тема (если контекст не загрузился, по умолчанию фиолетовая)
  const currentTheme = activeTheme || "purple";
  const activeThemeColor =
    THEMES.find((t) => t.id === currentTheme)?.color || "#8A56FF";

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/settings");
  };

  // Обработчик выбора темы
  const handleSelectTheme = (themeId) => {
    if (changeTheme) {
      changeTheme(themeId); // Сохраняет в AsyncStorage и обновляет всё приложение
    }
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
        <Text style={styles.pageTitle}>Внешний вид</Text>

        {/* --- ТЕМА ПРИЛОЖЕНИЯ --- */}
        <Text style={styles.sectionLabel}>Тема приложения</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Как тема устройства</Text>
              <Text style={styles.rowSubtitle}>
                Сейчас используется тёмная тема
              </Text>
            </View>
            <Switch
              value={useSystemTheme}
              onValueChange={setUseSystemTheme}
              trackColor={{ false: "#3A3A3C", true: activeThemeColor }}
              thumbColor="#FFF"
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowTitle, { flex: 1 }]}>
              Синхронизировать между клиентами
            </Text>
            <Switch
              value={syncAcrossClients}
              onValueChange={setSyncAcrossClients}
              trackColor={{ false: "#3A3A3C", true: activeThemeColor }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* --- МАСШТАБ И ТЕКСТ --- */}
        <Text style={styles.sectionLabel}>Масштаб и текст</Text>
        <View style={styles.card}>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.rowTitle}>Уровень масштабирования</Text>
              <Text style={[styles.rowTitle, { color: activeThemeColor }]}>
                {Math.round(scale)}%
              </Text>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={80}
              maximumValue={120}
              step={1}
              value={scale}
              onValueChange={setScale}
              minimumTrackTintColor={activeThemeColor}
              maximumTrackTintColor="#3A3A3C"
              thumbTintColor="#FFF"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>80%</Text>
              <Text style={styles.sliderLabelText}>120%</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={[styles.rowTitle, { flex: 1 }]}>
              Стандартный размер текста в чате
            </Text>
            <Switch
              value={defaultTextSize}
              onValueChange={setDefaultTextSize}
              trackColor={{ false: "#3A3A3C", true: activeThemeColor }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* --- ТЕМЫ (ВЫБОР) --- */}
        <Text style={styles.sectionLabel}>Темы</Text>
        <View style={styles.themesContainer}>
          {THEMES.map((theme) => {
            const isActive = currentTheme === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                style={styles.themeBlock}
                onPress={() => handleSelectTheme(theme.id)} // <-- Меняет тему во всем приложении
              >
                <View
                  style={[
                    styles.themePreview,
                    isActive && { borderColor: theme.color, borderWidth: 2 },
                  ]}
                >
                  <View style={styles.miniChat}>
                    <View style={styles.miniAvatarRow}>
                      <View
                        style={[
                          styles.miniDot,
                          { backgroundColor: theme.color },
                        ]}
                      />
                      <View style={styles.miniLine} />
                    </View>
                    <View style={styles.miniBubble} />
                    <View
                      style={[
                        styles.miniBubbleRight,
                        { backgroundColor: theme.color },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.themeName}>{theme.name}</Text>
                <View
                  style={[
                    styles.radio,
                    isActive && { borderColor: theme.color },
                  ]}
                >
                  {isActive && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: theme.color },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    marginBottom: 24,
  },
  sectionLabel: { fontSize: 14, color: "#656469", marginBottom: 12 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowTextContainer: { flex: 1 },
  rowTitle: { color: "#FFF", fontSize: 16, fontWeight: "500" },
  rowSubtitle: { color: COLORS.textSub, fontSize: 12, marginTop: 2 },

  sliderContainer: { padding: 16 },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between" },
  sliderLabelText: { color: COLORS.textSub, fontSize: 12 },
  divider: { height: 1, backgroundColor: COLORS.border },

  themesContainer: { flexDirection: "row", justifyContent: "space-between" },
  themeBlock: { width: "30%", alignItems: "center" },
  themePreview: {
    width: "100%",
    aspectRatio: 0.9,
    backgroundColor: "#1C1B22",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 8,
    justifyContent: "center",
  },
  miniChat: { flex: 1, justifyContent: "center", gap: 6 },
  miniAvatarRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  miniLine: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3A3A3C",
  },
  miniBubble: {
    width: "70%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#2A2930",
  },
  miniBubbleRight: {
    width: "60%",
    height: 14,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  themeName: { color: "#A3A2A8", fontSize: 12, marginTop: 8 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3A3A3C",
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
});

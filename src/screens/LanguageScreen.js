import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedLogo } from "../components/AnimatedLogo"; // <-- ДОБАВИЛИ ИМПОРТ
import { useApp } from "../context/AppContext"; // ИСПОЛЬЗУЕМ APPCONTEXT
import i18n from "../i18n";
import { COLORS } from "../theme/colors";

// --- ПРАВИЛЬНАЯ ОТРИСОВКА ФЛАГОВ ---
const FlagIcon = ({ country }) => {
  return (
    <View style={styles.flagContainer}>
      {country === "ru" && (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "#FFF" }} />
          <View style={{ flex: 1, backgroundColor: "#0039A6" }} />
          <View style={{ flex: 1, backgroundColor: "#D52B1E" }} />
        </View>
      )}
      {country === "us" && (
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View style={{ flex: 1, backgroundColor: "#B22234" }} />
          <View style={{ flex: 1, backgroundColor: "#FFF" }} />
          <View style={{ flex: 1, backgroundColor: "#B22234" }} />
          <View style={{ flex: 1, backgroundColor: "#FFF" }} />
          <View style={{ flex: 1, backgroundColor: "#B22234" }} />
          <View style={{ flex: 1, backgroundColor: "#FFF" }} />
          <View style={{ flex: 1, backgroundColor: "#B22234" }} />
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "45%",
              height: "50%",
              backgroundColor: "#3C3B6E",
            }}
          />
        </View>
      )}
      {country === "uk" && (
        <View
          style={{ flex: 1, backgroundColor: "#012169", position: "relative" }}
        >
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "20%",
              backgroundColor: "#FFF",
              top: "40%",
            }}
          />
          <View
            style={{
              position: "absolute",
              height: "100%",
              width: "20%",
              backgroundColor: "#FFF",
              left: "40%",
            }}
          />
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "10%",
              backgroundColor: "#C8102E",
              top: "45%",
            }}
          />
          <View
            style={{
              position: "absolute",
              height: "100%",
              width: "10%",
              backgroundColor: "#C8102E",
              left: "45%",
            }}
          />
        </View>
      )}
      {country === "de" && (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "#000" }} />
          <View style={{ flex: 1, backgroundColor: "#DD0000" }} />
          <View style={{ flex: 1, backgroundColor: "#FFCE00" }} />
        </View>
      )}
      {country === "fr" && (
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 1, backgroundColor: "#002395" }} />
          <View style={{ flex: 1, backgroundColor: "#FFF" }} />
          <View style={{ flex: 1, backgroundColor: "#ED2939" }} />
        </View>
      )}
      {country === "es" && (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "#AA151B" }} />
          <View style={{ flex: 2, backgroundColor: "#F1BF00" }} />
          <View style={{ flex: 1, backgroundColor: "#AA151B" }} />
        </View>
      )}
    </View>
  );
};

const LANGUAGES = [
  { id: "uk", name: "English (UK)", sub: "Английский · Великобритания" },
  { id: "us", name: "English (US)", sub: "Английский · США" },
  { id: "ru", name: "Русский", sub: "Русский" },
  { id: "fr", name: "Français", sub: "Французский" },
  { id: "de", name: "Deutsch", sub: "Немецкий" },
  { id: "es", name: "Español", sub: "Испанский" },
];

export const LanguageScreen = () => {
  const router = useRouter();
  // БЕРЕМ ЯЗЫК ИЗ APPCONTEXT
  const { language, changeLanguage } = useApp();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/settings");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
          <Text style={styles.backText}>{i18n.t("back")}</Text>
        </TouchableOpacity>
        <View style={styles.orbitIndicator}>
          {/* ЗАМЕНИЛИ ИКОНКУ НА ANIMATED LOGO */}
          <AnimatedLogo size={20} />
          <Text style={styles.orbitText}>ORBIT</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{i18n.t("language")}</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={i18n.t("search_lang")}
            placeholderTextColor="#666"
          />
        </View>

        <Text style={styles.sectionTitle}>{i18n.t("app_language")}</Text>

        {LANGUAGES.map((item) => {
          const isActive =
            language === item.id ||
            (language === "en" && (item.id === "uk" || item.id === "us"));

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.langItem, isActive && styles.langItemActive]}
              onPress={() =>
                changeLanguage(
                  item.id === "uk" || item.id === "us" ? "en" : item.id
                )
              }
            >
              <FlagIcon country={item.id} />
              <View style={styles.langTextContainer}>
                <Text style={styles.langName}>{item.name}</Text>
                <Text style={styles.langSub}>{item.sub}</Text>
              </View>
              {isActive ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.primary}
                />
              ) : (
                <View style={styles.radioEmpty} />
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.footerContainer}>
          <MaterialCommunityIcons name="earth" size={24} color="#666" />
          <Text style={styles.footerText}>{i18n.t("lang_changes_footer")}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.premiumButton}
        onPress={() => router.push("/premium")}
      >
        <Text style={styles.premiumText}>{i18n.t("go_premium")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#FFF", fontSize: 16, marginLeft: 4 },
  orbitIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  orbitText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  scrollContainer: { paddingHorizontal: 24, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: "400", color: "#FFF", marginBottom: 24 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 24,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 16, marginLeft: 8 },
  sectionTitle: { fontSize: 12, color: "#666", marginBottom: 12 },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  langItemActive: { backgroundColor: "#2C2C35", borderColor: COLORS.primary },
  langTextContainer: { flex: 1 },
  langName: { color: "#FFF", fontSize: 16, fontWeight: "500", marginBottom: 2 },
  langSub: { color: "#8E8E93", fontSize: 12 },
  radioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#666",
  },
  footerContainer: { alignItems: "center", marginTop: 32, marginBottom: 20 },
  footerText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  premiumButton: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: COLORS.surface,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  premiumText: { color: "#FFF", fontSize: 16, fontWeight: "500" },
  flagContainer: {
    width: 40,
    height: 28,
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});

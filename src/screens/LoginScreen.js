import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import { useApp } from "../context/AppContext";
import { auth } from "../firebase/config";
import i18n from "../i18n";
import { COLORS } from "../theme/colors";

export const LoginScreen = () => {
  const router = useRouter();
  const { language } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState(""); // <-- Состояние для ошибки

  const handleLogin = async () => {
    setErrorText(""); // Сбрасываем старую ошибку

    if (!email.trim() || !password.trim()) {
      setErrorText(i18n.t("fill_fields"));
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/workshop");
    } catch (error) {
      let errorMessage = "Неверный email или пароль.";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Неверный пароль. Попробуйте ещё раз.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Пользователь с таким email не найден.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Введите корректный email.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Слишком много попыток. Подождите немного.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Неверный email или пароль.";
      }

      setErrorText(errorMessage); // <-- Показываем ошибку в форме
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
            <Text style={styles.backText}>{i18n.t("back")}</Text>
          </TouchableOpacity>
          <View style={styles.orbitIndicator}>
            <MaterialCommunityIcons
              name="orbit"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.orbitText}>ORBIT</Text>
          </View>
        </View>

        {/* Logo & Titles */}
        <View style={styles.logoBackground}>
          <MaterialCommunityIcons
            name="orbit"
            size={32}
            color={COLORS.primary}
          />
          <View style={styles.logoDot} />
        </View>
        <Text style={styles.title}>{i18n.t("login_title")}</Text>
        <Text style={styles.subtitle}>{i18n.t("login_subtitle")}</Text>

        {/* Inputs */}
        <Text style={styles.sectionTitle}>{i18n.t("login_data")}</Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{i18n.t("email")}</Text>
            <TextInput
              style={styles.input}
              placeholder="example@mail.ru"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{i18n.t("password")}</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={i18n.t("password_placeholder")}
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Блок с ошибкой (появляется, если есть текст) */}
        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>
            {i18n.t("forgot_password")}
          </Text>
        </TouchableOpacity>

        {/* Кнопка Войти */}
        <CustomButton
          title={loading ? i18n.t("loading") : i18n.t("login_button")}
          variant="primary"
          showArrow={!loading}
          onPress={handleLogin}
        />

        {/* Ссылка на регистрацию */}
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.registerLinkText}>
            {i18n.t("no_account")}{" "}
            <Text style={{ color: "#FFF" }}>{i18n.t("register_button")}</Text>
          </Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={12}
            color={COLORS.textMuted}
          />
          <Text style={styles.disclaimerText}>{i18n.t("disclaimer")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#FFF", fontSize: 16, marginLeft: 4 },
  orbitIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  orbitText: { color: COLORS.primary, fontSize: 14, fontWeight: "500" },
  logoBackground: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.logoBackground,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
  },
  logoDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "400",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 32 },
  sectionTitle: {
    fontSize: 12,
    color: "#666",
    letterSpacing: 1,
    marginBottom: 12,
    fontWeight: "600",
  },
  inputContainer: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputWrapper: { paddingVertical: 8 },
  inputLabel: { fontSize: 12, color: "#8E8E93", marginBottom: 4 },
  input: {
    fontSize: 16,
    color: "#FFF",
    padding: 0,
    ...(Platform.OS === "web" && {
      outlineStyle: "none",
      boxShadow: "none",
      backgroundColor: "transparent",
    }),
  },
  divider: { height: 1, backgroundColor: "#3A3A3C", marginVertical: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // Стиль для ошибки
  errorText: {
    color: "#FF453A",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
    textAlign: "left",
  },
  forgotPassword: { alignSelf: "flex-end", marginTop: 12, marginBottom: 24 },
  forgotPasswordText: { color: COLORS.primary, fontSize: 14 },
  registerLink: { alignItems: "center", marginTop: 24, marginBottom: 16 },
  registerLinkText: { color: "#8E8E93", fontSize: 14 },
  disclaimerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  disclaimerText: { color: COLORS.textMuted, fontSize: 12, marginLeft: 4 },
});

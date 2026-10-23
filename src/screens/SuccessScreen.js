import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import i18n from "../i18n";
import { COLORS } from "../theme/colors";

export const SuccessScreen = () => {
  const router = useRouter();
  const { plan, price } = useLocalSearchParams();

  const handleGoHome = () => {
    router.replace("/workshop");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={60} color="#FFF" />
        </View>

        <Text style={styles.title}>
          {i18n.t("success_title") || "Успешно!"}
        </Text>
        <Text style={styles.subtitle}>
          {i18n.t("success_subtitle") ||
            `Вы подписались на ${plan} за ${price}`}
        </Text>

        <CustomButton
          title={i18n.t("go_home") || "Перейти на главную"}
          variant="primary"
          onPress={handleGoHome}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: { fontSize: 32, fontWeight: "600", color: "#FFF", marginBottom: 12 },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
});

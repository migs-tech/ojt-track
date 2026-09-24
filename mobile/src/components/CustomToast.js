// Toast shown at the top of the screen (see lib/notify.js).
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, space } from "@/ui/theme";

const tones = {
  success: { icon: "checkmark-circle", color: colors.success },
  error: { icon: "alert-circle", color: colors.danger },
  info: { icon: "information-circle", color: colors.primary },
};

export default function CustomToast({ text1, text2, type }) {
  const tone = tones[type] || tones.success;
  return (
    <View style={styles.toast} accessibilityRole="alert">
      <Ionicons name={tone.icon} size={22} color={tone.color} />
      <View style={styles.text}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    marginHorizontal: space.lg,
    alignSelf: "stretch",
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", color: colors.ink },
  message: { fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 2 },
});

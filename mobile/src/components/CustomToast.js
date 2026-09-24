import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { FontAwesome } from "@expo/vector-icons";

// 🔹 Custom rolling + pop keyframes
const rollInPop = {
  0: { opacity: 0, transform: [{ rotate: "0deg" }, { scale: 0 }] },
  0.5: { opacity: 1, transform: [{ rotate: "360deg" }, { scale: 1.3 }] },
  1: { opacity: 1, transform: [{ rotate: "360deg" }, { scale: 1 }] },
};

export default function CustomToast({ text1, text2, type }) {
  const icon =
    type === "error"
      ? { name: "times-circle", color: "#FF4C4C" }
      : type === "info"
      ? { name: "info-circle", color: "#3498db" }
      : { name: "check-circle", color: "#4BB543" }; // default success

  return (
    <Animatable.View
      key={Date.now()}
      animation="slideInLeft"
      duration={600}
      style={styles.toastContainer}
    >
      <Animatable.View animation={rollInPop} duration={1000} iterationCount={1}>
        <FontAwesome name={icon.name} size={28} color={icon.color} />
      </Animatable.View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignSelf: "stretch",
  },
  textContainer: {
    marginLeft: 10,
    flexShrink: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  message: {
    fontSize: 14,
    color: "#555",
  },
});

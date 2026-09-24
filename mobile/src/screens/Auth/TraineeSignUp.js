// RegistrationScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const FloatingInput = ({ label, icon, secureTextEntry }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");
  const animatedIsFocused = new Animated.Value(value === "" ? 0 : 1);

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value !== "" ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: 45,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: isFocused ? "#1E3A8A" : "#9CA3AF",
    backgroundColor: "#fff",
    paddingHorizontal: 4,
  };

  return (
    <View style={styles.inputContainer}>
      {icon}
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={styles.textInput}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={setValue}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

export default function TraineeSignUp() {
  return (
    <LinearGradient
      colors={["#1E3A8A", "#3B82F6"]}
      style={styles.container}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Trainee Registration</Text>
          <Text style={styles.subtitle}>
            Create your account to start tracking
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.welcome}>Welcome, Trainee!</Text>

          <FloatingInput
            label="Username"
            icon={
              <Ionicons
                name="person-outline"
                size={20}
                color="#6B7280"
                style={styles.icon}
              />
            }
          />

          <FloatingInput
            label="Email"
            icon={
              <MaterialIcons
                name="email"
                size={20}
                color="#6B7280"
                style={styles.icon}
              />
            }
          />

          <FloatingInput
            label="Password"
            secureTextEntry
            icon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#6B7280"
                style={styles.icon}
              />
            }
          />

          <FloatingInput
            label="Confirm Password"
            secureTextEntry
            icon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#6B7280"
                style={styles.icon}
              />
            }
          />

          <TouchableOpacity style={styles.registerButton}>
            <LinearGradient
              colors={["#1E3A8A", "#2563EB"]}
              style={styles.registerGradient}
            >
              <Text style={styles.registerText}>Register as Trainee</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.goBack}>
            <Ionicons name="arrow-back-outline" size={18} color="#374151" />
            <Text style={styles.goBackText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: 70,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#E5E7EB",
    marginTop: 6,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    flex: 1,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 120,
  },
  welcome: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1F2937",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    height: 55,
    position: "relative",
  },
  icon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingTop: 18,
  },
  registerButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  registerGradient: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 12,
  },
  registerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  goBack: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
  },
  goBackText: {
    marginLeft: 6,
    color: "#374151",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

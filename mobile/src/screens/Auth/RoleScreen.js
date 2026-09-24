import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");

// ------------------------------
// Role Card Component
// ------------------------------
function RoleCard({ role, icon, title, description, selected, onPress, delay, gradient }) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotate.value}deg` }
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { stiffness: 400, damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 400, damping: 15 });
    if (selected) {
      rotate.value = withSequence(
        withTiming(-2, { duration: 100 }),
        withTiming(2, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.card, selected && styles.selectedCard]}
        >
          {selected && (
            <LinearGradient
              colors={['rgba(32, 118, 204, 0.1)', 'rgba(32, 118, 204, 0.05)']}
              style={styles.selectedOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          
          <LinearGradient
            colors={selected ? gradient : ['#f1f5f9', '#f1f5f9']}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name={icon}
              size={36}
              color={selected ? "#fff" : "#64748b"}
            />
          </LinearGradient>

          <View style={styles.roleContent}>
            <View style={styles.roleHeader}>
              <Text style={[styles.roleTitle, selected && styles.selectedRoleTitle]}>
                {title}
              </Text>
              {selected && (
                <Animated.View entering={FadeInDown.springify()}>
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check" size={18} color="#fff" />
                  </View>
                </Animated.View>
              )}
            </View>
            <Text style={styles.roleDescription}>{description}</Text>
            
            {selected && (
              <Animated.View entering={FadeInUp.delay(100)} style={styles.selectedIndicator}>
                <View style={styles.selectedDot} />
                <Text style={styles.selectedText}>Selected</Text>
              </Animated.View>
            )}
          </View>

          {/* Corner accent */}
          {selected && (
            <View style={styles.cornerAccent}>
              <LinearGradient
                colors={gradient}
                style={styles.cornerAccentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ------------------------------
// Main Screen Component
// ------------------------------
export default function SignUpRoleScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);

  const handleSelect = (role) => {
    setSelected(role);
    setTimeout(() => {
      navigation.navigate("SupervisorSignUp", { role });
    }, 700);
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#e0f2fe', '#f8fafc']}
      style={styles.container}
    >
      {/* Animated background circles */}
      <Animated.View 
        entering={FadeInDown.delay(100).duration(1000)}
        style={styles.backgroundCircle1} 
      />
      <Animated.View 
        entering={FadeInUp.delay(200).duration(1000)}
        style={styles.backgroundCircle2} 
      />
      <View style={styles.backgroundCircle3} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <LinearGradient
              colors={['#2076cc', '#1e5a9e']}
              style={styles.headerIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="people-circle-outline" size={52} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>Choose your role to get started with OJT Track</Text>
        </Animated.View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          <RoleCard
            role="trainee"
            icon="person-outline"
            title="Trainee"
            description="For students and trainees tracking their OJT hours and progress"
            selected={selected === "trainee"}
            onPress={() => handleSelect("trainee")}
            delay={200}
            gradient={['#667eea', '#764ba2']}
          />

          <RoleCard
            role="supervisor"
            icon="school-outline"
            title="Supervisor"
            description="For teachers and supervisors monitoring and evaluating trainees"
            selected={selected === "supervisor"}
            onPress={() => handleSelect("supervisor")}
            delay={300}
            gradient={['#f093fb', '#f5576c']}
          />
        </View>

        {/* Info Box */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.infoBox}>
          <LinearGradient
            colors={['#dbeafe', '#eff6ff']}
            style={styles.infoBoxGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="information-circle" size={22} color="#2076cc" />
            </View>
            <Text style={styles.infoText}>
              Your role determines your dashboard features and permissions
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Back Button */}
        <Animated.View entering={FadeInUp.delay(500)}>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={styles.backButton}
          >
            <View style={styles.backButtonContent}>
              <Ionicons name="arrow-back" size={20} color="#64748b" />
              <Text style={styles.backText}>Back to Login</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

// ------------------------------
// Styles
// ------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundCircle1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#bfdbfe",
    top: -120,
    right: -120,
    opacity: 0.3,
  },
  backgroundCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#dbeafe",
    bottom: -80,
    left: -80,
    opacity: 0.4,
  },
  backgroundCircle3: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#93c5fd",
    top: "40%",
    right: -60,
    opacity: 0.2,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    paddingTop: 70,
    paddingBottom: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  headerIconWrapper: {
    marginBottom: 24,
  },
  headerIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2076cc",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 24,
  },
  cardsContainer: {
    width: "100%",
    maxWidth: 420,
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  selectedCard: {
    borderColor: "#2076cc",
    borderWidth: 3,
    shadowColor: "#2076cc",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleContent: {
    flex: 1,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  selectedRoleTitle: {
    color: "#2076cc",
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 21,
  },
  selectedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  selectedText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cornerAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    overflow: "hidden",
  },
  cornerAccentGradient: {
    width: 100,
    height: 100,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    top: -50,
    right: -50,
    opacity: 0.15,
  },
  infoBox: {
    width: "100%",
    maxWidth: 420,
    marginBottom: 23,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2076cc",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  infoBoxGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#2076cc",
  },
  infoIconContainer: {
    marginRight: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 21,
    fontWeight: "500",
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 26,
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  backText: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "600",
  },
});
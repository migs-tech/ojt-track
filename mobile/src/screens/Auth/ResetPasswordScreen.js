import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/store/useAuthStore";

const FloatingInput = ({
  label,
  icon,
  secureTextEntry,
  value,
  onChangeText,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedIsFocused = new Animated.Value(value === "" ? 0 : 1);
  const shakeAnimation = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value !== "" ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const labelStyle = {
    position: "absolute",
    left: 52,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error ? "#ef4444" : isFocused ? "#2076cc" : "#94a3b8",
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    fontWeight: isFocused || value ? "600" : "400",
  };

  return (
    <View style={styles.inputWrapper}>
      <Animated.View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          { transform: [{ translateX: shakeAnimation }] },
        ]}
      >
        <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
          {icon}
        </View>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <TextInput
          style={styles.textInput}
          secureTextEntry={secureTextEntry && !showPassword}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color={isFocused ? "#2076cc" : "#94a3b8"}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={12} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return null;
    const length = password.length;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    
    const score = [hasNumber, hasSpecial, hasUpper, hasLower].filter(Boolean).length;
    
    if (length < 6) return { text: 'Too short', color: '#ef4444', width: '25%' };
    if (score <= 1) return { text: 'Weak', color: '#f59e0b', width: '40%' };
    if (score === 2) return { text: 'Fair', color: '#eab308', width: '60%' };
    if (score === 3) return { text: 'Good', color: '#84cc16', width: '80%' };
    return { text: 'Strong', color: '#22c55e', width: '100%' };
  };

  const strength = getStrength();
  if (!strength) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBar}>
        <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
      </View>
      <Text style={[styles.strengthText, { color: strength.color }]}>{strength.text}</Text>
    </View>
  );
};

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { text: 'At least 6 characters', met: password.length >= 6 },
    { text: 'Contains a number', met: /\d/.test(password) },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
  ];

  if (!password) return null;

  return (
    <View style={styles.requirementsContainer}>
      <Text style={styles.requirementsTitle}>Password Requirements:</Text>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementRow}>
          <Ionicons 
            name={req.met ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color={req.met ? "#22c55e" : "#cbd5e1"} 
          />
          <Text style={[styles.requirementText, req.met && styles.requirementMet]}>
            {req.text}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default function ResetPasswordScreen({ route, navigation }) {
  const email = route?.params?.email || "";
  const { resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await resetPassword({
        email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      
      if (response.success) {
        setSuccessMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);
      } else {
        setErrors({ general: response.message || "Failed to reset password" });
      }
    } catch (error) {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.password && formData.confirmPassword && !loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#2076cc", "#3b82f6"]} style={styles.gradient}>
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <View style={styles.iconGlow} />
              <Ionicons name="lock-closed" size={40} color="#fff" />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Create a new secure password</Text>
            <View style={styles.emailBadge}>
              <Ionicons name="mail" size={16} color="#2076cc" />
              <Text style={styles.emailText}>{email}</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {successMessage ? (
              <Animated.View style={styles.successBox}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={32} color="#fff" />
                </View>
                <Text style={styles.successTitle}>Success!</Text>
                <Text style={styles.successMessage}>{successMessage}</Text>
                <ActivityIndicator color="#22c55e" size="small" style={styles.loader} />
              </Animated.View>
            ) : (
              <>
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcome}>Set New Password 🔐</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Choose a strong password to protect your account
                  </Text>
                </View>

                {/* General Error Message */}
                {errors.general && (
                  <View style={styles.generalErrorBox}>
                    <Feather name="alert-circle" size={18} color="#D97706" />
                    <Text style={styles.generalErrorText}>{errors.general}</Text>
                  </View>
                )}

                <FloatingInput
                  label="New Password"
                  secureTextEntry
                  icon={<Ionicons name="lock-closed-outline" size={22} color="#64748b" />}
                  value={formData.password}
                  onChangeText={(text) => updateField("password", text)}
                  error={errors.password}
                />

                {formData.password && (
                  <>
                    <PasswordStrength password={formData.password} />
                    <PasswordRequirements password={formData.password} />
                  </>
                )}

                <FloatingInput
                  label="Confirm Password"
                  secureTextEntry
                  icon={<Ionicons name="lock-closed-outline" size={22} color="#64748b" />}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField("confirmPassword", text)}
                  error={errors.confirmPassword}
                />

                {/* Security Info */}
                <View style={styles.securityInfo}>
                  <View style={styles.securityItem}>
                    <Ionicons name="shield-checkmark" size={18} color="#2076cc" />
                    <Text style={styles.securityText}>End-to-end encrypted</Text>
                  </View>
                  <View style={styles.securityItem}>
                    <Ionicons name="lock-closed" size={18} color="#2076cc" />
                    <Text style={styles.securityText}>Secure password storage</Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !isFormValid && styles.buttonDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={!isFormValid}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#2076cc", "#3b82f6"]}
                    style={styles.submitGradient}
                  >
                    {loading ? (
                      <View style={styles.buttonLoading}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.submitText}>Resetting Password...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.submitText}>Reset Password</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.navigate("Login")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={18} color="#64748b" />
                  <Text style={styles.backText}>Back to Login</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 100,
    left: -40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 50 : 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    opacity: 0.15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#e0f2fe",
    textAlign: "center",
    opacity: 0.95,
    marginBottom: 12,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  welcomeSection: {
    marginBottom: 28,
    alignItems: "center",
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  generalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#D97706',
  },
  generalErrorText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    backgroundColor: "#fff",
    height: 60,
    position: "relative",
  },
  inputFocused: {
    borderColor: "#2076cc",
    backgroundColor: "#f8fafc",
    shadowColor: "#2076cc",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  iconContainer: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    height: '100%',
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(32, 118, 204, 0.05)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    paddingTop: 16,
    paddingRight: 12,
    paddingVertical: 8,
  },
  eyeButton: {
    padding: 14,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -12,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginRight: 12,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "500",
  },
  requirementsContainer: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 13,
    color: '#94a3b8',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#22c55e',
    fontWeight: '500',
  },
  securityInfo: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#2076cc',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  securityText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  submitButton: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2076cc",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  backText: {
    marginLeft: 8,
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#22c55e',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 10,
  },
  bottomSpace: {
    height: 30,
  },
});
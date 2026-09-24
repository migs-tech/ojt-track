import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/store/useAuthStore";

const FloatingInput = ({ label, icon, value, onChangeText, error }) => {
  const [isFocused, setIsFocused] = useState(false);
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
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
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

const OTPInput = ({ value, onChange }) => {
  const inputs = Array(6).fill(0);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const handleChange = (text, index) => {
    const newOtp = value.split('');
    newOtp[index] = text.slice(-1);
    onChange(newOtp.join(''));
    
    // Auto-focus next input
    if (text && index < 5) {
      const nextInput = inputs[index + 1];
      // Focus next input logic would go here
    }
  };

  return (
    <View style={styles.otpContainer}>
      {inputs.map((_, index) => (
        <View
          key={index}
          style={[
            styles.otpBox,
            focusedIndex === index && styles.otpBoxFocused,
            value[index] && styles.otpBoxFilled,
          ]}
        >
          <Text style={styles.otpText}>{value[index] || ""}</Text>
        </View>
      ))}
      <TextInput
        style={styles.hiddenOtpInput}
        value={value}
        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, "").slice(0, 6))}
        keyboardType="numeric"
        maxLength={6}
        onFocus={() => setFocusedIndex(value.length)}
        onBlur={() => setFocusedIndex(null)}
        autoFocus
      />
    </View>
  );
};

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword, verifyOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setEmailError("");
    setSuccessMessage("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoadingEmail(true);
    const res = await forgotPassword(email);
    setLoadingEmail(false);

    if (res.success) {
      setSuccessMessage("OTP sent successfully!");
      setTimeout(() => {
        setShowOtpModal(true);
        setSuccessMessage("");
      }, 1000);
    } else {
      setEmailError(res.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerify = async () => {
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Please enter a complete 6-digit OTP");
      return;
    }

    setLoadingOtp(true);
    const res = await verifyOtp({ email, otp });
    setLoadingOtp(false);

    if (res.success) {
      setShowOtpModal(false);
      navigation.navigate("ResetPassword", { email });
    } else {
      setOtpError(res.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setLoadingOtp(true);
    const res = await forgotPassword(email);
    setLoadingOtp(false);

    if (res.success) {
      setOtpError(""); // Clear any errors
      // Show success briefly
      setTimeout(() => setOtpError(""), 2000);
    } else {
      setOtpError("Failed to resend OTP");
    }
  };

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
              <Ionicons name="key" size={40} color="#fff" />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Don't worry! Enter your email and we'll send you an OTP to reset your password
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcome}>Password Recovery 🔐</Text>
              <Text style={styles.welcomeSubtitle}>
                We'll help you get back into your account
              </Text>
            </View>

            {/* Success Message */}
            {successMessage && (
              <Animated.View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text style={styles.successText}>{successMessage}</Text>
              </Animated.View>
            )}

            <FloatingInput
              label="Email Address"
              icon={<MaterialIcons name="email" size={22} color="#64748b" />}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
              error={emailError}
            />

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#2076cc" />
              <Text style={styles.infoText}>
                We'll send a 6-digit verification code to your email
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!email || loadingEmail) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!email || loadingEmail}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#2076cc", "#3b82f6"]}
                style={styles.submitGradient}
              >
                {loadingEmail ? (
                  <View style={styles.buttonLoading}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.submitText}>Sending OTP...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.submitText}>Send OTP</Text>
                    <Ionicons name="send" size={18} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.goBack}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#64748b" />
              <Text style={styles.goBackText}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </LinearGradient>

      {/* OTP Modal */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Animated.View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="mail" size={36} color="#2076cc" />
                </View>
                <Text style={styles.modalTitle}>Verify Your Email</Text>
                <Text style={styles.modalSubtitle}>
                  We've sent a 6-digit code to
                </Text>
                <Text style={styles.emailBadge}>{email}</Text>
              </View>

              {/* OTP Input */}
              <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>Enter Code</Text>
                <OTPInput value={otp} onChange={setOtp} />
              </View>

              {/* Error Message */}
              {otpError && (
                <View style={styles.otpErrorBox}>
                  <Feather name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.otpErrorText}>{otpError}</Text>
                </View>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (otp.length !== 6 || loadingOtp) && styles.buttonDisabled,
                ]}
                onPress={handleVerify}
                disabled={otp.length !== 6 || loadingOtp}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#2076cc", "#3b82f6"]}
                  style={styles.verifyGradient}
                >
                  {loadingOtp ? (
                    <View style={styles.buttonLoading}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.verifyText}>Verifying...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.verifyText}>Verify Code</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={loadingOtp}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowOtpModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    paddingHorizontal: 30,
    lineHeight: 22,
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
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
    gap: 10,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '500',
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#2076cc',
    gap: 12,
  },
  infoText: {
    flex: 1,
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
  goBack: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  goBackText: {
    marginLeft: 8,
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
  bottomSpace: {
    height: 30,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e293b",
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 8,
    textAlign: 'center',
  },
  emailBadge: {
    fontSize: 14,
    color: "#2076cc",
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  otpSection: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  otpBoxFocused: {
    borderColor: '#2076cc',
    backgroundColor: '#fff',
  },
  otpBoxFilled: {
    borderColor: '#2076cc',
    backgroundColor: '#eff6ff',
  },
  otpText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  hiddenOtpInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  otpErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  otpErrorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  verifyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: "#2076cc",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  verifyGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#64748b',
  },
  resendLink: {
    fontSize: 14,
    color: '#2076cc',
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
});
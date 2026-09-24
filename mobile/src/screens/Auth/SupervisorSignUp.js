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
import DateTimePicker from '@react-native-community/datetimepicker';


const FloatingInput = ({
  label,
  icon,
  secureTextEntry,
  value,
  onChangeText,
  error,
  ...props
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
          {...props}
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

export default function SupervisorSignUp({ navigation, route }) {
  const { role } = route.params;
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    course: "",
    started_at: "",
    company: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const userRole = role === "trainee" ? 1 : role === "supervisor" ? 2 : null;
  const [showDatePicker, setShowDatePicker] = useState(false);


  useEffect(() => {
    const fields = Object.values(formData);
    const filledFields = fields.filter(field => field.trim() !== "").length;
    setFormProgress((filledFields / fields.length) * 100);
  }, [formData]);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

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

    if (userRole === 1) {
      if (!formData.course) newErrors.course = "Course is required";
      if (!formData.started_at.trim()) newErrors.started_at = "Start date is required";
    } else {
      if (!formData.company.trim()) newErrors.company = "Company name is required";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const data = {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      course: formData.course,
      started_at: formData.started_at,
      company: formData.company,
      userRole: userRole,
    };
    try {
      const response = await register(data);
      if (response.success) {
        setSuccessModalVisible(true);
      } else {
        setErrors({ general: response.message || "Registration failed" });
      }
    } catch (error) {
      setErrors({ general: "Something went wrong. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  const progressColor = formProgress < 50 ? '#ef4444' : formProgress < 100 ? '#f59e0b' : '#22c55e';

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
              <Ionicons
                name={userRole === 1 ? "person" : "school"}
                size={40}
                color="#fff"
              />
            </View>
            <Text style={styles.title}>
              {userRole === 1 ? "Trainee" : "Supervisor"} Registration
            </Text>
            <Text style={styles.subtitle}>
              Create your account to {userRole === 1 ? "start tracking hours" : "monitor trainees"}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <Animated.View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${formProgress}%`, backgroundColor: progressColor }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(formProgress)}% Complete</Text>
            </View>

            <View style={styles.welcomeSection}>
              <Text style={styles.welcome}>
                Welcome, {userRole === 1 ? "Trainee" : "Supervisor"}! 👋
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Fill in your details to get started
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
              label="Username"
              icon={<Ionicons name="person-outline" size={22} color="#64748b" />}
              value={formData.username}
              onChangeText={(text) => updateField("username", text)}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FloatingInput
              label="Email Address"
              icon={<MaterialIcons name="email" size={22} color="#64748b" />}
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FloatingInput
              label="Password"
              secureTextEntry
              icon={<Ionicons name="lock-closed-outline" size={22} color="#64748b" />}
              value={formData.password}
              onChangeText={(text) => updateField("password", text)}
              error={errors.password}
            />

            {formData.password && (
              <PasswordStrength password={formData.password} />
            )}

            <FloatingInput
              label="Confirm Password"
              secureTextEntry
              icon={<Ionicons name="lock-closed-outline" size={22} color="#64748b" />}
              value={formData.confirmPassword}
              onChangeText={(text) => updateField("confirmPassword", text)}
              error={errors.confirmPassword}
            />
            
            {userRole === 1 ? (
            <>
              {/* Trainee Fields */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>Course</Text>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "#e2e8f0",
                    borderRadius: 14,
                    backgroundColor: "#fff",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      setFormData({ ...formData, course: "BSIT" })
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: formData.course === "BSIT" ? "#1e293b" : "#94a3b8",
                      }}
                    >
                      {formData.course === "BSIT" ? "BSIT" : "Select: BSIT"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.course && (
                  <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                    {errors.course}
                  </Text>
                )}
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>Started Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#e2e8f0",
                    borderRadius: 14,
                    backgroundColor: "#fff",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <Ionicons name="calendar-outline" size={22} color="#64748b" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16, color: formData.started_at ? "#1e293b" : "#94a3b8" }}>
                    {formData.started_at || "Select Date"}
                  </Text>
                </TouchableOpacity>

                {errors.started_at && (
                  <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>{errors.started_at}</Text>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={formData.started_at ? new Date(formData.started_at) : new Date()}
                    mode="date"
                    display="calendar"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
                        setFormData({ ...formData, started_at: formattedDate });
                      }
                    }}
                  />
                )}
              </View>
            </>
          ) : (
            <>
              {/* Supervisor Field */}
              <FloatingInput
                label="Company"
                icon={<Ionicons name="business-outline" size={22} color="#64748b" />}
                value={formData.company}
                onChangeText={(text) => updateField("company", text)}
                error={errors.company}
              />
            </>
          )}
            {/* Feature Highlights */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconCircle}>
                  <Ionicons name="shield-checkmark" size={18} color="#2076cc" />
                </View>
                <Text style={styles.featureText}>Secure & encrypted</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconCircle}>
                  <Ionicons name="flash" size={18} color="#2076cc" />
                </View>
                <Text style={styles.featureText}>Quick setup</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconCircle}>
                  <Ionicons name="time" size={18} color="#2076cc" />
                </View>
                <Text style={styles.featureText}>Real-time tracking</Text>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.buttonDisabled,
                formProgress === 100 && !loading && styles.registerButtonReady,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  formProgress === 100 && !loading
                    ? ["#16a34a", "#22c55e"]
                    : ["#2076cc", "#3b82f6"]
                }
                style={styles.registerGradient}
              >
                {loading ? (
                  <View style={styles.buttonLoading}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.registerText}>Creating account...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.registerText}>
                      Register as {userRole === 1 ? "Trainee" : "Supervisor"}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Go Back */}
            <TouchableOpacity
              style={styles.goBack}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#64748b" />
              <Text style={styles.goBackText}>Back to role selection</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </LinearGradient>

      {/* Success Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconGlow} />
              <Ionicons name="checkmark-circle" size={70} color="#22c55e" />
            </View>
            <Text style={styles.modalTitle}>Registration Successful! 🎉</Text>
            <Text style={styles.modalMessage}>
              Your account has been created successfully. You can now log in and start using the app.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.navigate("Login");
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#2076cc", "#3b82f6"]}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Go to Login</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  },
  formCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'right',
  },
  welcomeSection: {
    marginBottom: 24,
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
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButton: {
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
    opacity: 0.7,
  },
  registerButtonReady: {
    shadowColor: "#16a34a",
  },
  registerGradient: {
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
  registerText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  successIconGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#22c55e',
    opacity: 0.2,
    top: 0,
    left: 0,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1e293b",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  modalButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: "#2076cc",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
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
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

const FloatingInput = ({ 
  label, 
  icon, 
  secureTextEntry, 
  value, 
  onChangeText, 
  error,
  keyboardType = "default",
  autoCapitalize = "none",
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

  const getStrength = () => {
    if (!value || !secureTextEntry) return null;
    const length = value.length;
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    
    const score = [hasNumber, hasSpecial, hasUpper, hasLower].filter(Boolean).length;
    
    if (length < 6) return { text: 'Too short', color: '#ef4444', width: '25%' };
    if (score <= 1) return { text: 'Weak', color: '#f59e0b', width: '40%' };
    if (score === 2) return { text: 'Fair', color: '#eab308', width: '60%' };
    if (score === 3) return { text: 'Good', color: '#84cc16', width: '80%' };
    return { text: 'Strong', color: '#22c55e', width: '100%' };
  };

  const strength = getStrength();

  return (
    <View style={styles.inputWrapper}>
      <Animated.View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
        { transform: [{ translateX: shakeAnimation }] }
      ]}>
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
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
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
      
      {/* Password Strength Indicator */}
      {secureTextEntry && value && label === "Password" && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            <View style={[styles.strengthFill, { width: strength?.width, backgroundColor: strength?.color }]} />
          </View>
          <Text style={[styles.strengthText, { color: strength?.color }]}>{strength?.text}</Text>
        </View>
      )}
      
      {error ? (
        <Animated.View style={styles.errorContainer} entering={{ duration: 200 }}>
          <Feather name="alert-circle" size={12} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      ) : null}
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

export default function SupervisorSignUp() {
  const route = useRoute();
  const navigation = useNavigation();
  const role = route.params?.role || "trainee";
  const isTrainee = role === "trainee";

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
  const [showRequirements, setShowRequirements] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    // Calculate form completion progress
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
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log("Registration successful", formData);
      // Navigate to success screen or login
    }, 2000);
  };

  const progressColor = formProgress < 50 ? '#ef4444' : formProgress < 100 ? '#f59e0b' : '#22c55e';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative Background Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <View style={styles.iconGlow} />
            <Ionicons
              name={isTrainee ? "person" : "school"}
              size={40}
              color="#fff"
            />
          </View>
          <Text style={styles.title}>
            {isTrainee ? "Trainee" : "Supervisor"} Registration
          </Text>
          <Text style={styles.subtitle}>
            {isTrainee
              ? "Create your account to start tracking hours"
              : "Create your account to monitor trainees"}
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
              Welcome, {isTrainee ? "Trainee" : "Supervisor"}! 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Fill in your details to get started on your journey
            </Text>
          </View>

          <View style={styles.formContent}>
            <FloatingInput
              label="Username"
              icon={
                <Ionicons name="person-outline" size={22} color="#64748b" />
              }
              value={formData.username}
              onChangeText={(text) => updateField("username", text)}
              error={errors.username}
            />

            <FloatingInput
              label="Email Address"
              icon={<MaterialIcons name="email" size={22} color="#64748b" />}
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              error={errors.email}
              keyboardType="email-address"
            />

            <FloatingInput
              label="Password"
              secureTextEntry
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#64748b"
                />
              }
              value={formData.password}
              onChangeText={(text) => {
                updateField("password", text);
                setShowRequirements(true);
              }}
              error={errors.password}
            />

            {showRequirements && <PasswordRequirements password={formData.password} />}

            <FloatingInput
              label="Confirm Password"
              secureTextEntry
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#64748b"
                />
              }
              value={formData.confirmPassword}
              onChangeText={(text) => updateField("confirmPassword", text)}
              error={errors.confirmPassword}
            />

            {/* Trainee-specific fields */}
            {isTrainee ? (
              <>
                {/* Course Dropdown */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ marginLeft: 10, marginBottom: 6, fontWeight: '600', color: '#1e293b' }}>
                    Select Course
                  </Text>
                  <View style={[styles.inputContainer, { height: 60 }]}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="school-outline" size={22} color="#64748b" />
                    </View>
                    <TextInput
                      style={[styles.textInput]}
                      value={formData.course}
                      placeholder="Choose BSIT or BSCE"
                      onChangeText={(text) => updateField("course", text)}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={() => updateField("course", "BSIT")}
                      style={{
                        backgroundColor: formData.course === "BSIT" ? "#2076cc" : "#e2e8f0",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: formData.course === "BSIT" ? "#fff" : "#1e293b", fontWeight: '600' }}>BSIT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => updateField("course", "BSCE")}
                      style={{
                        backgroundColor: formData.course === "BSCE" ? "#2076cc" : "#e2e8f0",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: formData.course === "BSCE" ? "#fff" : "#1e293b", fontWeight: '600' }}>BSCE</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Started At */}
                <FloatingInput
                  label="Started At (Date)"
                  icon={<Ionicons name="calendar-outline" size={22} color="#64748b" />}
                  value={formData.started_at}
                  onChangeText={(text) => updateField("started_at", text)}
                  error={errors.started_at}
                  keyboardType="default"
                />
              </>
            ) : (
              <>
                {/* Company (for non-trainee roles) */}
                <FloatingInput
                  label="Company"
                  icon={<Ionicons name="business-outline" size={22} color="#64748b" />}
                  value={formData.company}
                  onChangeText={(text) => updateField("company", text)}
                  error={errors.company}
                />
              </>
            )}

            {/* Feature Cards */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What you'll get:</Text>
              <View style={styles.featureRow}>
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="time-outline" size={20} color="#2076cc" />
                  </View>
                  <Text style={styles.featureText}>Real-time tracking</Text>
                </View>
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#2076cc" />
                  </View>
                  <Text style={styles.featureText}>Secure data</Text>
                </View>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="analytics-outline" size={20} color="#2076cc" />
                  </View>
                  <Text style={styles.featureText}>Detailed reports</Text>
                </View>
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="notifications-outline" size={20} color="#2076cc" />
                  </View>
                  <Text style={styles.featureText}>Instant alerts</Text>
                </View>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Ionicons name="information-circle-outline" size={16} color="#64748b" />
              <Text style={styles.termsText}>
                By registering, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton, 
                loading && styles.buttonDisabled,
                formProgress === 100 && styles.registerButtonReady
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.buttonLoading}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.registerText}>Creating your account...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.registerText}>
                    Register as {isTrainee ? "Trainee" : "Supervisor"}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Go Back Link */}
            <TouchableOpacity 
              style={styles.goBack} 
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={18} color="#64748b" />
              <Text style={styles.goBackText}>Back to role selection</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2076cc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
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
  formContent: {
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
    marginTop: 8,
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
    marginBottom: 16,
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
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
    textAlign: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
    lineHeight: 18,
  },
  termsLink: {
    color: '#2076cc',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: "#2076cc",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#2076cc",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  registerButtonReady: {
    backgroundColor: '#16a34a',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  registerText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginRight: 8,
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
    height: 40,
  },
});
import { useAuth } from '@/store/useAuthStore';
import { Feather, FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Image,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [rememberMe, setRememberMe] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const { login } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // new states for error handling
  const [usernameError, setUsernameError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [loginError, setLoginError] = React.useState('');

  React.useEffect(() => {
    const loadCredentials = async () => {
      const rememberedEmail = await SecureStore.getItemAsync('rememberedEmail');
      const rememberedPassword = await SecureStore.getItemAsync('rememberedPassword');
      if (rememberedEmail && rememberedPassword) {
        setUsername(rememberedEmail);
        setPassword(rememberedPassword);
        setRememberMe(true);
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    let valid = true;
    setUsernameError('');
    setPasswordError('');
    setLoginError('');

    if (!username) {
      setUsernameError('Username is required');
      valid = false;
    }
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }
    if (!valid) return;

    try {
      setLoading(true);
      const result = await login(username, password);
      if (rememberMe) {
        await SecureStore.setItemAsync('rememberedEmail', username);
        await SecureStore.setItemAsync('rememberedPassword', password);
      } else {
        await SecureStore.deleteItemAsync('rememberedEmail');
        await SecureStore.deleteItemAsync('rememberedPassword');
      }
    } catch (error) {
      setLoginError(error.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#2076cc']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>OJT Track</Text>
          <Text style={styles.subtitle}>Automated Attendance Monitoring</Text>
        </Animated.View>

        {/* Animated Card */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.welcome}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>
          </View>

          {/* Login error */}
          {loginError ? (
            <Animated.View entering={FadeInUp} style={styles.loginErrorBox}>
              <View style={styles.loginErrorRow}>
                <Feather
                  name="alert-circle"
                  size={18}
                  color="#b45309"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            </Animated.View>
          ) : null}

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <View style={[
              styles.inputRow,
              usernameError && styles.inputError
            ]}>
              <FontAwesome name="user" size={20} color="#666" style={styles.icon} />
              <TextInput
                placeholder="Enter your username"
                placeholderTextColor="#999"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            {usernameError ? (
              <View style={styles.errorRow}>
                <Feather name="alert-circle" size={12} color="#ef4444" />
                <Text style={styles.errorInputText}>{usernameError}</Text>
              </View>
            ) : null}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={[
              styles.inputRow,
              passwordError && styles.inputError
            ]}>
              <Feather name="lock" size={20} color="#666" style={styles.icon} />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#999"
                style={styles.input}
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                onPress={() => setPasswordVisible(!passwordVisible)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={passwordVisible ? 'eye' : 'eye-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <View style={styles.errorRow}>
                <Feather name="alert-circle" size={12} color="#ef4444" />
                <Text style={styles.errorInputText}>{passwordError}</Text>
              </View>
            ) : null}
          </View>

          {/* Remember & Forgot */}
          <View style={styles.rememberForgotRow}>
            <TouchableOpacity 
              style={styles.remember}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                rememberMe && styles.checkboxActive
              ]}>
                {rememberMe && (
                  <Feather name="check" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin} 
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? ['#94a3b8', '#94a3b8'] : ['#2076cc', '#1e5a9e']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <Feather name="arrow-right" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUpRoleScreen')}>
              <Text style={styles.signupLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer */}
        <Text style={styles.footer}>© 2024 OJT Track. All rights reserved.</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? 20 : 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10b981',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2076cc',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 28,
    borderRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  cardHeader: {
    marginBottom: 24,
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
    gap: 4,
  },
  errorInputText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
  },
  loginErrorBox: {
    backgroundColor: '#fef3c7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  loginErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2076cc',
    borderColor: '#2076cc',
  },
  rememberText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  forgotText: {
    color: '#2076cc',
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#2076cc',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    color: '#2076cc',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
  },
});
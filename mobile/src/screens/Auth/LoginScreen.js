// Sign in for trainees and supervisors.
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from '@/lib/secureStore';
import { useAuth } from '@/store/useAuthStore';
import AuthLayout from '@/ui/AuthLayout';
import { Button, Field, Notice, T, colors, space } from '@/ui';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowHint, setSlowHint] = useState(false);

  // Only the username is remembered; passwords are never stored on the phone.
  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync('rememberedEmail');
      // Remove passwords saved by older versions of the app
      await SecureStore.deleteItemAsync('rememberedPassword');
      if (saved) {
        setUsername(saved);
        setRemember(true);
      }
    })();
  }, []);

  const submit = async () => {
    const e = {};
    if (!username.trim()) e.username = 'Enter your username or email.';
    if (!password) e.password = 'Enter your password.';
    setErrors(e);
    setLoginError('');
    if (Object.keys(e).length) return;

    // The free server can take up to a minute to wake up; say so instead of looking stuck.
    const slowTimer = setTimeout(() => setSlowHint(true), 6000);
    setLoading(true);
    try {
      if (remember) await SecureStore.setItemAsync('rememberedEmail', username.trim());
      else await SecureStore.deleteItemAsync('rememberedEmail');
      await login(username, password);
    } catch (err) {
      setLoginError(err?.message || 'Sign-in failed. Please try again.');
    } finally {
      clearTimeout(slowTimer);
      setSlowHint(false);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      logo
      title="Sign in"
      subtitle="Use the account you created as a trainee or supervisor."
      footer={
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <T v="body" style={{ color: colors.muted }}>New to OJT Track?</T>
          <Pressable onPress={() => navigation.navigate('SignUpRoleScreen')} hitSlop={8}>
            <T v="bodyStrong" style={{ color: colors.primary }}>Create an account</T>
          </Pressable>
        </View>
      }
    >
      {loginError ? <Notice tone="danger" style={{ marginBottom: space.lg }}>{loginError}</Notice> : null}

      <Field
        label="Username or email"
        value={username}
        onChangeText={(t) => {
          setUsername(t);
          setErrors({ ...errors, username: '' });
        }}
        placeholder="e.g. juan.delacruz"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        returnKeyType="next"
        error={errors.username}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setErrors({ ...errors, password: '' });
        }}
        placeholder="Your password"
        secure
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={errors.password}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.xxl }}>
        <Pressable
          onPress={() => setRemember(!remember)}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: remember }}
        >
          <Ionicons name={remember ? 'checkbox' : 'square-outline'} size={22} color={remember ? colors.primary : colors.subtle} />
          <T v="body">Remember username</T>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8}>
          <T v="bodyStrong" style={{ color: colors.primary }}>Forgot password?</T>
        </Pressable>
      </View>

      <Button title="Sign in" onPress={submit} loading={loading} />
      {slowHint ? (
        <T v="caption" style={{ textAlign: 'center', marginTop: space.md }}>
          Waking up the server. This can take up to a minute.
        </T>
      ) : null}

      <T v="caption" style={{ textAlign: 'center', marginTop: space.xxl }}>
        Admins and coordinators use the OJT Track website instead.
      </T>
    </AuthLayout>
  );
}

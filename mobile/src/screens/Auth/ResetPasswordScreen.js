// Forgot password, step 3: choose a new password (needs the token from the code step).
import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/store/useAuthStore';
import AuthLayout from '@/ui/AuthLayout';
import { Button, Field, Notice, T, colors, space } from '@/ui';

export default function ResetPasswordScreen({ navigation, route }) {
  const email = route?.params?.email || '';
  const resetToken = route?.params?.resetToken || '';
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const e = {};
    if (password.length < 6) e.password = 'Use at least 6 characters.';
    if (confirm !== password) e.confirm = "The passwords don't match.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    const res = await resetPassword({
      email,
      reset_token: resetToken,
      password,
      confirm_password: confirm,
    });
    setLoading(false);
    if (res?.success) setDone(true);
    else setErrors({ general: res?.message || "Couldn't reset the password. Please try again." });
  };

  if (done) {
    return (
      <AuthLayout
        back={false}
        title="Password changed"
        subtitle="You can now sign in with your new password."
        footer={<Button title="Go to sign in" onPress={() => navigation.navigate('Login')} />}
      >
        <View style={{ alignItems: 'flex-start' }}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={email ? `For ${email}` : undefined}
      footer={<Button title="Change password" onPress={submit} loading={loading} />}
    >
      {errors.general ? <Notice tone="danger" style={{ marginBottom: space.lg }}>{errors.general}</Notice> : null}
      <Field
        label="New password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setErrors({});
        }}
        secure
        textContentType="newPassword"
        error={errors.password}
        hint="At least 6 characters."
        autoFocus
      />
      <Field
        label="Confirm new password"
        value={confirm}
        onChangeText={(t) => {
          setConfirm(t);
          setErrors({});
        }}
        secure
        textContentType="newPassword"
        error={errors.confirm}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <T v="caption">For your security, finish this within 15 minutes of entering the code.</T>
    </AuthLayout>
  );
}

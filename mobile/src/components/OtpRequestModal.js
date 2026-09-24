// Asks the trainee to confirm their password, then emails a 6-digit code for today's QR.
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/store/useAuthStore';
import { generateOtp } from '@/api/studentApi';
import { errorMessage } from '@/lib/api';
import { Button, Field, Notice, T, colors, radius, space } from '@/ui';

export default function OtpRequestModal({ visible, onClose, onSent }) {
  const { user, profile } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Start with the signed-in username filled in
  useEffect(() => {
    if (visible) {
      setUsername(profile?.username || user?.username || '');
      setPassword('');
      setError('');
    }
  }, [visible]);

  const send = async () => {
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await generateOtp({ username: username.trim(), password });
      if (res?.success) onSent?.(profile?.email || user?.email);
      else setError(res?.error || res?.message || "Couldn't send the code. Please try again.");
    } catch (e) {
      setError(errorMessage(e, "Couldn't send the code. Please try again."));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={sending ? undefined : onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <T v="title">Get today's code</T>
            <Pressable onPress={onClose} disabled={sending} hitSlop={12} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>
          <T v="caption" style={{ marginBottom: space.xl }}>
            Confirm it's you. We'll email a 6-digit code that you enter on the Attendance tab.
          </T>

          {error ? <Notice tone="danger" style={{ marginBottom: space.lg }}>{error}</Notice> : null}

          <Field label="Username or email" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
          <Field
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secure
            onSubmitEditing={send}
            returnKeyType="send"
            autoFocus
          />
          <Button title="Email me the code" onPress={send} loading={sending} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,24,39,0.45)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl + 4,
    borderTopRightRadius: radius.xl + 4,
    padding: space.xl,
    paddingBottom: space.xxxl,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.xs },
});

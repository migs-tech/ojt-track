// Asks the trainee to confirm their password, then emails them a 6-digit code for today's QR.
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/store/useAuthStore';
import { generateOtp } from '@/api/studentApi';
import { errorMessage } from '@/lib/api';

export default function OtpRequestModal({ visible, onClose, onSent }) {
  const { user, profile } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      if (res?.success) {
        onSent?.(profile?.email || user?.email);
      } else {
        setError(res?.error || res?.message || "Couldn't send the code. Please try again.");
      }
    } catch (e) {
      setError(errorMessage(e, "Couldn't send the code. Please try again."));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={sending ? undefined : onClose} />
        <View style={styles.card}>
          <TouchableOpacity style={styles.close} onPress={onClose} disabled={sending} hitSlop={12}>
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={28} color="#2076cc" />
          </View>
          <Text style={styles.title}>Get today's code</Text>
          <Text style={styles.subtitle}>
            Confirm it's you, and we'll email a 6-digit code. Enter it on the QR Code tab to show your QR.
          </Text>

          <Text style={styles.label}>Username or email</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Username or email"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#b91c1c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, sending && { opacity: 0.7 }]}
            onPress={send}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Email me the code</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
  },
  close: { position: 'absolute', top: 14, right: 14, zIndex: 1 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e6f0fc',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 6, marginBottom: 18, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingRight: 12,
    marginBottom: 14,
  },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { flex: 1, color: '#b91c1c', fontSize: 13 },
  button: {
    backgroundColor: '#2076cc',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

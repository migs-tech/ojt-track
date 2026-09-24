// Create an account as a trainee or a supervisor. (Coordinators sign up on the website.)
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '@/store/useAuthStore';
import AuthLayout from '@/ui/AuthLayout';
import { Button, Field, Notice, T, colors, radius, space } from '@/ui';

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function SignUpScreen({ navigation, route }) {
  const { register } = useAuth();
  const [role, setRole] = useState(route?.params?.role === 'supervisor' ? 'supervisor' : 'trainee');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: 'BSIT',
    started_at: '',
    company: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key] || errors.general) setErrors((e) => ({ ...e, [key]: '', general: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Choose a username.';
    else if (form.username.trim().length < 3) e.username = 'Use at least 3 characters.';
    if (!form.email.trim()) e.email = 'Enter your email.';
    else if (!emailOk(form.email.trim())) e.email = 'Enter a valid email address.';
    if (form.password.length < 6) e.password = 'Use at least 6 characters.';
    if (form.confirmPassword !== form.password) e.confirmPassword = "The passwords don't match.";
    if (role === 'trainee') {
      if (!form.course.trim()) e.course = 'Enter your course.';
      if (!form.started_at) e.started_at = 'Choose your OJT start date.';
    } else if (!form.company.trim()) {
      e.company = 'Enter your company or office.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    const res = await register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      course: role === 'trainee' ? form.course.trim() : '',
      started_at: role === 'trainee' ? form.started_at : '',
      company: form.company.trim(),
      userRole: role === 'trainee' ? 1 : 2,
    });
    setLoading(false);
    if (res?.success) setDone(true);
    else setErrors({ general: res?.message || 'Registration failed. Please try again.' });
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Coordinators and admins sign up on the OJT Track website."
      footer={<Button title="Create account" onPress={submit} loading={loading} />}
    >
      {/* Role */}
      <T v="label" style={{ marginBottom: 6 }}>I am a</T>
      <View style={styles.segment} accessibilityRole="radiogroup">
        {[
          ['trainee', 'Trainee'],
          ['supervisor', 'Supervisor'],
        ].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setRole(key)}
            style={[styles.segmentItem, role === key && styles.segmentActive]}
            accessibilityRole="radio"
            accessibilityState={{ selected: role === key }}
          >
            <T v="bodyStrong" style={{ color: role === key ? colors.ink : colors.muted }}>{label}</T>
          </Pressable>
        ))}
      </View>
      <T v="caption" style={{ marginTop: 6, marginBottom: space.xl }}>
        {role === 'trainee'
          ? 'You record attendance with a QR code and submit daily reports.'
          : 'You accept trainees, scan their QR codes and review their reports.'}
      </T>

      {errors.general ? <Notice tone="danger" style={{ marginBottom: space.lg }}>{errors.general}</Notice> : null}

      <Field label="Username" value={form.username} onChangeText={set('username')} autoCapitalize="none" autoCorrect={false} error={errors.username} />
      <Field label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" error={errors.email} hint="We send attendance codes and password resets here." />

      {role === 'trainee' ? (
        <>
          <Field label="Course" value={form.course} onChangeText={set('course')} autoCapitalize="characters" error={errors.course} />
          <T v="label" style={{ marginBottom: 6 }}>OJT start date</T>
          <Pressable
            onPress={() => setShowDate(true)}
            style={[styles.dateField, errors.started_at && { borderColor: colors.danger }]}
            accessibilityRole="button"
          >
            <T v="body" style={{ color: form.started_at ? colors.ink : colors.subtle, flex: 1 }}>
              {form.started_at ? format(new Date(form.started_at + 'T00:00:00'), 'MMMM d, yyyy') : 'Choose a date'}
            </T>
            <Ionicons name="calendar-outline" size={20} color={colors.muted} />
          </Pressable>
          {errors.started_at ? <T v="caption" style={{ color: colors.danger, marginTop: 6 }}>{errors.started_at}</T> : null}
          <View style={{ height: space.lg }} />
          <Field label="Company (optional)" value={form.company} onChangeText={set('company')} hint="Where you do your OJT, if you already know." />
        </>
      ) : (
        <Field label="Company or office" value={form.company} onChangeText={set('company')} error={errors.company} />
      )}

      <Field label="Password" value={form.password} onChangeText={set('password')} secure error={errors.password} hint="At least 6 characters." />
      <Field label="Confirm password" value={form.confirmPassword} onChangeText={set('confirmPassword')} secure error={errors.confirmPassword} />

      {showDate ? (
        <DateTimePicker
          value={form.started_at ? new Date(form.started_at + 'T00:00:00') : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, date) => {
            setShowDate(Platform.OS === 'ios');
            if (date) set('started_at')(format(date, 'yyyy-MM-dd'));
          }}
        />
      ) : null}

      <Modal visible={done} transparent animationType="fade" onRequestClose={() => navigation.navigate('Login')}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            <T v="title" style={{ marginTop: space.md }}>Account created</T>
            <T v="body" style={{ color: colors.muted, marginTop: space.xs, textAlign: 'center' }}>
              {role === 'trainee'
                ? 'Sign in, then choose your supervisor on the Home screen.'
                : 'Sign in to accept trainees and start scanning attendance.'}
            </T>
            <Button
              title="Go to sign in"
              onPress={() => {
                setDone(false);
                navigation.navigate('Login');
              }}
              style={{ alignSelf: 'stretch', marginTop: space.xl }}
            />
          </View>
        </View>
      </Modal>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: radius.md, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.45)', justifyContent: 'center', padding: space.xxl },
  dialog: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.xxl, alignItems: 'center' },
});

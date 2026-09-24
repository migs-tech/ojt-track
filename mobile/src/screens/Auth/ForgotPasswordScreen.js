// Forgot password, step 1 and 2: email -> 6-digit code. Step 3 is ResetPasswordScreen.
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/store/useAuthStore';
import AuthLayout from '@/ui/AuthLayout';
import { Button, Field, Notice, T, colors, space } from '@/ui';

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword, verifyOtp } = useAuth();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setError('');
    setInfo('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter the email address of your account.');
      return;
    }
    setLoading(true);
    const res = await forgotPassword(email.trim());
    setLoading(false);
    if (res?.success) {
      if (step === 'code') setInfo('We sent a new code.');
      setStep('code');
    } else {
      setError(res?.message || "Couldn't send the code. Please try again.");
    }
  };

  const checkCode = async () => {
    setError('');
    setInfo('');
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from the email.');
      return;
    }
    setLoading(true);
    const res = await verifyOtp({ email: email.trim(), otp: code });
    setLoading(false);
    if (res?.success) {
      // The server returns a one-time token that the reset step must send back.
      navigation.navigate('ResetPassword', { email: email.trim(), resetToken: res.reset_token });
    } else {
      setError(res?.message || 'That code is wrong or has expired.');
    }
  };

  if (step === 'email') {
    return (
      <AuthLayout
        title="Reset your password"
        subtitle="Enter the email on your account and we'll send you a 6-digit code."
        footer={<Button title="Send code" onPress={sendCode} loading={loading} />}
      >
        {error ? <Notice tone="danger" style={{ marginBottom: space.lg }}>{error}</Notice> : null}
        <Field
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setError('');
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={sendCode}
          autoFocus
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Check your email"
      subtitle={`If ${email.trim()} has an account, we sent a code to it. It expires in 15 minutes.`}
      footer={<Button title="Continue" onPress={checkCode} loading={loading} />}
    >
      {error ? <Notice tone="danger" style={{ marginBottom: space.lg }}>{error}</Notice> : null}
      {info ? <Notice tone="success" style={{ marginBottom: space.lg }}>{info}</Notice> : null}
      <Field
        label="6-digit code"
        value={code}
        onChangeText={(t) => {
          setCode(t.replace(/\D/g, ''));
          setError('');
        }}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        inputStyle={{ fontSize: 22, letterSpacing: 8 }}
        autoFocus
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable onPress={() => setStep('email')} hitSlop={8}>
          <T v="bodyStrong" style={{ color: colors.muted }}>Change email</T>
        </Pressable>
        <Pressable onPress={sendCode} hitSlop={8} disabled={loading}>
          <T v="bodyStrong" style={{ color: colors.primary }}>Send a new code</T>
        </Pressable>
      </View>
      <T v="caption" style={{ marginTop: space.xxl }}>Can't find it? Check your spam folder.</T>
    </AuthLayout>
  );
}

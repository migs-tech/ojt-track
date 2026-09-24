// Layout for the signed-out screens: back button, title, subtitle, and a scrolling form.
import React from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { T, colors, space } from './index';

export default function AuthLayout({ title, subtitle, back = true, logo, children, footer }) {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            {back && navigation.canGoBack() ? (
              <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Go back" style={styles.back}>
                <Ionicons name="arrow-back" size={24} color={colors.ink} />
              </Pressable>
            ) : null}
          </View>
          {logo ? (
            <Image source={require('../../assets/images/icon.png')} style={styles.logo} accessibilityLabel="OJT Track" />
          ) : null}
          <T v="display">{title}</T>
          {subtitle ? <T v="body" style={{ color: colors.muted, marginTop: space.sm }}>{subtitle}</T> : null}
          <View style={{ marginTop: space.xxl }}>{children}</View>
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1, paddingHorizontal: space.xxl, paddingBottom: space.xxl },
  topBar: { height: 56, justifyContent: 'center' },
  logo: { width: 56, height: 56, borderRadius: 14, marginBottom: space.xl },
  back: { width: 40, height: 40, justifyContent: 'center', marginLeft: -8, paddingLeft: 8 },
  footer: { paddingHorizontal: space.xxl, paddingVertical: space.lg, borderTopWidth: 1, borderTopColor: colors.divider },
});

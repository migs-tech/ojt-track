// Shared building blocks. Every screen is made from these, so the app looks like one product.
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, type, cardStyle } from './theme';

export { colors, space, radius, type, cardStyle };

/** Text in one of the type styles: <T v="title">Hello</T> */
export function T({ v = 'body', style, children, ...props }) {
  return (
    <Text style={[type[v], style]} {...props}>
      {children}
    </Text>
  );
}

/** Screen body with background, padding, optional scrolling and pull-to-refresh. */
export function Screen({ children, scroll = true, refreshing, onRefresh, padded = true, contentStyle, keyboard }) {
  const pad = padded ? { padding: space.lg, paddingBottom: space.xxxl } : null;
  let body = scroll ? (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[pad, { flexGrow: 1 }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screen, pad, contentStyle]}>{children}</View>
  );
  if (keyboard) {
    body = (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
      </KeyboardAvoidingView>
    );
  }
  return body;
}

/** Buttons: primary (filled), secondary (outlined), ghost (text only), danger. */
export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, style, small }) {
  const v = buttonVariants[variant] || buttonVariants.primary;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: pressed ? v.pressed : v.bg, borderColor: v.border },
        off && (variant === 'primary' || variant === 'danger') && { backgroundColor: '#C7CDD8', borderColor: '#C7CDD8' },
        off && variant !== 'primary' && variant !== 'danger' && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={v.fg} /> : null}
          <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: v.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const buttonVariants = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: '#fff', border: colors.primary },
  secondary: { bg: colors.surface, pressed: colors.primarySoft, fg: colors.primary, border: colors.primaryBorder },
  ghost: { bg: 'transparent', pressed: colors.primarySoft, fg: colors.primary, border: 'transparent' },
  danger: { bg: colors.danger, pressed: '#8F1B13', fg: '#fff', border: colors.danger },
  dangerOutline: { bg: colors.surface, pressed: colors.dangerSoft, fg: colors.danger, border: '#F1C4BF' },
};

/** Labeled text input with error text and an optional show/hide toggle for passwords. */
export function Field({ label, error, hint, secure, style, inputStyle, right, ...props }) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  return (
    <View style={[{ marginBottom: space.lg }, style]}>
      {label ? <T v="label" style={{ marginBottom: 6 }}>{label}</T> : null}
      <View
        style={[
          styles.field,
          focused && { borderColor: colors.primary },
          !!error && { borderColor: colors.danger },
          props.editable === false && { backgroundColor: colors.background },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.subtle}
          secureTextEntry={secure && hidden}
          autoCapitalize={secure ? 'none' : props.autoCapitalize}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[styles.fieldInput, props.multiline && { minHeight: 110, textAlignVertical: 'top', paddingTop: 12 }, inputStyle]}
          {...props}
        />
        {secure ? (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : (
          right || null
        )}
      </View>
      {error ? (
        <T v="caption" style={{ color: colors.danger, marginTop: 6 }}>{error}</T>
      ) : hint ? (
        <T v="caption" style={{ marginTop: 6 }}>{hint}</T>
      ) : null}
    </View>
  );
}

/** White card with a hairline border. Pass onPress to make it tappable. */
export function Card({ children, style, onPress, padded = true }) {
  const content = [cardStyle, padded && { padding: space.lg }, style];
  if (!onPress) return <View style={content}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [content, pressed && { backgroundColor: '#FAFBFC' }]}>
      {children}
    </Pressable>
  );
}

/** Heading above a group, with an optional action link on the right. */
export function Section({ title, action, onAction, children, style }) {
  return (
    <View style={[{ marginBottom: space.xl }, style]}>
      <View style={styles.sectionHeader}>
        <T v="overline">{title.toUpperCase()}</T>
        {action ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <T v="label" style={{ color: colors.primary }}>{action}</T>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** One line in a list: icon, title, subtitle and something on the right (chevron by default). */
export function Row({ icon, iconColor, title, subtitle, right, onPress, danger, last, left }) {
  const body = (
    <View style={[styles.row, !last && styles.rowBorder]}>
      {left || (icon ? <Ionicons name={icon} size={20} color={danger ? colors.danger : iconColor || colors.muted} /> : null)}
      <View style={{ flex: 1 }}>
        <T v="body" style={[{ color: danger ? colors.danger : colors.ink }]} numberOfLines={1}>{title}</T>
        {subtitle ? <T v="caption" numberOfLines={2}>{subtitle}</T> : null}
      </View>
      {right !== undefined ? right : onPress ? <Ionicons name="chevron-forward" size={18} color={colors.subtle} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { backgroundColor: colors.background }}>
      {body}
    </Pressable>
  );
}

/** Small status label. tone: neutral | primary | success | danger | warning */
export function Badge({ tone = 'neutral', children }) {
  const t = {
    neutral: [colors.background, colors.muted],
    primary: [colors.primarySoft, colors.primary],
    success: [colors.successSoft, colors.success],
    danger: [colors.dangerSoft, colors.danger],
    warning: [colors.warningSoft, colors.warning],
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t[0] }]}>
      <Text style={[styles.badgeText, { color: t[1] }]}>{children}</Text>
    </View>
  );
}

/** Inline notice. tone: info | success | warning | danger */
export function Notice({ tone = 'info', title, children, style }) {
  const t = {
    info: [colors.primarySoft, colors.primary, 'information-circle-outline'],
    success: [colors.successSoft, colors.success, 'checkmark-circle-outline'],
    warning: [colors.warningSoft, colors.warning, 'alert-circle-outline'],
    danger: [colors.dangerSoft, colors.danger, 'alert-circle-outline'],
  }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: t[0] }, style]}>
      <Ionicons name={t[2]} size={20} color={t[1]} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        {title ? <T v="bodyStrong" style={{ color: colors.ink }}>{title}</T> : null}
        {children ? <T v="caption" style={{ color: colors.text }}>{children}</T> : null}
      </View>
    </View>
  );
}

/** Centered message for empty lists. */
export function Empty({ icon = 'file-tray-outline', title, text, action, onAction }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={36} color={colors.subtle} />
      <T v="heading" style={{ marginTop: space.md, textAlign: 'center' }}>{title}</T>
      {text ? <T v="caption" style={{ textAlign: 'center', marginTop: 4, maxWidth: 280 }}>{text}</T> : null}
      {action ? <Button title={action} onPress={onAction} variant="secondary" small style={{ marginTop: space.lg }} /> : null}
    </View>
  );
}

export function ProgressBar({ value = 0, tone = colors.primary, style }) {
  return (
    <View style={[styles.track, style]}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: tone }]} />
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: colors.divider }, style]} />;
}

/** Loading placeholder for a whole screen. */
export function Loading({ label }) {
  return (
    <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center', gap: space.md }]}>
      <ActivityIndicator color={colors.primary} />
      {label ? <T v="caption">{label}</T> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: { minHeight: 38, paddingHorizontal: space.md },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  buttonText: { fontSize: 15, fontWeight: '600' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
  },
  fieldInput: { flex: 1, minHeight: 48, fontSize: 15, color: colors.ink },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
    paddingHorizontal: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 14, paddingHorizontal: space.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  notice: { flexDirection: 'row', gap: space.sm, borderRadius: radius.lg, padding: space.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: space.xxl },
  track: { height: 6, backgroundColor: colors.divider, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});

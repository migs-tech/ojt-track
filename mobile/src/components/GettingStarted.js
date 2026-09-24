// "Getting started" checklist on the Home screen. Replaces the first-launch tutorial and the
// pop-ups: it shows what's left to set up, ticks items off, and disappears when everything is done.
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, ProgressBar, T, colors, space } from '@/ui';

/**
 * items: [{ key, title, text, done, onPress }]
 * storageKey: where "hidden" is remembered (per user)
 */
export default function GettingStarted({ items, storageKey }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((v) => setHidden(v === 'hidden'))
      .catch(() => setHidden(false));
  }, [storageKey]);

  const doneCount = items.filter((i) => i.done).length;
  if (hidden || doneCount === items.length) return null;

  const hide = () => {
    setHidden(true);
    AsyncStorage.setItem(storageKey, 'hidden').catch(() => {});
  };

  return (
    <Card padded={false} style={{ marginBottom: space.xl }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <T v="heading">Getting started</T>
          <T v="caption">{doneCount} of {items.length} done</T>
        </View>
        <Pressable onPress={hide} hitSlop={10} accessibilityLabel="Hide the getting started list">
          <T v="label" style={{ color: colors.muted }}>Hide</T>
        </Pressable>
      </View>
      <ProgressBar value={(doneCount / items.length) * 100} style={{ marginHorizontal: space.lg, marginBottom: space.sm }} />
      {/* Only what is left to do; the count above shows progress */}
      {items.filter((item) => !item.done).map((item, i, left) => (
        <Pressable
          key={item.key}
          onPress={item.done ? undefined : item.onPress}
          style={({ pressed }) => [styles.item, i < left.length - 1 && styles.itemBorder, pressed && !item.done && { backgroundColor: colors.background }]}
          accessibilityRole="button"
          accessibilityState={{ checked: item.done }}
        >
          <Ionicons
            name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={item.done ? colors.success : colors.subtle}
          />
          <View style={{ flex: 1 }}>
            <T v="body" style={item.done ? { color: colors.muted, textDecorationLine: 'line-through' } : { color: colors.ink }}>
              {item.title}
            </T>
            {!item.done && item.text ? <T v="caption">{item.text}</T> : null}
          </View>
          {!item.done && item.onPress ? <Ionicons name="chevron-forward" size={18} color={colors.subtle} /> : null}
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: space.lg, paddingBottom: space.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, paddingHorizontal: space.lg },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
});

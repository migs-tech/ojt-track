// Profile picture, or the person's initials when there is no photo.
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { colors } from '@/ui/theme';

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ uri, name, size = 44, style }) {
  const [failed, setFailed] = useState(false);
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={[shape, { backgroundColor: colors.divider }, style]}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={[shape, { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Text style={{ color: colors.primary, fontWeight: '600', fontSize: size * 0.36 }}>{initials(name)}</Text>
    </View>
  );
}

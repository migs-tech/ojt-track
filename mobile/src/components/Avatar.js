// Profile picture, or the person's initials on a colored circle when there is no photo.
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

const COLORS = ['#2076cc', '#7c3aed', '#059669', '#d97706', '#db2777', '#0891b2'];

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ uri, name, size = 48, style }) {
  const [failed, setFailed] = useState(false);
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={[shape, { backgroundColor: '#e5e7eb' }, style]}
        onError={() => setFailed(true)}
      />
    );
  }

  const text = initials(name);
  const color = COLORS[(text.charCodeAt(0) + (text.charCodeAt(1) || 0)) % COLORS.length];
  return (
    <View style={[shape, { backgroundColor: color, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{text}</Text>
    </View>
  );
}

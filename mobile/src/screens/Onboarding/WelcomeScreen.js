// First launch only: what the app is for, then sign in or create an account.
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { saveFirstInstall } from '@/utils/checkFirstInstall';
import { Button, T, colors, space } from '@/ui';

const points = [
  ['qr-code-outline', 'Time in with a QR code', 'Your supervisor scans it. No paper logbook.'],
  ['document-text-outline', 'Daily reports', 'Write what you did and add a photo.'],
  ['time-outline', 'Track your hours', 'See your progress toward the required OJT hours.'],
];

export default function WelcomeScreen({ navigation }) {
  const go = async (screen) => {
    await saveFirstInstall();
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Image source={require('../../../assets/images/icon.png')} style={styles.logo} />
        <T v="display" style={{ marginTop: space.xl }}>OJT Track</T>
        <T v="body" style={{ color: colors.muted, marginTop: space.xs }}>
          Attendance and reports for on-the-job training.
        </T>

        <View style={{ marginTop: space.xxxl, gap: space.xl }}>
          {points.map(([icon, title, text]) => (
            <View key={title} style={styles.point}>
              <Ionicons name={icon} size={22} color={colors.primary} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <T v="bodyStrong">{title}</T>
                <T v="caption">{text}</T>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Button title="Sign in" onPress={() => go('Login')} />
        <Button title="Create an account" variant="secondary" onPress={() => go('SignUpRoleScreen')} style={{ marginTop: space.md }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  top: { flex: 1, paddingHorizontal: space.xxl, paddingTop: 56 },
  logo: { width: 64, height: 64, borderRadius: 16 },
  point: { flexDirection: 'row', gap: space.md },
  bottom: { paddingHorizontal: space.xxl, paddingBottom: space.xxl },
});

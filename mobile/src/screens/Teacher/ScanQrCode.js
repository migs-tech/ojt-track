// Supervisor: scan a trainee's QR code to record their time-in.
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQrStore } from '@/store/useQrStore';
import { errorMessage } from '@/lib/api';

export default function ScanQrCode() {
  const navigation = useNavigation();
  const { scanQRCode } = useQrStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [focused, setFocused] = useState(false);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { ok, title, message }
  const handling = useRef(false); // ignores repeat reads of the same code

  // Only run the camera while this screen is visible
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  const onScanned = async ({ data }) => {
    if (handling.current || result) return;
    handling.current = true;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      const res = await scanQRCode(data);
      if (res?.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setResult({
          ok: true,
          title: res.trainee_name ? `${res.trainee_name} timed in` : 'Attendance recorded',
          message: res.time_in ? `Time-in recorded at ${res.time_in}.` : 'Time-in recorded.',
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setResult({ ok: false, title: "Couldn't record", message: res?.message || 'Please try again.' });
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setResult({ ok: false, title: "Couldn't record", message: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  const scanNext = () => {
    setResult(null);
    // Short pause so the same code isn't read again straight away
    setTimeout(() => {
      handling.current = false;
    }, 800);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2076cc" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={56} color="#94a3b8" />
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permText}>Allow the camera to scan your trainees' QR codes.</Text>
        {permission.canAskAgain ? (
          <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
            <Text style={styles.permButtonText}>Allow camera</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.permButton} onPress={() => Linking.openSettings()}>
            <Text style={styles.permButtonText}>Open settings</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
          <Text style={{ color: '#64748b', fontWeight: '600' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {focused ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torch}
          onBarcodeScanned={result ? undefined : onScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      ) : null}

      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.title}>Scan a trainee's QR code</Text>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          {busy ? <ActivityIndicator size="large" color="#fff" /> : null}
        </View>
        <Text style={styles.hint}>Hold the phone steady with the code inside the frame.</Text>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.roundBtn} onPress={() => setTorch(!torch)}>
            <Ionicons name={torch ? 'flashlight' : 'flashlight-outline'} size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result card, shown on top of the camera */}
      {result ? (
        <View style={styles.resultWrap}>
          <View style={styles.resultCard}>
            <View style={[styles.resultIcon, { backgroundColor: result.ok ? '#dcfce7' : '#fee2e2' }]}>
              <Ionicons
                name={result.ok ? 'checkmark-circle' : 'close-circle'}
                size={40}
                color={result.ok ? '#16a34a' : '#dc2626'}
              />
            </View>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.resultText}>{result.message}</Text>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.outlineText}>Finish</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={scanNext}>
                <Text style={styles.primaryText}>Scan next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const C = 34;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#f5f7fb' },
  permTitle: { fontSize: 19, fontWeight: '700', color: '#0f172a', marginTop: 12 },
  permText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 6 },
  permButton: { marginTop: 20, backgroundColor: '#2076cc', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  permButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 24 },
  frame: { width: 250, height: 250, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: C, height: C, borderColor: '#fff' },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  hint: { color: '#e2e8f0', fontSize: 14, marginTop: 24, textAlign: 'center', paddingHorizontal: 32 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 32 },
  roundBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 26, paddingHorizontal: 32, height: 52, justifyContent: 'center' },
  doneText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 16, backgroundColor: 'rgba(0,0,0,0.4)' },
  resultCard: { backgroundColor: '#fff', borderRadius: 24, padding: 22, alignItems: 'center' },
  resultIcon: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  resultTitle: { fontSize: 19, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  resultText: { fontSize: 14, color: '#475569', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 20, alignSelf: 'stretch' },
  outlineBtn: { flex: 1, borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  outlineText: { color: '#334155', fontWeight: '700', fontSize: 15 },
  primaryBtn: { flex: 1, backgroundColor: '#2076cc', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

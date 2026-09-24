import { useQrStore } from '@/store/useQrStore';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useOtp } from '@/store/useOtpStore';
import useTraineeStore  from '@/store/useTraineeStore';
import { Ionicons } from "@expo/vector-icons";

export default function StudentMailScreen() {
  const {
    qrData,
    status,
    fetchQrCode,
    generateQrCode,
    loading,
    refreshQrStatus,
  } = useQrStore();
  const { timeOutTrainee } = useTraineeStore();

  const [countdown, setCountdown] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef(null);

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { verifyOtp } = useOtp();

  const [message, setMessage] = useState(null);
  
  const showMessage = (text, type) => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null), 2000);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
       showMessage("Please enter the OTP.", "error");
      return;
    }
    setVerifying(true);

    const otpData = { otp };

    try {
     const res = await verifyOtp(otpData);
      setOtp('');
      if (res.success) {
        await generateQrCode();
      } else {
         showMessage(res.message || "OTP verification failed. Please try again.", "error");
      }

    } catch (error) {
        showMessage("An error occurred during OTP verification. Please try again.", "error");
    } finally {
      setVerifying(false);
    }
  };

  // Fetch QR data on mount
  useEffect(() => {
    fetchQrCode();
  }, []);

  // Poll server for QR status when screen focused
  useFocusEffect(
    useCallback(() => {
      if (!qrData?.expires_at) return;

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        if (!qrData?.expires_at) return;

        const now = Date.now();
        const expiresAt = new Date(qrData.expires_at).getTime();

        if (qrData.is_used === 1 || now >= expiresAt) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return;
        }

        refreshQrStatus();
      }, 3000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
      // Restart polling only when the QR itself changes, not on every refresh response
    }, [qrData?.qr, qrData?.expires_at, qrData?.is_used])
  );

  // Countdown timer
  useEffect(() => {
    if (!qrData?.expires_at) return;

    const expiresAt = new Date(qrData.expires_at).getTime();
    const now = Date.now();

    if (qrData.is_used === 0 && now >= expiresAt) {
      setIsExpired(true);
      setCountdown(null);
      return;
    }

    if (qrData.is_used === 0 && now < expiresAt) {
      setIsExpired(false);
      const countdownInterval = setInterval(() => {
        const remaining = expiresAt - Date.now();
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          setIsExpired(true);
          setCountdown(null);
        } else {
          const hrs = Math.floor(remaining / 1000 / 60 / 60);
          const mins = Math.floor((remaining / 1000 / 60) % 60);
          const secs = Math.floor((remaining / 1000) % 60);
          setCountdown(
            `${hrs.toString().padStart(2, '0')}:${mins
              .toString()
              .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
          );
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [qrData]);

  const timeOut = async () => {
    try {
      const res = await timeOutTrainee();
      if (res.success) {
         showMessage("Timed out successfully.", "success");
      } else {
          showMessage(res.message || "Could not time out. Please try again.", "warning");
      }
    } catch (error) {
        showMessage("An error occurred while timing out. Please try again.", "error");
    }
  };


  // ✅ Show loading screen while fetching or generating
  if (loading || (!qrData && !status)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading QR Code...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {message && (
            <View
              style={[
                styles.messageBanner,
                styles[message.type] // maps directly to success, error, info, warning
              ]}
            >
              <Ionicons
                name={
                  message.type === "success"
                    ? "checkmark-circle"
                    : message.type === "error"
                    ? "close-circle"
                    : message.type === "info"
                    ? "information-circle"
                    : "warning"
                }
                size={22}
                color={
                  message.type === "success"
                    ? "#2E7D32"
                    : message.type === "error"
                    ? "#C62828"
                    : message.type === "info"
                    ? "#0288D1"
                    : "#ED6C02"
                }
              />
              <Text
                style={[
                  styles.messageText,
                  {
                    color:
                      message.type === "success"
                        ? "#2E7D32"
                        : message.type === "error"
                        ? "#C62828"
                        : message.type === "info"
                        ? "#0288D1"
                        : "#ED6C02"
                  }
                ]}
              >
                {message.text}
              </Text>
            </View>
          )}
          {/*OTP Form when no QR */}
          {(!qrData?.qr || (isExpired && qrData.is_used === 0)) && (
            <View style={[styles.card, styles.otpCard]}>
              <Text style={styles.otpTitle}>Enter OTP</Text>
              <Text style={styles.otpSubtitle}>
                Please enter the OTP sent to your registered email/phone
              </Text>
              <TextInput
                style={styles.otpInput}
                placeholder="Enter OTP"
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
              />
              <TouchableOpacity
                style={[styles.verifyButton, verifying && { backgroundColor: '#9ca3af' }]}
                onPress={handleVerifyOtp}
                disabled={verifying}
              >
                <Text style={styles.verifyButtonText}>
                  {verifying ? "Verifying..." : "Verify OTP"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {/* QR Code Display */}
          {qrData?.qr && (
            <View style={[styles.qrContainer, styles.card]}>
              
              {/* display message for verify not yet expired */}
              {qrData.is_used === 1 || !isExpired ? (
                <View style={styles.verificationHeader}>
                  <Feather
                    name="check-circle"
                    size={24}
                    color="#22c55e"
                    style={styles.icon} 
                  />
                  <Text style={styles.verificationText}>
                    OTP verified. You can now use your QR code
                  </Text>
                </View>
              ) : isExpired ? (
                <View style={styles.verificationHeader}>
                  <Feather
                    name="x-circle"
                    size={24}
                    color="#ef4444"
                    style={styles.icon}
                  />
                  <Text style={styles.expiredText}>
                    QR expired. Please generate a new one and verify it.
                  </Text>
                </View>
              ) : null}

              <View style={styles.expirationRow}>
                <Feather name="clock" size={18} color="#555" style={styles.icon} />
                <Text style={styles.expirationText}>
                  Expires in: {countdown ?? '00:00:00'}
                </Text>
              </View>

              <View style={styles.qrBox}>
                <QRCode
                  value={String(qrData.qr)}
                  size={200}
                  color="#2076cc"
                  backgroundColor="#fff"
                  logoSize={40}
                  logoMargin={2}
                />

                {qrData.is_used === 1 && (
                  <Text style={styles.usedOverlay}>Attendance Recorded</Text>
                )}
                {isExpired && qrData.is_used === 0 && (
                  <Text style={styles.expiredOverlay}>EXPIRED</Text>
                )}
              </View>
            </View>
          )}

          {/* TIME OUT BUTTON */}
          {qrData?.qr && qrData.is_used === 1 && (
            <TouchableOpacity style={styles.timeOutButton} onPress={timeOut}>
              <Feather name="log-out" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.timeOutButtonText}>Time Out</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  qrContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: '100%',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationText: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
    marginLeft: 8,
  },
  expiredText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  expirationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  qrBox: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginBottom: 12,
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
  },
  icon: {
    marginRight: 4,
  },
  expiredOverlay: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
    borderColor: 'red',
    borderWidth: 2,
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 4,
    paddingHorizontal: 30,
    borderRadius: 4,
    textAlign: 'center',
    zIndex: 10,
  },
  usedOverlay: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
    borderColor: 'green',
    borderWidth: 2,
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 4,
    paddingHorizontal: 30,
    borderRadius: 4,
    textAlign: 'center',
    zIndex: 10,
  },
  // ✅ OTP Styles
  otpCard: {
    alignItems: 'center',
    marginTop: 30,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1f2937',
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInput: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
  },
  verifyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444', // red
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  timeOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  messageBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  success: { backgroundColor: "#DFF6E0" }, // light green
  error: { backgroundColor: "#FDE2E1" }, // light red
  info: { backgroundColor: "#E0F2FE" }, // light blue
  warning: { backgroundColor: "#FFF4E5" }, // light yellow
  messageText: { marginLeft: 8, fontSize: 15, fontWeight: "600" },
});

import api from '@/lib/api';
import { create } from 'zustand';

/**
 * @typedef {Object} QrObject
 * @property {string} qr - the encoded string content for QR
 * @property {number} is_used
 * @property {string} expires_at
 */

// The server sends "YYYY-MM-DD HH:MM:SS" (Manila time); make it parseable on every phone.
const parseTime = (value) => (value ? new Date(String(value).replace(' ', 'T')) : null);

const toState = (qr) => {
  if (!qr?.qr_code) return { qrData: null, status: '' };
  const isUsed = Number(qr.is_used);
  const expires = parseTime(qr.expires_at);
  return {
    qrData: { qr: qr.qr_code, is_used: isUsed, expires_at: qr.expires_at },
    status: isUsed === 1 ? 'used' : expires && expires < new Date() ? 'expired' : 'active',
  };
};

export const useQrStore = create((set) => ({
  /** @type {QrObject|null} */
  qrData: null,
  status: '',
  loading: false,

  // Today's latest QR code, if there is one
  fetchQrCode: async () => {
    try {
      const res = await api.post('/user/fetchOrGenerateQrCode');
      set(toState(res.data?.qr));
    } catch (error) {
      console.error('Fetch QR error:', error);
    }
  },

  // Makes a QR code after the emailed code was verified. Returns the server's answer.
  generateQrCode: async () => {
    set({ loading: true });
    try {
      const res = await api.post('/user/generateQRCode');
      if (res.data?.qr) set(toState(res.data.qr));
      return res.data;
    } catch (error) {
      console.error('Generate QR error:', error);
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },

  // Polled while the QR is on screen, to see when the supervisor scans it
  refreshQrStatus: async () => {
    try {
      const res = await api.post('/user/fetchOrGenerateQrCode');
      if (res.data?.qr) set(toState(res.data.qr));
    } catch (error) {
      // Try again on the next poll
    }
  },

  // Supervisor: records attendance from a scanned code. Returns the server's answer.
  scanQRCode: async (qrCode) => {
    set({ loading: true });
    try {
      const res = await api.post('/user/scanQrCode', { qr_code: qrCode });
      return res.data;
    } finally {
      set({ loading: false });
    }
  },
}));

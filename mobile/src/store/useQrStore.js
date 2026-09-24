import api from '@/lib/api';
import { create } from 'zustand';

/**
 * @typedef {Object} QrObject
 * @property {string} qr - the encoded string content for QR
 * @property {number} is_used
 * @property {string} expires_at
 */

/**
 * @typedef {Object} QrState
 * @property {QrObject|null} qrData
 * @property {string} status
 * @property {boolean} loading
 * @property {() => Promise<void>} fetchQrCode
 * @property {() => Promise<void>} generateQrCode
 * @property {() => Promise<void>} regenerateQrCode
 * @property {() => Promise<void>} refreshQrStatus
 */

export const useQrStore = create((set) => ({
  qrData: null,
  status: '',
  loading: false,

  fetchQrCode: async () => {
    set({ loading: true });
    try {
      const res = await api.post('/user/fetchOrGenerateQrCode');  
      const qr = res.data?.qr;
      if (!qr) {
        set({ qrData: null, status: "" });
        return;
      }
      set({
        qrData: {
          qr: qr?.qr_code,
          is_used: qr?.is_used,
          expires_at: qr?.expires_at,
        },
        status: qr?.is_used
          ? 'used'
          : new Date(qr?.expires_at) < new Date()
          ? 'expired'
          : 'active',
      });
    } catch (error) {
      console.error('Fetch QR error:', error);
    } finally {
      set({ loading: false });
    }
  },

  generateQrCode: async () => {
    set({ loading: true });
    try {
      const res = await api.post('/user/generateQRCode');
      const qr = res.data.qr;
      set({
        qrData: {
          qr: qr.qr_code,
          is_used: qr.is_used,
          expires_at: qr.expires_at,
        },
        status: qr.is_used
          ? 'used'
          : new Date(qr.expires_at) < new Date()
          ? 'expired'
          : 'active',
      });
    } catch (error) {
      console.error('Generate QR error:', error);
    } finally {
      set({ loading: false });
    }
  },

  regenerateQrCode: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const res = await api.post('/user/regenerateQrCode');
      const qr = res.data.qr;
      set({
        qrData: {
          qr: qr.qr_code,
          is_used: qr.is_used,
          expires_at: qr.expires_at,
        },
        status: res.data.status,
      });
    } catch (error) {
      console.error('Regenerate QR error:', error);
    } finally {
      set({ loading: false });
    }
  },

  refreshQrStatus: async () => {
    set({ loading: false });
    try {
      const res = await api.post('/user/fetchOrGenerateQrCode');
      const qr = res.data.qr;
      set({
        qrData: {
          qr: qr.qr_code,
          is_used: qr.is_used,
          expires_at: qr.expires_at,
        },
        status: res.data.status,
      });
    } catch (error) {
      console.error('Refresh QR error:', error);
    } finally {
      set({ loading: false });
    }
  },

  scanQRCode: async (qrCode) => {
    set({ loading: true });
    try {
      const res = await api.post('/user/scanQrCode', { qr_code: qrCode });
       return res.data;
    } catch (error) {
      console.error('Scan QR error:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
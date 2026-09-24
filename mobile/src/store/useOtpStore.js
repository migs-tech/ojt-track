import { create } from 'zustand';
import { 
    generateOtp,
    verifyOtp
 } from '@/api/studentApi';


 export const useOtp  = create((set) => ({
    loading: false,
    error: null,

    generateOtp: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await generateOtp(data);
            console.log("OTP Generation Responses:", response);
            set({ loading: false });
            return response;
        } catch (error) {
            set({ loading: false, error: error.message });
            return null;
        }
    },
    verifyOtp: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await verifyOtp(data);
            set({ loading: false });
            return response;
        } catch (error) {
            set({ loading: false, error: error.message });
            return null;
        }
    }
}));
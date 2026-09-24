import { Alert } from 'react-native';
import { create } from 'zustand';
import { 
    fetchTotalHours,
    getAttendanceByUserId,
 } from '@/api/studentApi';

export const useHourStore = create((set) => ({
  totalHours: 0,
  loading: false,
    error: null,

    fetchTotalHours: async () => { 
        set({ loading: true, error: null });
        try {
            const response = await fetchTotalHours();
            set({ totalHours: response.total_hours, loading: false });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },
    fetchAttendanceByUserId: async () => { 
        set({ loading: true, error: null });
        try {
            const response = await getAttendanceByUserId();
            set({ totalHours: response.total_hours, loading: false });
            return response;
        } catch (error) {
            set({ loading: false, error: error.message });
            return null;
        }
    },
}));
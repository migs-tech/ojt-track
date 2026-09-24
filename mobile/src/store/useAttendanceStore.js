import { Alert } from 'react-native';
import { create } from 'zustand';
import { 
    fetchTotalHours,
 } from '@/api/studentApi';
 import { 
    getAttendanceRecordToday,
 } from '@/api/teacherApi';

export const useAttendanceStore = create((set) => ({
  totalHours: 0,
  attendanceRecordToday: [],
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

    fetchAttendanceRecordToday: async () => {
        set({ loading: true, error: null });
        try {
            const response = await getAttendanceRecordToday();
            set({ attendanceRecordToday: response, loading: false });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },
}));
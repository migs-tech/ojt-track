import { create } from 'zustand';
import {
    fetchTotalHours,
    getAttendanceByUserId,
 } from '@/api/studentApi';
 import {
    getAttendanceRecordToday,
 } from '@/api/teacherApi';

export const useAttendanceStore = create((set) => ({
  totalHours: 0,
  attendanceRecordToday: [],
  // The trainee's own attendance: { total_hours, days_count, records: [...], today }
  myAttendance: null,
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

    fetchMyAttendance: async () => {
        try {
            const response = await getAttendanceByUserId();
            set({ myAttendance: response, totalHours: response?.total_hours ?? 0 });
            return response;
        } catch (error) {
            return null;
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

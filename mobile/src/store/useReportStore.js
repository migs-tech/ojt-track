import { Alert } from 'react-native';
import { create } from 'zustand';
import { 
    saveReport,
    getReports,
    updateReport
 } from '@/api/studentApi';
 import { 
    getTraineeLatestReport,
    getTraineeReportListById
 } from '@/api/teacherApi';

export const useReportStore = create((set) => ({
  reports: [],
  loading: false,
  error: null,

    saveReport: async (reportData) => {
        set({ loading: true, error: null });
        try {
            const response = await saveReport(reportData);
            set({ loading: false });
            if (response.success) {
                set((state) => ({
                reports: [...state.reports, response.report],
                loading: false,
                }));
            } 
            return response;
        } catch (error) {
            set({ loading: false, error: error.message });
            return Promise.reject(error);
        }
    },
    getReports: async () => {
        set({ loading: false, error: null });
        try {
            const res = await getReports();
            if (!res.success) {
                set({ loading: false, error: res.error });
                return;
            }
            set({ reports: res.reports, loading: false });
            return res;
        } catch (error) {
            set({ loading: false, error: error });
            return null;
        }
    },

    updateReport: async(updatedData) => {
        try {
            const response = await updateReport(updatedData);
            if (response.success) {
                set((state) => ({
                    reports: state.reports.map((report) =>
                        report.id === updatedData.id ? response.report : report
                    ),
                }));
            } else {
                set({ error: response.error });
            }
            return response;
        } catch (error) {
            set({ error: error.message });
            return Promise.reject(error);
        }
    },

    getTraineeLatestReport: async () => {
        set({ loading: true, error: null });
        try {
            const res = await getTraineeLatestReport();
            if (!res.success) {
                set({ loading: false, error: res.error });
                return;
            }
            set({ loading: false });
            return res;
        } catch (error) {
            set({ loading: false, error: error });
            return null;
        }
    },
    getTraineeReportListById: async (traineeId) => {
        set({ loading: true, error: null });
        try {
            const res = await getTraineeReportListById(traineeId);
            if (!res.success) {
                set({ loading: false, error: res.error });
                return;
            }
            set({ loading: false });
            return res;
        } catch (error) {
            set({ loading: false, error: error });
            return null;
        }
    },
  }));

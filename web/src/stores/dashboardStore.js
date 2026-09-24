import { defineStore } from 'pinia';
import api from "@/api/api";

export const useDashboardStore = defineStore('dashboardStore', {
  state: () => ({
    totalTrainees: 0,
    totalSupervisors: 0,
    totalUsers: 0,
    attendanceBarChart: { labels: [], present: [], absent: [] },
    selectedYear: new Date().getFullYear(),
    recentOjtEvaluations: [],
    ojtHoursCompletionPieChart: [],
    loading: false,
  }),

  actions: {
    async fetchDashboardStats() {
      this.loading = true;
      try {
        const response = await api.post('/dashboard/getDashboardData');
        const { total_trainees, total_supervisors, total_users } = response.data;

        this.totalTrainees = total_trainees;
        this.totalSupervisors = total_supervisors;
        this.totalUsers = total_users;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        this.loading = false;
      }
    },

    async prepareAttendanceBarChart(year = this.selectedYear) {
      this.selectedYear = year;
      this.loading = true;
      try {
        const response = await api.post(`/dashboard/getAttendanceByMonth`, { year });
        this.attendanceBarChart = response.data;
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        this.loading = false;
      }
    },

    async prepareOjtHourCompletionPieChart() {
      this.loading = true;
      try {
        const response = await api.post('/admin/getOjtHoursCompletionStats');
        this.ojtHoursCompletionPieChart = response.data.data;
        return response.data;
      } catch (error) {
        console.error('Error fetching OJT hour completion data:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchRecentEvaluations() {
      this.loading = true;
      try {
        const response = await api.post('/admin/getRecentEvaluations');
        this.recentOjtEvaluations = response.data.recent_evaluations;
      } catch (error) {
        console.error('Error fetching recent evaluations:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});

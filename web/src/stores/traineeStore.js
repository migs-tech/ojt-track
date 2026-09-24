import { defineStore } from 'pinia';
import api from "@/api/api";

export const useTraineeStore = defineStore('traineeStore', {
  state: () => ({
    trainees: [],
    totalTrainees: 0,
    loading: false,
    unassignedTrainees: [],
    traineeDetails: {},
    pagination: { page: 1, total: 1, totalPages: 0},
    traineeReportRequest: {},
    completedOjtTrainees: [],
  }),

  actions: {
    async fetchTrainees(data) {
      this.loading = true;
      try {
        const response = await api.post('admin/getTraineeList', data);
        this.trainees = response.data.trainees;
        this.totalTrainees = response.data.pagination.total || 0;
        this.pagination = response.data.pagination;
        return response.data;
      } catch (error) {
        console.error('Error fetching trainees:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchUnassignedTrainees(page) {
      this.loading = true;
      try {
        const response = await api.post('/admin/getTraineeNoSupervisor', { page });
        this.unassignedTrainees = response.data;
        return response.data;
      } catch (error) {
        console.error('Error fetching trainees without supervisors:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },
    async assignSupervisor({ trainee_id, supervisor_id }) {
      this.loading = true;
      try {
        const res = await api.post('/admin/assignSupervisor', { trainee_id, supervisor_id });
        return res.data;
      } catch (error) {
        console.error('Error assigning supervisor:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchTraineeDetails(trainee_id) {
        this.loading = true;
        try {
            const response = await api.post(`/admin/getTraineeDataById`, { trainee_id });
            this.traineeDetails = response.data.data;
            return response.data;
        } catch (error) {
            console.error('Error fetching trainee data:', error);
            return null;
        } finally {
            this.loading = false;
        }
    },

    async getReportRequest(page = 1) {
      this.loading = true;
      try {
        const response = await api.post('admin/getReportRequest', { page });
        console.log('Report Request Response:', response.data);
        this.traineeReportRequest = response.data;
        return response.data;
      } catch (error) {
        console.error('Error fetching trainee report requests:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateReportRequestStatus(data) {
      this.loading = true;
      try {
        const response = await api.post('admin/updateReportRequestStatus', data);
        return response.data;
      } catch (error) {
        console.error('Error updating report request status:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async getCompletedOjtTrainees(data) {
      this.loading = true;
      try {
        const response = await api.post('admin/getCompletedOjtTrainees', data);
        this.completedOjtTrainees = response.data.data;
        this.totalTrainees = response.data?.pagination?.total || 0;
        this.pagination = response.data.pagination;
        return response.data;
      } catch (error) {
        console.error('Error fetching completed OJT trainees:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async generateTraineeReportPDF(trainee_id) {
      this.loading = true;
      try {
        const response = await api.post('admin/generateTraineeDetails', { trainee_id });
        return response.data;
      } catch (error) {
        console.error('Error printing trainee details:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
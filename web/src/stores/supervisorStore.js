import { defineStore } from 'pinia';
import api from "@/api/api";

export const useSupervisorStore = defineStore('supervisorStore', {
  state: () => ({
    supervisors: [],       // ✅ should be array
    pagination: { page: 1, total: 1, totalPages: 0},
    loading: false,
  }),

  actions: {
    async fetchSupervisors(params = {}) {
      this.loading = true;
      try {
        const response = await api.post('/admin/getSupervisorList', params);

        // API returns an array, so set supervisors directly
        this.supervisors = response.data?.supervisors ?? [];
        this.pagination = response.data?.pagination ?? { page: 1, total: 1, totalPages: 0};

        return response.data?.supervisors;
      } catch (error) {
        console.error('Error fetching supervisors:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async addSupervisor(supervisorData) {
      this.loading = true;
      try {
        const response = await api.post('/admin/supervisors', supervisorData);
        this.supervisors.push(response.data);
        this.totalSupervisors += 1;
      } catch (error) {
        console.error('Error adding supervisor:', error);
      } finally {
        this.loading = false;
      }
    },

    async updateSupervisor(id, supervisorData) {
      this.loading = true;
      try {
        const response = await api.put(`/supervisors/${id}`, supervisorData);
        const index = this.supervisors.findIndex(s => s.supervisor_id === id);
        if (index !== -1) {
          this.supervisors[index] = response.data;
        }
      } catch (error) {
        console.error('Error updating supervisor:', error);
      } finally {
        this.loading = false;
      }
    },

    async deleteSupervisor(id) {
      this.loading = true;
      try {
        await api.delete(`/supervisors/${id}`);
        this.supervisors = this.supervisors.filter(s => s.supervisor_id !== id);
        this.totalSupervisors -= 1;
      } catch (error) {
        console.error('Error deleting supervisor:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});

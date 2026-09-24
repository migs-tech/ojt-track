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

  },
});

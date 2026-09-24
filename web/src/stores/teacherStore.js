import { defineStore } from 'pinia';
import api from "@/api/api";

export const useTeacherStore = defineStore('teacherStore', {
  state: () => ({
    teachers: [],
    totalTeachers: 0,
    loading: false,
    pagination: { page: 1, total: 1, totalPages: 0},
  }),

  actions: {
    async fetchTeachers(page) {
        this.loading = true;
        try {
          const response = await api.post('admin/getTeacherList', { page });
          this.teachers = response.data.teachers;
          this.totalTeachers = response.data.total;
          this.pagination = response.data.pagination;
          return response.data;
        } catch (error) {
          console.error('Error fetching teachers:', error);
        } finally {
          this.loading = false;
        }
      },

      async addTeacher(teacherData) {
        try {
          const response = await api.post('/admin/addTeacherAccount', teacherData);
           //fetch updated list after adding
          await this.fetchTeachers(this.pagination.page);
          return response.data;
        } catch (error) {
          console.error('Error adding teacher:', error);
        } finally {
        }
      },

      async updateTeacher(teacherData) {
        this.loading = true;
        try {
          const response = await api.post(`admin/updateTeacherAccount`, teacherData);
          await this.fetchTeachers(this.pagination.page);
          return response.data;
        } catch (error) {
          console.error('Error updating teacher:', error);
        } finally {
          this.loading = false;
        }
      },

      async deleteTeacher(id) {
        this.loading = true;
        try {
          const res = await api.post(`admin/deleteTeacherAccount`, { teacher_id: id });
            await this.fetchTeachers(this.pagination.page);
            return res.data;
        } catch (error) {
          console.error('Error deleting teacher:', error);
        } finally {
          this.loading = false;
        }
      },

      //verifyTeacherAccount
    async verifyTeacherAccount(id) {
        this.loading = true;
        try {
          const response = await api.post(`/admin/verifyTeacherAccount`, { teacher_id: id });
          await this.fetchTeachers(this.pagination.page);
          return response.data;
        } catch (error) {
          console.error('Error verifying teacher account:', error);
        } finally {
          this.loading = false;
        }
      },
  }
});
   
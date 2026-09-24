import { Alert } from 'react-native';
import { create } from 'zustand';
import { 
    fetchSupervisorDetails,
    sendSupervisorRequest,
    fetchSupervisorById,
 } from '@/api/studentApi';



export const useSupervisorStore = create((set) => ({
  supervisors: null,
  mySupervisor: null,
  loading: false,
  error: null,  
 
    fetchSupervisorDetails: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetchSupervisorDetails();
            set({ supervisors: response.supervisors, loading: false });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    sendSupervisorRequest: async (supervisorId) => {
        set({ loading: true, error: null });
        try {
            const response = await sendSupervisorRequest(supervisorId);
            console.log('Supervisor request sent successfully:', response);
        } catch (error) {
            set({ loading: false, error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    fetchMySupervisor: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetchSupervisorById();
            set({ mySupervisor: response.supervisor, loading: false });
        } catch (error) {
            set({ loading: false, error: error });
        }
    },

}));

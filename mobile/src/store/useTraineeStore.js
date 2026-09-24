import { Alert } from 'react-native';
import { create } from 'zustand';
import {
    fetchTraineeList,
    fetchTraineeDetails,
    getAllAttendanceRecords,
    fetchNoAttendanceRecords,
    recordAttendance,
    getTraineeDataByIdApi,
    getTraineeRequests,
    updateTraineeRequest,
    submitEvaluation,
    unEnrollTrainee
} from '@/api/teacherApi';
import {
    timeOut,
    ojtCompletion,
    getOjtCompletion,
    checkOjtCompletionStatus,
    saveTraineeRequest,
    getTraineeRequests as getTraineeRequestsApi
 } from '@/api/studentApi';    

const useTraineeStore = create((set) => ({
    trainees: [],
    selectedTrainee: null,
    attendanceRecords: [],
    noAttendanceRecords: [],
    traineeRequests: [],
    isCompletedOjt: null,
    traineeRequestsHistory: [],

    fetchTrainees: async () => {
        try {
            const data = await fetchTraineeList();
            set({ trainees: data.trainees });
        } catch (error) {
            console.error("Error fetching trainees:", error);
        }
    },

    fetchTraineeDetails: async (id) => {
        try {
            const data = await fetchTraineeDetails(id);
            set({ selectedTrainee: data });
        } catch (error) {
            console.error("Error fetching trainee details:", error);
        }
    },

    fetchAllAttendanceRecords: async () => {
        try {
            const data = await getAllAttendanceRecords();
            set({ attendanceRecords: data });
        } catch (error) {
            set({ attendanceRecords: [] });
        }
    },

    fetchNoAttendanceRecords: async () => {
        try {
            const data = await fetchNoAttendanceRecords();
            set({ noAttendanceRecords: data.trainee_no_attendance });
        } catch (error) {
            set({ noAttendanceRecords: [] });
        }
    },

    // Returns the server's answer ({ success, message }) so the screen can show it
    recordAttendance: async ({ studentId, status }) => {
        const data = { student_id: studentId, status };
        return recordAttendance(data);
    },

    getTraineeDataById: async (id) => {
        try {
            const data = await getTraineeDataByIdApi(id);
            return data;
        } catch (error) {
            return null;
        }
    },
    timeOutTrainee: async () => {
        try {
            const data = await timeOut();
            return data;
        } catch (error) {
            return null;
        }
    },
    fetchTraineeRequests: async () => {
        try {
            const res = await getTraineeRequests();
            set({ traineeRequests: res.requests });
        } catch (error) {
            console.error("Error fetching trainee requests:", error);
            set({ traineeRequests: [] });
        }
    },

    updateTraineeRequest: async (id, status) => {
        try {
            const res = await updateTraineeRequest({ id, status });
            return res;
        } catch (error) {
            console.error("Error updating trainee request:", error);
            return { success: false, error: error.message };
        }
    },

    ojtCompletion: async (data) => {
        try {
            const res = await ojtCompletion(data);
            return res;
        } catch (error) {
            console.error("Error submitting OJT completion:", error);
            return { success: false, error: error.message };
        }
    },
    getOjtCompletion: async () => {
        try {
            const data = await getOjtCompletion();
            return data;
        } catch (error) {
            console.error("Error fetching OJT completion data:", error);
            return null;
        }
    },
    checkOjtCompletionStatus: async () => {
        try {
            const res = await checkOjtCompletionStatus();
            set({ isCompletedOjt: res.completed });
            return res;
        } catch (error) {
            console.error("Error checking OJT completion status:", error);
            return null;
        }
    },

    saveTraineeRequest: async (data) => {
        try {
            const res = await saveTraineeRequest(data);
            return res;
        } catch (error) {
            console.error("Error saving trainee request:", error);
            return { success: false, error: error.message };
        }
    },

    getTraineeRequestsHistory: async () => {
        try {
            const res = await getTraineeRequestsApi();
            set({ traineeRequestsHistory: res.data });
            return res;
        } catch (error) {
            console.error("Error fetching trainee requests:", error);
            set({ traineeRequestsHistory: [] });
            return { success: false, error: error.message };
        }
    },

    submitEvaluation: async (data) => {
        try {
            const res = await submitEvaluation(data);
            return res;
        } catch (error) {
            console.error("Error submitting evaluation:", error);
            return { success: false, error: error.message };
        }
    },

    unEnrollTrainee: async (id) => {
        try {
            const res = await unEnrollTrainee(id);
            return res;
        } catch (error) {
            console.error("Error unenrolling trainee:", error);
            return { success: false, error: error.message };
        }
    },
}));

export default useTraineeStore;

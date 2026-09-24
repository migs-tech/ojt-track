import api from '@/lib/api';


export const recordAttendance = async (data) => {
  try {
    const response = await api.post(`/user/recordAttendance`, data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const fetchNoAttendanceRecords = async () => {
  try {
    const response = await api.post(`/user/noAttendance`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const fetchTraineeList = async () => {
  try {
    const response = await api.post(`/user/getTrainee`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

//get all attendance list endpoint
export const getAllAttendanceRecords = async () => {
  try {
    const response = await api.post(`/user/fetchAllAttendance`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

//get attendace record today
export const getAttendanceRecordToday = async () => {
  try {
    const response = await api.post(`/user/getTotalAttendanceToday`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getTraineeDataByIdApi = async (id) => {
  try {
    const response = await api.post(`/trainee/getTraineeDataById`, { id });
    return response.data;
  } catch (error) {
    return null;
  }
};

//get trainee requests
export const getTraineeRequests = async () => {
  try {
    const response = await api.post(`/trainee/fetchRequestedTrainees`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

//update trainee request
export const updateTraineeRequest = async (data) => {
  try {
    const response = await api.post(`/trainee/updateTraineeRequest`, data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getTraineeLatestReport = async () => {
  try {
    const response = await api.post(`/trainee/getTraineeLatestReport`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getTraineeReportListById = async (traineeId) => {
  try {
    const response = await api.post(`/trainee/getTraineeReportListById`, { traineeId });
    return response.data;
  } catch (error) {
    return null;
  }
};

//evaluation submission
export const submitEvaluation = async (data) => {
  try {
    const response = await api.post(`/trainee/saveTraineeEvaluation`, data);
    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to submit evaluation');
  }
};

export const unEnrollTrainee = async (traineeId) => {
  try {
    const response = await api.post(`/trainee/unEnrollTrainee`, { trainee_id: traineeId });
    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to unenroll trainee');
  }
};

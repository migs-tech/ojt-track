import api from '@/lib/api';

export const fetchQrCode = async () => {
    try {
        const response = await api.post('/user/fetchOrGenerateQrCode');
        return response.data; // Assuming the API returns the QR code data
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to fetch QR code');
    }
};

export const saveReport = async (reportData) => {
    try {
        const response = await api.post(
            '/user/report',
            reportData,
            {
                transformRequest: formData => formData, // prevent axios from converting FormData to JSON
            }
        );
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to save report');
    }
};

export const fetchTotalHours = async () => {
    try {
        const response = await api.get('/attendance/getTotalHours');
        return response.data; // Assuming the API returns the total hours data
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to fetch total hours');
    }
}

export const fetchSupervisorDetails = async () => {
    try {
        const response = await api.get('/user/fetchSupervisor');
        return response.data; // Assuming the API returns the supervisor details
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to fetch supervisor details');
    }
}

export const sendSupervisorRequest = async (supervisorId) => {
    try {
        const response = await api.post('/user/sendSupervisorRequest', { supervisor_id: supervisorId });
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to send supervisor request');
    }
}

export const fetchSupervisorById = async () => {
    try {
        const response = await api.post('/user/getSupervisorRequests');
        return response.data; // Assuming the API returns the supervisor details
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to fetch supervisor by ID');
    }
}

export const getReports = async () => {
    try {
        const response = await api.get('/user/getReports');
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to fetch reports');
    }
}

//generateOtp
export const generateOtp = async (data) => {
    try {
        const response = await api.post('/user/generateOtp', data);
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to generate OTP');
    }
};

//verifyOtp
export const verifyOtp = async (data) => {
    try {
        const response = await api.post('/user/verifyOtp', data);
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to verify OTP');
    }
};

//time out
export const timeOut = async () => {
    try {
        const response = await api.post('/attendance/timeout');
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to time out');
    }
};

//update report
export const updateReport = async (reportData) => {
    try {
        const response = await api.post(
            '/trainee/updateTraineeReport',
            reportData,
            {
                transformRequest: formData => formData, // prevent axios from converting FormData to JSON
            }
        );
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to update report');
    }
};

export const getAttendanceByUserId = async () => {
  try {
    const response = await api.post('/attendance/getAttendanceByUserId');
    return response.data; // Assuming the API returns the attendance data
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to fetch attendance by user ID');
  }
};

export const ojtCompletion = async (data) => {
  try {
    const response = await api.post('/user/saveOjtCompletion', data);
    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to submit OJT completion');
  }
};

export const getOjtCompletion = async () => {
  try {
    const response = await api.post('/user/getOjtCompletion');
    return response.data; // Assuming the API returns the OJT completion data
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to fetch OJT completion data');
  }
};

//checkOjtCompletionStatus
export const checkOjtCompletionStatus = async () => {
  try {
    const response = await api.post('/user/checkOjtCompletionStatus');
    return response.data; // Assuming the API returns the OJT completion status
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to check OJT completion status');
  }
};

export const saveTraineeRequest = async (data) => {
  try {
    const response = await api.post('/user/createRequest', data);
    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to save trainee request');
  }
};

export const getTraineeRequests = async () => {
  try {
    const response = await api.post('/user/getRequestHistory');
    return response.data; // Assuming the API returns the trainee requests data
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to fetch trainee requests');
  }
};
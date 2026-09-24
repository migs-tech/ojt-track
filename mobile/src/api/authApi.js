import api from '@/lib/api';

export const login = async (credentials) => {
  try {
    const response = await api.post('/user/login', credentials);
    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Login failed');
  }
}

export const register = async (userData) => {
  try {
    const response = await api.post('/user/register', userData);
    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Registration failed');
  }
}

export const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to fetch user profile');
  }
}

export const changePasswordApi = async (passwordData) => {
  try {
    const response = await api.post('/user/changePassword', passwordData);
    return response.data; 
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to change password');
  }
}

export const updateUserProfileApi = async (profileData) => {
  try {

    const response = await api.post('/user/updateUserProfile', profileData, {
      transformRequest: (formData) => formData,
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to update user profile');
  }
};

export const getUserProfileApi = async () => {
  try {
    const response = await api.post(`/user/getUserProfile`);
    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to fetch user profile');
  }
};

export const forgotPasswordApi = async (email) => {
  try {
    const response = await api.post('/user/forgotPassword', { email });
    return response.data;
  } catch (error) {
    return Promise.reject(error.response?.data || 'Failed to send OTP');
  }
};

export const verifyOtpApi = async (otpData) => {
    try {
        const response = await api.post('/user/verifyForgotPasswordOtp', otpData);
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to verify OTP');
    }
};

export const resetPasswordApi = async (resetData) => {
    try {
        const response = await api.post('/user/resetPassword', resetData);
        return response.data;
    } catch (error) {
        return Promise.reject(error.response?.data || 'Failed to reset password');
    }
};

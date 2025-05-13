import axios from 'axios';

const baseURL = 'https://optisched.onrender.com';

const api = axios.create({
  baseURL,
});
// Attach auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getBaseURL = () => baseURL;

// Get current (cached or freshly generated) schedule, with optional progress updates.
export const generateSchedule = async (force = false, progress = true) => {
  try {
    const response = await api.get('/schedule/generate', {
      params: { force, progress },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule:', error.response?.data || error.message);
    throw error;
  }
};

// Get a specific Schedule by name
export const getFinalSchedule = async (scheduleName) => {
  try {
    const response = await api.get(`/schedule/final/${scheduleName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Schedule:', error);
    throw error;
  }
};

export const getFinalSchedules = async (scheduleName) => {
  try {
    const response = await api.get(`/schedule/final`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Schedule:', error);
    throw error;
  }
};

// Save a Generated schedule
export const saveFinalSchedule = async (scheduleData) => {
  try {
    const response = await api.post('/schedule/save', scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error saving Schedule:', error);
    throw error;
  }
};

export const overrideEvent = async (overrideDetails) => {
  try {
    const response = await api.post('/override/event', overrideDetails);
    return response.data;
  } catch (error) {
    console.error('Error in overrideEvent:', error);
    throw error;
  }
};

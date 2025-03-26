import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default API URL - this will be overridden by the server settings
const DEFAULT_API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3001/api' // Android emulator points to host's localhost
  : 'http://localhost:3001/api'; // iOS simulator

// Add mock data for testing when server isn't available
const MOCK_DATA = {
  users: [
    { id: 1, email: 'test@example.com', password: 'password123' }
  ],
  workouts: [
    { 
      id: 1, 
      user_id: 1, 
      title: 'Morning Run', 
      description: 'Easy 5k run', 
      workout_date: '2025-03-20', 
      duration: 30, 
      calories: 250,
      created_at: '2025-03-20T08:00:00Z'
    },
    { 
      id: 2, 
      user_id: 1, 
      title: 'HIIT Workout', 
      description: 'High intensity interval training', 
      workout_date: '2025-03-22', 
      duration: 20, 
      calories: 300,
      created_at: '2025-03-22T17:30:00Z'
    }
  ]
};

// Check for EAS build environment variables
const EAS_API_URL = process.env.EXPO_PUBLIC_API_URL;

// Function to get the API URL - improved for real device support
const getApiUrl = async () => {
  try {
    // First check if user has manually set a URL in settings
    const savedUrl = await AsyncStorage.getItem('API_URL');
    if (savedUrl) {
      return `${savedUrl}/api`;
    }
    
    // Next check if we have an EAS environment variable
    if (EAS_API_URL) {
      return `${EAS_API_URL}/api`;
    }
    
    // Fall back to default
    return DEFAULT_API_URL;
  } catch (error) {
    console.error('Error getting API URL:', error);
    return DEFAULT_API_URL;
  }
};

// Function to test connection to server
export const testConnection = async (baseUrl) => {
  try {
    // Add timeout to prevent long hanging connections
    const response = await axios.get(`${baseUrl}`, { 
      timeout: 5000,
      headers: { 'Cache-Control': 'no-cache' } 
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { 
      success: false, 
      error: error.message || 'Connection failed'
    };
  }
};

// Fallback to mock data if server is unreachable
const withMockFallback = async (apiCall, mockResponse) => {
  try {
    return await apiCall();
  } catch (error) {
    console.warn('API error, using mock data:', error.message);
    return mockResponse;
  }
};

// Auth API calls
export const login = async (email, password) => {
  const apiCall = async () => {
    const apiUrl = await getApiUrl();
    const response = await axios.post(`${apiUrl}/login`, { email, password });
    return response.data;
  };

  return withMockFallback(apiCall, () => {
    // Mock login logic
    const user = MOCK_DATA.users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, message: 'Invalid credentials' };
  });
};

export const register = async (email, password, confirmPassword) => {
  const apiCall = async () => {
    const apiUrl = await getApiUrl();
    const response = await axios.post(`${apiUrl}/register`, { 
      email, 
      password, 
      confirmPassword 
    });
    return response.data;
  };

  return withMockFallback(apiCall, () => {
    // Mock register logic
    const existingUser = MOCK_DATA.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    const newUserId = MOCK_DATA.users.length + 1;
    MOCK_DATA.users.push({ id: newUserId, email, password });
    
    return { success: true, userId: newUserId };
  });
};

// Workout API calls
export const getWorkouts = async (userId) => {
  const apiCall = async () => {
    const apiUrl = await getApiUrl();
    const response = await axios.get(`${apiUrl}/workouts/${userId}`);
    return response.data;
  };

  return withMockFallback(apiCall, () => {
    // Mock get workouts
    const userWorkouts = MOCK_DATA.workouts.filter(w => w.user_id == userId);
    return { success: true, workouts: userWorkouts };
  });
};

export const addWorkout = async (workoutData) => {
  const apiCall = async () => {
    const apiUrl = await getApiUrl();
    const response = await axios.post(`${apiUrl}/workouts`, workoutData);
    return response.data;
  };

  return withMockFallback(apiCall, () => {
    // Mock add workout
    const newWorkoutId = MOCK_DATA.workouts.length + 1;
    const newWorkout = {
      id: newWorkoutId,
      ...workoutData,
      created_at: new Date().toISOString()
    };
    
    MOCK_DATA.workouts.push(newWorkout);
    return { success: true, workoutId: newWorkoutId };
  });
};

export const updateWorkout = async (workoutId, workoutData) => {
  const apiCall = async () => {
    const apiUrl = await getApiUrl();
    const response = await axios.put(`${apiUrl}/workouts/${workoutId}`, workoutData);
    return response.data;
  };

  return withMockFallback(apiCall, () => {
    // Mock update workout
    const index = MOCK_DATA.workouts.findIndex(w => w.id == workoutId);
    if (index !== -1) {
      MOCK_DATA.workouts[index] = { ...MOCK_DATA.workouts[index], ...workoutData };
      return { success: true };
    }
    throw new Error('Workout not found');
  });
};

export const deleteWorkout = async (workoutId) => {
  const apiCall = async () => {
    const apiUrl = await getApiUrl();
    const response = await axios.delete(`${apiUrl}/workouts/${workoutId}`);
    return response.data;
  };

  return withMockFallback(apiCall, () => {
    // Mock delete workout
    const initialLength = MOCK_DATA.workouts.length;
    MOCK_DATA.workouts = MOCK_DATA.workouts.filter(w => w.id != workoutId);
    
    if (MOCK_DATA.workouts.length < initialLength) {
      return { success: true };
    }
    throw new Error('Workout not found');
  });
};

// Add a new function to help with real device debugging
export const getCurrentApiUrl = async () => {
  const url = await getApiUrl();
  return { 
    url,
    defaultUrl: DEFAULT_API_URL,
    easUrl: EAS_API_URL || 'Not set',
    mockDataEnabled: true
  };
}; 
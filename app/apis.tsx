import axios from 'axios';


const API_URL = "https://tfr-backend-eb8264d7dee6.herokuapp.com"
// Sign up a user
export const signUp = async (address: string, username: string, signature: string, twitter_username: string, twitter_access_token: string, spirit: string, clothes: string, hair: string, face: string) => {
  try {
    
    const response =
     await axios.post(`${API_URL}/signup`, { address, username, signature, twitter_username, twitter_access_token, spirit, clothes, hair, face });
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const saveTwitterUsername = async (address: string, signature: string, access_token: string) => {
  try {
    const response = await axios.post(`${API_URL}/save_twitter_username`, { address, signature, access_token });
    return response.data;
  } catch (error) {
    console.error('Error saving twitter:', error);
    throw error;
  }
};


export const getInvited = async (address: string, signature: string, invite_code: string) => {
  try {
    const response = await axios.post(`${API_URL}/get_invited`, { address, signature, invite_code });
    return response.data;
  } catch (error) {
    console.error('Error saving twitter:', error);
    throw error;
  }
};

export const verifyTask = async (address: string, signature: string, task_id: string) => {
  try {
    const response = await axios.post(`${API_URL}/verify_task`, { address, signature, task_id });
    return response.data;
  } catch (error) {
    console.error('Error saving twitter:', error);
    throw error;
  }
};

// Edit a user
export const editAPI = async (address: string, username: string, signature: string, spirit: string, clothes: string, hair: string, face: string) => {
  try {
    const response = await axios.post(`${API_URL}/edit`, { address, username, signature, spirit, clothes, hair, face });
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in a user
export const signIn = async (address: string, signature: string) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, { address, signature });
    return response.data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Get user state
export const getUserState = async (address: string, signature: string) => {
  try {
    const response = await axios.post(`${API_URL}/user_state`, { address, signature });
    return response.data;
  } catch (error) {
    console.error('Error retrieving user state:', error);
    throw error;
  }
};

// Get all user data
export const getUserData = async (address: string, signature: string) => {
  try {
    const response = await axios.post(`${API_URL}/user_data`, { address, signature });
    return response.data;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

// Get user profile
export const getUserProfile = async (username: string) => {
  try {
    const response = await axios.post(`${API_URL}/user_profile`, { username });
    return response.data;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

// Get user chat history
export const getUserChatHistory = async (address: string, signature: string) => {
  try {
    const response = await axios.post(`${API_URL}/user_chat_history`, { address, signature });
    return response.data;
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    throw error;
  }
};

// Perform an action
export const performAction = async (address: string, action: string, actionHistory: any[], chatHistory: any[], signature: string, is_openai_supported:boolean) => {
  try {
    const response = await axios.post(`${API_URL}/perform_action`, {
      address: address,
      action: action,
      action_history: actionHistory,
      chat_history: chatHistory,
      signature,
      is_openai_supported,
    });
    return response.data;
  } catch (error) {
    console.error('Error performing action:', error);
    throw error;
  }
};

export const getActionSuggestion = async (address: string, context: string, actionHistory: any[], level: number, signature: string, is_openai_supported:boolean) => {
  try {
    const response = await axios.post(`${API_URL}/action_suggestion`, {
      address: address,
      context: context,
      action_history: actionHistory,
      level: level,
      signature,
      is_openai_supported
    });
    return response.data;
  } catch (error) {
    console.error('Error performing action:', error);
    throw error;
  }
};

export const saveHistory = async (address: string, chatHistory: any[], signature: string) => {
  try {
    const response = await axios.post(`${API_URL}/save_history`, {
      address: address,
      chat_history: chatHistory,
      signature
    });
    return response.data;
  } catch (error) {
    console.error('Error performing action:', error);
    throw error;
  }
};

// Get leaderboard by level
export const getLevelLeaderboard = async () => {
  try {
    const response = await axios.get(`${API_URL}/leaderboard/level`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving level leaderboard:', error);
    throw error;
  }
};

// Get leaderboard by points
export const getPointsLeaderboard = async () => {
  try {
    const response = await axios.get(`${API_URL}/leaderboard/points`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving points leaderboard:', error);
    throw error;
  }
};

export const getAllTasks = async () => {
  try {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    throw error;
  }
};

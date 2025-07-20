// api.js or axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;

// In your main App.js or index.js
// import axios from 'axios';

// axios.defaults.baseURL = 'http://localhost:5000/api';
// axios.defaults.headers.common['Authorization'] = 'Bearer token';
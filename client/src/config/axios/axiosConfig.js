// First we need to import axios.js
import axios from 'axios';

// axios default base URL
const instance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:8000'
});

export default instance;
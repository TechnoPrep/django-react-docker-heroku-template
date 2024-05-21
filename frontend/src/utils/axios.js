import axios from "axios";

const API_URL = import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://django-react-heroku-test-1de48afcdf56.herokuapp.com/api';

const api = axios.create({
  baseURL: API_URL
});

export default api;

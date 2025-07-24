import acios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:5002',
});
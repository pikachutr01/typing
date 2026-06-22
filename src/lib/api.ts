import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3001/api',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

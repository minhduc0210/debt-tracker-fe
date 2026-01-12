import axios from 'axios';

const STORAGE_API_KEY = 'VITE_ADMIN_KEY';

const getApiKey = () => {
  let key = localStorage.getItem(STORAGE_API_KEY);
  if (!key) {
    key = window.prompt('Nhập mã bí mật (Admin Key) để tiếp tục:');
    if (key) {
      key = key.trim();
      localStorage.setItem(STORAGE_API_KEY, key);
    }
  }
  return key;
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const apiKey = getApiKey();
    if (apiKey && config.headers) {
      config.headers['x-api-key'] = apiKey;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401) {
      localStorage.removeItem(STORAGE_API_KEY);
      alert('Mã truy cập không đúng hoặc đã hết hạn!');
      window.location.reload();
    }
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
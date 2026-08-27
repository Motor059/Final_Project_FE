import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/token/refresh`,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            );

            const { accessToken: newAccess, refreshToken: newRefresh } = refreshResponse.data.data;
            
            localStorage.setItem('accessToken', newAccess);
            localStorage.setItem('refreshToken', newRefresh);
            
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
            
          } catch (refreshError) {
            console.warn("로그인이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/home';
            return Promise.reject(refreshError);
          }
        }
      }

      if (status === 400 || status === 502) {
        if (errorData.data?.nextAction?.type === 'RETRY_INPUT') {
          return Promise.reject({ type: 'RETRY_INPUT', message: errorData.message });
        }
      } else if (status === 422) {
        return Promise.reject({ type: 'TOO_SHORT', message: errorData.message });
      } else if (status === 403) {
        console.error("권한이 없습니다.");
      } else if (status === 404) {
        console.error("요청하신 데이터를 찾을 수 없습니다.");
      } else if (status === 409) {
        console.error("상태 충돌이 발생했습니다.");
      }
    }
    return Promise.reject(error);
  }
);
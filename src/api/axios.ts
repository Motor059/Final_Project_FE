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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      // 400 Bad Request (음성 없음) 또는 502 Bad Gateway (STT 실패)
      if (status === 400 || status === 502) {
        if (errorData.data?.nextAction?.type === 'RETRY_INPUT') {
          console.warn("음성 인식 실패. 재시도가 필요합니다.");
          return Promise.reject({ type: 'RETRY_INPUT', message: errorData.message });
        }
      }
      else if (status === 422) {
        console.warn("답변이 너무 짧습니다.");
        // 컴포넌트에서 알림을 띄울 수 있도록 Reject 객체에 특정 타입을 포함
        return Promise.reject({ type: 'TOO_SHORT', message: errorData.message });
      } 
      // 공통 에러 처리 (403, 404, 409 등)
      else if (status === 401 || status === 403) {
        console.error("권한이 없습니다. 다시 로그인해주세요.");
      } else if (status === 404) {
        console.error("요청하신 세션/데이터를 찾을 수 없습니다.");
      } else if (status === 409) {
        console.error("이미 답변했거나 진행 상태가 올바르지 않습니다.");
      }
    }
    return Promise.reject(error);
  }
);
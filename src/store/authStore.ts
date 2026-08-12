import { create } from 'zustand';
import { getMyInfo } from '@/api/userApi';
import { getHistoryList } from '@/api/historyApi';
import type { UserResponse } from '@/types/user';

interface AuthState {
  isLoggedIn: boolean;
  user: UserResponse | null;
  lastSetting: string | null;
  fetchUserInfo: () => Promise<void>;
}

const formatCompanyType = (type: string) => {
  const map: Record<string, string> = {
    BIG_TECH_SW: '대기업 SW',
    SERVICE: '서비스 기업',
    FINANCE_IT: '금융 IT',
  };
  return map[type] || type;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  lastSetting: null,
  
  fetchUserInfo: async () => {
    try {
      const [userInfo, historyData] = await Promise.all([
        getMyInfo(),
        getHistoryList()
      ]);

      let formattedSetting = null;

      if (historyData.sessions.length > 0) {
        const latest = historyData.sessions[0];
        
        const company = latest.companyName || formatCompanyType(latest.companyType); 
        const job = latest.jobRole; 
        const stage = latest.interviewStage === 'TECHNICAL' ? '기술' : '인성'; 
        
        formattedSetting = [company, job, stage].filter(Boolean).join(' · ');
      }

      set({ 
        isLoggedIn: true, 
        user: userInfo, 
        lastSetting: formattedSetting 
      });

    } catch (error) {
      set({ isLoggedIn: false, user: null, lastSetting: null });
    }
  },
}));
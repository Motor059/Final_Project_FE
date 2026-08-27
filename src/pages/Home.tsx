import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/common/Header';
import HeroSection from '@/components/home/HeroSection';
import FeatureSection from '@/components/home/FeatureSection';
import TutorialSection from '@/components/home/TutorialSection';
import Footer from '@/components/common/Footer';

export default function HomePage() {
  const { isLoggedIn, user, lastSetting, fetchUserInfo } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserInfo();
    }
  }, [fetchUserInfo]);

  return (
    <>
      <Header />      
      <main className="max-w-[1080px] mx-auto px-[40px] min-h-[calc(100vh-68px)] flex flex-col">
        <HeroSection 
          isLoggedIn={isLoggedIn} 
          userName={user?.nickname} 
          lastSetting={lastSetting} 
        />
        <FeatureSection />
        
        {/* 비로그인 상태일 때만 튜토리얼 노출 */}
        {!isLoggedIn && <TutorialSection />}
        
        <Footer />
      </main>
    </>
  );
}
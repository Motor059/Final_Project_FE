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
    fetchUserInfo();
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
        {!isLoggedIn && <TutorialSection />}
        <Footer />
      </main>
    </>
  );
}
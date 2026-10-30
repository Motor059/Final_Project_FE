import { useEffect, useRef } from 'react';
import { hasMemberSession } from '@/lib/authStorage';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HeroSection from '@/components/home/HeroSection';
import InterviewPreview from '@/components/home/InterviewPreview';
import CompanyMarquee from '@/components/home/CompanyMarquee';
import FeatureSection from '@/components/home/FeatureSection';
import CompanySection from '@/components/home/CompanySection';
import HomeCallToAction from '@/components/home/HomeCallToAction';
import useHomeMotion from '@/components/home/useHomeMotion';
import '@/components/home/home.css';

export default function HomePage() {
  const { isLoggedIn, user, lastSetting, fetchUserInfo } = useAuthStore();
  const pageRef = useRef<HTMLElement>(null);
  useHomeMotion(pageRef);

  useEffect(() => {
    if (hasMemberSession()) {
      void fetchUserInfo().catch((error) => console.error('홈 사용자 정보 조회 실패:', error));
    }
  }, [fetchUserInfo]);

  return (
    <>
      <Header />
      <main ref={pageRef} className="devoir-home">
        <div className="dv-home-progress" aria-hidden="true" />
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute', overflow: 'hidden' }}>
          <defs>
            <filter id="dv-home-grain" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.12 0 0 0 0 0.11 0 0 0 0 0.1 0 0 0 0.35 -0.1" />
            </filter>
            <filter id="dv-home-grain-white" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1 0 0 0 0 0.98 0 0 0 0 0.94 0 0 0 0.35 -0.1" />
            </filter>
          </defs>
        </svg>
        <HeroSection isLoggedIn={isLoggedIn} userName={user?.nickname} userId={user?.id} lastSetting={lastSetting} />
        <InterviewPreview />
        <CompanyMarquee />
        <FeatureSection />
        <CompanySection />
        <HomeCallToAction />
        <Footer />
      </main>
    </>
  );
}

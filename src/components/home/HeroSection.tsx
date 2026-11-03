import { useNavigate } from 'react-router-dom';
import type { LastInterviewSetting } from '@/types/setup';
import { chooseLastInterviewSetup, readSavedInterviewSetup } from '@/lib/interviewSetup';
import { companyTypeLabel } from '@/lib/reportDisplay';

interface HeroSectionProps {
  isLoggedIn: boolean;
  userName?: string;
  userId?: number;
  lastSetting?: LastInterviewSetting | null;
}

export default function HeroSection({ isLoggedIn, userName, userId, lastSetting }: HeroSectionProps) {
  const navigate = useNavigate();
  const savedSetup = isLoggedIn && userId ? readSavedInterviewSetup(userId) : null;
  const retrySetup = isLoggedIn ? chooseLastInterviewSetup(savedSetup, lastSetting || null) : null;
  const settingLabel = retrySetup
    ? `${companyTypeLabel(retrySetup.companyType)}, ${retrySetup.interviewStage === 'TECHNICAL' ? '기술' : '인성'}`
    : null;

  const handleRetry = () => {
    if (retrySetup) navigate('/setup', { state: { retrySetup } });
  };

  return (
    <section className="dv-home-hero">
      <div className="dv-spot" aria-hidden="true" />
      <div className="dv-hero-glow" aria-hidden="true" />
      <svg className="dv-hero-noise" aria-hidden="true">
        <rect width="100%" height="100%" filter="url(#dv-home-grain)" />
      </svg>
      {isLoggedIn ? (
        <div className="wrap dv-hero-content member">
          <span className="dv-up" style={{ fontSize: 15, fontWeight: 500, color: '#8A857D' }}>안녕하세요</span>
          <h1 className="dv-hero-title member">
            <span className="dv-w" style={{ animationDelay: '.06s' }}>{userName || '사용자'}님,</span>{' '}
            <span className="dv-w" style={{ animationDelay: '.13s' }}>다시</span>{' '}
            <span className="dv-w" style={{ animationDelay: '.20s' }}>오셨네요.</span>
          </h1>
          <div className="dv-up dv-d2 dv-hero-actions">
            <button className="dv-btn-ink" type="button" onClick={() => navigate('/setup')}>모의면접 시작</button>
            {retrySetup && (
              <button className="dv-btn-ghost" type="button" onClick={handleRetry} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                마지막 설정으로 시작
                <span style={{ fontSize: 14.5, fontWeight: 500, color: '#A8A29E' }}>{settingLabel}</span>
              </button>
            )}
          </div>
          <span className="dv-up dv-d3 dv-hero-hint">
            {retrySetup ? '마지막 설정은 지난번 면접의 기업 유형과 면접 단계 그대로 시작해요' : '첫 모의면접 설정을 시작해 보세요!'}
          </span>
        </div>
      ) : (
        <div className="wrap dv-hero-content">
          <h1 className="dv-hero-title">
            {['삼성,', '네이버,', '카카오,', '토스', '면접을'].map((word, index) => (
              <span key={word}><span className="dv-w" style={{ animationDelay: `${.06 + index * .07}s` }}>{word}</span>{' '}</span>
            ))}
            <span style={{ whiteSpace: 'nowrap' }}>
              {['AI와', '미리', '연습하세요'].map((word, index) => (
                <span key={word}><span className="dv-w" style={{ animationDelay: `${.41 + index * .07}s` }}>{word}</span>{index < 2 ? ' ' : ''}</span>
              ))}
            </span>
          </h1>
          <p className="dv-up dv-d1 dv-hero-description">
            실제 면접관처럼 목소리로 질문하고, 답변에 따라 더 깊이 파고들어요. 끝나면 다음 면접에서 무엇을 바꿔야 할지 구체적으로 알려드려요.
          </p>
          <div className="dv-up dv-d2 dv-hero-actions">
            <button className="dv-btn-ink" type="button" onClick={() => navigate('/setup')}>모의면접 시작</button>
          </div>
          <span className="dv-up dv-d3 dv-hero-hint">로그인 없이 바로 체험할 수 있어요</span>
        </div>
      )}
    </section>
  );
}

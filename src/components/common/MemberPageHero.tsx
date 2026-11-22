import type { ReactNode } from 'react';
import TitleWords from '@/components/common/TitleWords';
import './member-pages.css';

export default function MemberPageHero({ eyebrow, title, titleWords, description }: {
  eyebrow: string; title: ReactNode; titleWords?: ReactNode[]; description?: string;
}) {
  return <section className="member-page-hero">
    <div className="member-page-glow" aria-hidden="true" />
    <div className="member-page-container member-page-heading">
      <p className="member-page-eyebrow">{eyebrow}</p>
      <h1 className="member-page-title has-title-words"><TitleWords words={titleWords ?? (typeof title === 'string' ? title.split(/\s+/) : [title])} /></h1>
      {description && <p className="member-page-description">{description}</p>}
    </div>
  </section>;
}

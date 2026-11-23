import { Fragment, type CSSProperties, type ReactNode } from 'react';
import './title-words.css';

export default function TitleWords({ words }: { words: ReactNode[] }) {
  return <>{words.map((word, index) => <Fragment key={index}>
    <span className="page-title-word" style={{ '--title-word-delay': `${.06 + index * .07}s` } as CSSProperties}>{word}</span>
    {index < words.length - 1 ? ' ' : null}
  </Fragment>)}</>;
}

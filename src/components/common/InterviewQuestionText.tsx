interface InterviewQuestionTextProps {
  text: string;
  heading?: 'h1' | 'h2';
  dimmed?: boolean;
  busy?: boolean;
  label?: string;
}

export default function InterviewQuestionText({ text, heading = 'h2', dimmed = false, busy = false, label }: InterviewQuestionTextProps) {
  const Heading = heading;
  return <Heading
    aria-label={label}
    aria-busy={busy || undefined}
    className={`w-full max-w-3xl text-center text-2xl sm:text-[28px] font-bold leading-relaxed tracking-normal whitespace-normal break-keep transition-opacity duration-500 ${dimmed ? 'opacity-30' : 'opacity-100'}`}
    style={{ textWrap: 'wrap' }}
  >"{text}"</Heading>;
}

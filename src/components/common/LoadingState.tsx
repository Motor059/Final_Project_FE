interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingIndicator({ size = 'md', className = '' }: LoadingIndicatorProps) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
      className={`devoir-loading-spinner inline-block shrink-0 ${sizeClass} ${className}`}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" opacity="0.15" />
      <circle className="devoir-loading-arc" cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="20 60" />
    </svg>
  );
}

export function LoadingDots() {
  return <span className="devoir-loading-dots" aria-hidden="true">
    <span className="devoir-loading-dot" />
    <span className="devoir-loading-dot" />
    <span className="devoir-loading-dot" />
  </span>;
}

interface LoadingStateProps {
  title: string;
  description?: string;
  inline?: boolean;
  className?: string;
}

export default function LoadingState({ title, description, inline = false, className = '' }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true"
      className={`devoir-loading-enter ${inline ? 'inline-flex items-center gap-2.5 text-[#78716C]' : 'flex flex-col items-center text-center'} ${className}`}>
      {inline ? (
        <>
          <LoadingIndicator size="sm" />
          <span className="text-[13px] leading-relaxed">{title}<LoadingDots /></span>
        </>
      ) : (
        <>
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F4] text-[#78716C]">
            <LoadingIndicator />
          </span>
          <p className="break-keep text-[17px] font-semibold leading-relaxed tracking-[-0.02em] text-[#44403C]">{title}<LoadingDots /></p>
          {description && <p className="mt-2 max-w-[320px] break-keep text-[13px] leading-[1.8] text-[#8A847F]">{description}</p>}
        </>
      )}
    </div>
  );
}

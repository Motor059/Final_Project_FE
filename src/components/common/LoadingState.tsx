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
      <path d="M12 2.5A9.5 9.5 0 0 1 21.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
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
          <span className="text-[13px] leading-relaxed">{title}</span>
        </>
      ) : (
        <>
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F4] text-[#78716C]">
            <LoadingIndicator />
          </span>
          <p className="break-keep text-[17px] font-semibold leading-relaxed tracking-[-0.02em] text-[#44403C]">{title}</p>
          {description && <p className="mt-2 max-w-[320px] break-keep text-[13px] leading-[1.8] text-[#8A847F]">{description}</p>}
        </>
      )}
    </div>
  );
}

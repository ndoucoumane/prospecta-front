import React from 'react';

interface ProspectaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const ProspectaLogo: React.FC<ProspectaLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-bold',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Flat blue symbol: Crisp targeted geometric emblem */}
      <div
        className={`${iconSizes[size]} bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          {/* Flat stylized target / compass / forward chevron */}
          <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" fill="none" />
          <path d="M12 7v5l3 3" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`${textSizes[size]} tracking-tight text-gray-900`}>
          Prospecta
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-gray-500 tracking-normal mt-0.5">
            SaaS Commercial B2B
          </span>
        )}
      </div>
    </div>
  );
};

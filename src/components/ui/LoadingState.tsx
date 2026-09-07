import React from 'react';

interface LoadingStateProps {
  message?: string;
  type?: 'spinner' | 'skeleton';
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Chargement...',
  type = 'spinner',
  rows = 4,
  className = '',
}) => {
  if (type === 'skeleton') {
    return (
      <div className={`space-y-3 py-4 ${className}`} aria-busy="true" aria-label="Chargement du contenu">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-gray-100 border border-gray-200 rounded-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
      aria-busy="true"
      aria-label={message}
    >
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      {message && <p className="text-xs text-gray-500 mt-2.5 font-medium">{message}</p>}
    </div>
  );
};

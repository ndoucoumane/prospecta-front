import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Une erreur est survenue',
  message = 'Vérifiez votre connexion puis réessayez.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`border border-red-200 bg-red-50/50 rounded-lg p-6 text-center flex flex-col items-center justify-center ${className}`}
      role="alert"
    >
      <div className="w-9 h-9 rounded-md bg-red-100 text-red-600 flex items-center justify-center mb-2.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-600 mt-1 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Réessayer
        </Button>
      )}
    </div>
  );
};

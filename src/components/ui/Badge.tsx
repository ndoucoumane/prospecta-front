import React from 'react';

export type BadgeVariant = 'default' | 'blue' | 'success' | 'warning' | 'error' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    default: {
      container: 'bg-gray-100 text-gray-700 border-gray-200',
      dot: 'bg-gray-500',
    },
    gray: {
      container: 'bg-gray-50 text-gray-600 border-gray-200',
      dot: 'bg-gray-400',
    },
    blue: {
      container: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-600',
    },
    success: {
      container: 'bg-green-50 text-green-700 border-green-200',
      dot: 'bg-green-600',
    },
    warning: {
      container: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    error: {
      container: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-600',
    },
  };

  const current = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full select-none ${sizeStyles[size]} ${current.container} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />}
      {children}
    </span>
  );
};

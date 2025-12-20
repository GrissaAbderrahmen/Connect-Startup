// components/common/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) => {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-teal hover:shadow-teal-lg',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-green hover:shadow-green-lg',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

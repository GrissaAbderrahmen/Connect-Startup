// components/common/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            // Base styles with mobile-optimized sizing
            'w-full px-4 py-3 min-h-[44px] text-base',
            // Border and rounding
            'border rounded-lg',
            // Focus states
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none',
            // Transition
            'transition-colors duration-200',
            // Error state
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

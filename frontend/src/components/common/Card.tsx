// components/common/Card.tsx
import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card = ({ children, className, onClick, hoverable = false }: CardProps) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md p-6',
        hoverable && 'hover:shadow-lg transition-shadow duration-200 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
// components/common/Avatar.tsx
import { cn } from '@/utils/helpers';

interface AvatarProps {
    name?: string;
    src?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    isOnline?: boolean;
}

export const Avatar = ({
    name = '',
    src,
    size = 'md',
    className,
    isOnline
}: AvatarProps) => {
    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={cn('relative flex-shrink-0', className)}>
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={cn(
                        'rounded-full object-cover',
                        sizes[size]
                    )}
                />
            ) : (
                <div
                    className={cn(
                        'rounded-full bg-primary-100 flex items-center justify-center font-medium text-primary-600',
                        sizes[size]
                    )}
                >
                    {getInitials(name) || '?'}
                </div>
            )}
            {isOnline !== undefined && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 rounded-full border-2 border-white',
                        isOnline ? 'bg-green-500' : 'bg-neutral-400',
                        size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
                    )}
                />
            )}
        </div>
    );
};

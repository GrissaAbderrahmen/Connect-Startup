// components/common/Dropdown.tsx
import { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/helpers';

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

export const Dropdown = ({
    trigger,
    children,
    align = 'right',
    className
}: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={cn(
                        'absolute z-50 mt-2 min-w-[200px] bg-white rounded-lg shadow-lg border border-neutral-200 py-1',
                        align === 'right' ? 'right-0' : 'left-0',
                        className
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

interface DropdownItemProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    danger?: boolean;
}

export const DropdownItem = ({
    children,
    onClick,
    className,
    danger = false
}: DropdownItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors flex items-center gap-2',
                danger ? 'text-red-600 hover:bg-red-50' : 'text-neutral-700',
                className
            )}
        >
            {children}
        </button>
    );
};

export const DropdownDivider = () => (
    <div className="my-1 border-t border-neutral-200" />
);

// components/common/Modal.tsx
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className
}: ModalProps) => {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative w-full bg-white rounded-xl shadow-xl m-4',
                    sizes[size],
                    className
                )}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className={cn(!title && 'pt-6', 'px-6 pb-6')}>
                    {!title && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};

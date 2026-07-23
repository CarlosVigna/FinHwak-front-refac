import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={['bg-surface rounded-lg shadow-lg p-6 max-w-lg w-full', className].join(' ')}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <h2 className="text-lg font-semibold text-text mb-4">{title}</h2>
                )}
                {children}
            </div>
        </div>,
        document.body
    );
}

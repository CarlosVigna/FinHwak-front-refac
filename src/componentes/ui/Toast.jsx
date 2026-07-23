import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const VARIANT_CONFIG = {
    success: { classes: 'border-success bg-surface text-success', Icon: FiCheckCircle },
    error: { classes: 'border-danger bg-surface text-danger', Icon: FiXCircle },
    info: { classes: 'border-info bg-surface text-info', Icon: FiInfo },
    warning: { classes: 'border-warning bg-surface text-warning', Icon: FiAlertTriangle },
};

export default function Toast({ message, variant = 'info', duration = 4000, onClose }) {
    useEffect(() => {
        if (!duration) return;
        const timer = setTimeout(() => onClose?.(), duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const { classes, Icon } = VARIANT_CONFIG[variant];

    return (
        <div
            role="alert"
            className={[
                'flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 shadow-lg',
                'bg-surface text-text',
                classes,
            ].join(' ')}
        >
            <Icon className="shrink-0 text-lg" />
            <span className="flex-1 text-sm">{message}</span>
            <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="shrink-0 text-muted hover:text-text"
            >
                <FiX />
            </button>
        </div>
    );
}

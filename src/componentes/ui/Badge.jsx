const VARIANT_CLASSES = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    neutral: 'bg-surface2 text-muted2',
    info: 'bg-info/10 text-info',
};

export default function Badge({ variant = 'neutral', className = '', children, ...rest }) {
    return (
        <span
            className={[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                VARIANT_CLASSES[variant],
                className,
            ].join(' ')}
            {...rest}
        >
            {children}
        </span>
    );
}

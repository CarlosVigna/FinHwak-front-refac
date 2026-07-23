const VARIANT_CLASSES = {
    default: 'bg-surface border border-border rounded-lg p-4',
    flat: 'bg-surface rounded-lg p-4',
    interactive: 'bg-surface border border-border rounded-lg p-4 hover:shadow-md transition cursor-pointer',
};

export default function Card({ variant = 'default', className = '', children, ...rest }) {
    return (
        <div className={[VARIANT_CLASSES[variant], className].join(' ')} {...rest}>
            {children}
        </div>
    );
}

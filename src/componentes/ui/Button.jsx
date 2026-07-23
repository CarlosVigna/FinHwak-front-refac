import { forwardRef } from 'react';

const VARIANT_CLASSES = {
    primary: 'bg-primary text-white hover:bg-primary-light',
    secondary: 'bg-secondary text-white hover:opacity-90',
    outline: 'border border-primary text-primary bg-transparent hover:bg-surface2',
    danger: 'bg-danger text-white hover:opacity-90',
    ghost: 'bg-transparent text-primary hover:bg-surface2',
};

const SIZE_CLASSES = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-base px-4 py-2 gap-2',
    lg: 'text-lg px-5 py-2.5 gap-2.5',
};

const Button = forwardRef(function Button(
    {
        variant = 'primary',
        size = 'md',
        className = '',
        disabled = false,
        type = 'button',
        children,
        ...rest
    },
    ref
) {
    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled}
            className={[
                'inline-flex items-center justify-center rounded-md font-medium',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                VARIANT_CLASSES[variant],
                SIZE_CLASSES[size],
                className,
            ].join(' ')}
            {...rest}
        >
            {children}
        </button>
    );
});

export default Button;

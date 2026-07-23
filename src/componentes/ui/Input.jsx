import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
    { label, error, helperText, className = '', id, ...rest },
    ref
) {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-text">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                className={[
                    'rounded-md border bg-surface px-3 py-2 text-base text-text',
                    'placeholder:text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border',
                    className,
                ].join(' ')}
                aria-invalid={!!error}
                aria-describedby={error || helperText ? `${inputId}-desc` : undefined}
                {...rest}
            />
            {(error || helperText) && (
                <span
                    id={`${inputId}-desc`}
                    className={`text-xs ${error ? 'text-danger' : 'text-muted'}`}
                >
                    {error || helperText}
                </span>
            )}
        </div>
    );
});

export default Input;

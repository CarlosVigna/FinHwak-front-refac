import { forwardRef, useId } from 'react';

const Textarea = forwardRef(function Textarea(
    { label, error, helperText, className = '', id, rows = 3, ...rest },
    ref
) {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={textareaId} className="text-sm font-medium text-text">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                id={textareaId}
                rows={rows}
                className={[
                    'rounded-md border bg-surface px-3 py-2 text-base text-text',
                    'placeholder:text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'resize-y',
                    error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border',
                    className,
                ].join(' ')}
                aria-invalid={!!error}
                aria-describedby={error || helperText ? `${textareaId}-desc` : undefined}
                {...rest}
            />
            {(error || helperText) && (
                <span
                    id={`${textareaId}-desc`}
                    className={`text-xs ${error ? 'text-danger' : 'text-muted'}`}
                >
                    {error || helperText}
                </span>
            )}
        </div>
    );
});

export default Textarea;

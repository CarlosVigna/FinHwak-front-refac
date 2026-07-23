import { forwardRef, useId } from 'react';

/**
 * Wrapper de <select> HTML simples estilizado com Tailwind.
 * Não substitui react-select onde ele for necessário (busca, multi-select).
 */
const Select = forwardRef(function Select(
    { label, error, helperText, options = [], placeholder, className = '', id, ...rest },
    ref
) {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={selectId} className="text-sm font-medium text-text">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                id={selectId}
                className={[
                    'rounded-md border bg-surface px-3 py-2 text-base text-text',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border',
                    className,
                ].join(' ')}
                aria-invalid={!!error}
                aria-describedby={error || helperText ? `${selectId}-desc` : undefined}
                {...rest}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {(error || helperText) && (
                <span
                    id={`${selectId}-desc`}
                    className={`text-xs ${error ? 'text-danger' : 'text-muted'}`}
                >
                    {error || helperText}
                </span>
            )}
        </div>
    );
});

export default Select;

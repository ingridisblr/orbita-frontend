// #region Importações
import { forwardRef, useId }         from 'react';
import type { SelectHTMLAttributes } from 'react';
import './Select.css';
// #endregion

// #region Tipos
interface    SelectOption {
  value:     string;
  label:     string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label:        string;
  options:      SelectOption[];
  placeholder?: string;
  error?:       string;
  helperText?:  string;
}
// #endregion

// #region Componente
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      options,
      placeholder = 'Selecionar...',
      error,
      helperText,
      id,
      className,
      children,
      multiple,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) {
    // #region Identificação e acessibilidade
    const generatedId = useId();
    const selectId    = id ?? generatedId;
    const messageId   = `${selectId}-message`;
    const message     = error || helperText;

    const describedBy = [
      ariaDescribedBy,
      message ? messageId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
    // #endregion

    // #region Classes
    const classes = [
      'select',
      error ? 'select--error' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    // #endregion

    // #region Renderização
    return (
      <div className="select-field">
        <label className="select-field__label" htmlFor={selectId}>
          {label}
          {props.required && <span> (obrigatório)</span>}
        </label>

        <select
          {...props}
          ref={ref}
          id={selectId}
          multiple={multiple}
          className={classes}
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={describedBy}
        >
          {!multiple && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}

          {children}
        </select>

        {message && (
          <p
            id={messageId}
            className={
              error
                ? 'select-field__message select-field__message--error'
                : 'select-field__message'
            }
            aria-live="polite"
          >
            {message}
          </p>
        )}
      </div>
    );
    // #endregion
  },
);
// #endregion
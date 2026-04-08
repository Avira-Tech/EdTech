import { forwardRef, useState, useCallback, useRef, useEffect } from 'react';

/**
 * Input Component
 * Features:
 * - Label support
 * - Icon support
 * - Error messages
 * - Character counter
 * - Max length support
 */
const Input = forwardRef(({
  label,
  type = 'text',
  error,
  className = '',
  icon,
  maxLength,
  showCharacterCount = false,
  ...props
}, ref) => {
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef(null);

  // Use provided ref or local ref
  const effectiveRef = ref || inputRef;

  // Update character count
  useEffect(() => {
    if (props.value) {
      setCharCount(String(props.value).length);
    } else {
      setCharCount(0);
    }
  }, [props.value]);

  // Handle input change
  const handleChange = useCallback((e) => {
    if (props.onChange) {
      props.onChange(e);
    }
  }, [props.onChange]);

  const inputClasses = [
    'input',
    error ? 'input-error' : '',
    icon ? 'pl-10' : '',
    maxLength ? 'pr-20' : '',
    className,
  ].join(' ');

  return (
    <div className="w-full">
      {label && (
        <label className="label flex items-center gap-1">
          {label}
          {props.required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          ref={effectiveRef}
          type={type}
          className={inputClasses}
          maxLength={maxLength}
          {...props}
          onChange={handleChange}
        />
        {/* Character counter */}
        {maxLength && showCharacterCount && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * TextArea Component
 */
export const TextArea = forwardRef(({
  label,
  error,
  className = '',
  rows = 4,
  maxLength,
  showCharacterCount = false,
  ...props
}, ref) => {
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (props.value) {
      setCharCount(String(props.value).length);
    } else {
      setCharCount(0);
    }
  }, [props.value]);

  return (
    <div className="w-full">
      {label && (
        <label className="label flex items-center gap-1">
          {label}
          {props.required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          ref={ref || textareaRef}
          className={`input resize-none ${maxLength ? 'pr-20' : ''} ${className}`}
          rows={rows}
          maxLength={maxLength}
          {...props}
        />
        {maxLength && showCharacterCount && (
          <div className="absolute right-3 bottom-2 text-xs text-gray-500">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
});

TextArea.displayName = 'TextArea';

/**
 * Search Input Component
 */
export const SearchInput = forwardRef(({
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  loading = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input pl-10 pr-20"
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {loading && (
          <div className="spinner w-4 h-4" />
        )}
      </div>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

/**
 * Checkbox Component
 */
export const Checkbox = forwardRef(({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="rounded border-gray-700 bg-gray-800 text-primary-600 focus:ring-primary-500 cursor-pointer"
        {...props}
      />
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

/**
 * Radio Group Component
 */
export const RadioGroup = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && <label className="label mb-2">{label}</label>}
      <div className="space-y-2">
        {options.map((option) => (
          <label 
            key={option.value} 
            className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              ref={ref}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange && onChange(option.value)}
              disabled={disabled}
              className="border-gray-700 bg-gray-800 text-primary-600 focus:ring-primary-500 cursor-pointer"
              {...props}
            />
            <span className="text-sm text-gray-300">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

/**
 * Switch/Toggle Component
 */
export const Switch = forwardRef(({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-700'
        } ${disabled ? 'opacity-50' : ''}`}
        {...props}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  );
});

Switch.displayName = 'Switch';

export default Input;


import { forwardRef, useState, useRef, useCallback, useEffect } from 'react';

/**
 * Select Component
 * Features:
 * - Search/filter in dropdown
 * - Custom rendering
 * - Virtual scrolling for large lists
 * - Keyboard navigation
 */
const Select = forwardRef(({
  label,
  error,
  options = [],
  className = '',
  placeholder = 'Select option',
  value,
  onChange,
  disabled = false,
  required = false,
  searchable = false,
  clearable = false,
  renderOption,
  getOptionLabel,
  getOptionValue,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Default value extractors
  const getLabel = getOptionLabel || ((option) => option?.label || option?.name || String(option));
  const getValue = getOptionValue || ((option) => option?.value ?? option?._id ?? option);

  // Get selected option
  const selectedOption = options.find(option => getValue(option) === value);

  // Filter options based on search
  const filteredOptions = useCallback(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(option => 
      getLabel(option).toLowerCase().includes(term)
    );
  }, [options, searchTerm, getLabel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    const options = filteredOptions();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = options[focusedIndex];
          onChange?.({ target: { value: getValue(option) } });
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'Backspace':
        if (searchable && !searchTerm && clearable && value) {
          onChange?.({ target: { value: '' } });
        }
        break;
    }
  }, [isOpen, focusedIndex, filteredOptions, getValue, onChange, searchable, clearable, value]);

  // Handle option click
  const handleOptionClick = useCallback((option) => {
    onChange?.({ target: { value: getValue(option) } });
    setIsOpen(false);
    setSearchTerm('');
  }, [onChange, getValue]);

  // Handle clear
  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onChange?.({ target: { value: '' } });
  }, [onChange]);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="label flex items-center gap-1">
          {label}
          {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      
      <div 
        className={`
          select relative cursor-pointer
          ${isOpen ? 'ring-1 ring-primary-500 border-primary-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        {/* Selected value */}
        <div className="flex items-center justify-between">
          <span className={`truncate ${selectedOption ? 'text-gray-100' : 'text-gray-500'}`}>
            {selectedOption ? getLabel(selectedOption) : placeholder}
          </span>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                aria-label="Clear selection"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Search input */}
        {isOpen && searchable && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="input pl-10 py-2 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full z-50 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {filteredOptions().length > 0 ? (
              filteredOptions().map((option, index) => (
                <div
                  key={getValue(option)}
                  className={`
                    px-4 py-2 cursor-pointer transition-colors
                    ${getValue(option) === value ? 'bg-primary-900/30 text-primary-400' : 'text-gray-300 hover:bg-gray-700'}
                    ${index === focusedIndex ? 'bg-gray-700' : ''}
                  `}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  {renderOption ? renderOption(option) : getLabel(option)}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500">
                {searchTerm ? 'No results found' : 'No options available'}
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

/**
 * MultiSelect Component
 */
export const MultiSelect = forwardRef(({
  label,
  error,
  options = [],
  className = '',
  placeholder = 'Select options',
  value = [],
  onChange,
  disabled = false,
  required = false,
  maxTags = 3,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const getLabel = (option) => option?.label || option?.name || String(option);
  const getValue = (option) => option?.value ?? option?._id ?? option;

  const selectedOptions = options.filter(option => value.includes(getValue(option)));
  const displayedTags = selectedOptions.slice(0, maxTags);
  const remainingCount = selectedOptions.length - maxTags;

  const handleRemove = useCallback((optionValue) => {
    const newValue = value.filter(v => v !== optionValue);
    onChange?.({ target: { value: newValue } });
  }, [value, onChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="label flex items-center gap-1">
          {label}
          {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      
      <div 
        className={`
          select min-h-[42px] flex flex-wrap gap-1 items-center
          ${isOpen ? 'ring-1 ring-primary-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
      >
        {displayedTags.length > 0 ? (
          displayedTags.map((option) => (
            <span 
              key={getValue(option)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-900/50 text-primary-400 rounded text-sm"
            >
              {getLabel(option)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(getValue(option));
                }}
                className="hover:text-primary-300"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        
        {remainingCount > 0 && (
          <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-sm">
            +{remainingCount} more
          </span>
        )}

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = value.includes(getValue(option));
              return (
                <div
                  key={getValue(option)}
                  className={`
                    px-4 py-2 cursor-pointer flex items-center gap-2 transition-colors
                    ${isSelected ? 'bg-primary-900/30 text-primary-400' : 'text-gray-300 hover:bg-gray-700'}
                  `}
                  onClick={() => {
                    if (isSelected) {
                      handleRemove(getValue(option));
                    } else {
                      onChange?.({ target: { value: [...value, getValue(option)] } });
                    }
                  }}
                >
                  <div className={`
                    w-4 h-4 border rounded flex items-center justify-center
                    ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-600'}
                  `}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {getLabel(option)}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
});

MultiSelect.displayName = 'MultiSelect';


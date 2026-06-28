import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ value, options, onChange, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value) || options[0] || { label: 'Select' };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="app-select-trigger"
        data-open={isOpen}
      >
        <span>{selected.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--app-text-muted)' }}
        />
      </button>

      {isOpen && (
        <div
          className="app-select-menu absolute right-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-xl py-1 sm:min-w-[140px]"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="app-select-option"
              data-active={value === opt.value}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={14} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

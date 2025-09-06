import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({} as any);

export const Select: React.FC<SelectProps> = ({ value, onValueChange, disabled, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className }) => {
  const { disabled, isOpen, setIsOpen } = React.useContext(SelectContext);
  
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className }) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span className={cn('block truncate', className)}>
      {value || placeholder}
    </span>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className }) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext);
  
  const handleClick = () => {
    if (onValueChange) {
      onValueChange(value);
    }
    setIsOpen(false);
  };
  
  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex cursor-pointer select-none items-center py-2 px-3 text-sm hover:bg-gray-100 focus:bg-gray-100',
        className
      )}
    >
      {children}
    </div>
  );
};
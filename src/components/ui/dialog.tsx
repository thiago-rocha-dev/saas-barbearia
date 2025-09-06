import React from 'react';
import { cn } from '../../lib/utils';

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({ children, open }) => {
  return (
    <div className={cn('dialog', open && 'dialog-open')}>
      {children}
    </div>
  );
};

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children }) => {
  return <div className="dialog-trigger">{children}</div>;
};

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div className={cn('dialog-content bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto', className)}>
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('dialog-header mb-4', className)}>
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return (
    <h2 className={cn('dialog-title text-lg font-semibold', className)}>
      {children}
    </h2>
  );
};

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className }) => {
  return (
    <p className={cn('dialog-description text-sm text-gray-600', className)}>
      {children}
    </p>
  );
};

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('dialog-footer flex justify-end space-x-2 mt-4', className)}>
      {children}
    </div>
  );
};
import React from 'react';

interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
}

interface AlertDialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ children, open }) => {
  return (
    <div className={cn('alert-dialog', open ? 'alert-dialog-open' : undefined)}>
      {children}
    </div>
  );
};

export const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({ children }) => {
  return (
    <div className="alert-dialog-trigger">
      {children}
    </div>
  );
};

export const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ children, className }) => {
  return (
    <div className={cn('alert-dialog-content', className)}>
      {children}
    </div>
  );
};

export const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('alert-dialog-header', className)}>
      {children}
    </div>
  );
};

export const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ children, className }) => {
  return (
    <h2 className={cn('alert-dialog-title', className)}>
      {children}
    </h2>
  );
};

export const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ children, className }) => {
  return (
    <p className={cn('alert-dialog-description', className)}>
      {children}
    </p>
  );
};

export const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('alert-dialog-footer', className)}>
      {children}
    </div>
  );
};

export const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ children, onClick, className, disabled }) => {
  return (
    <button className={cn('alert-dialog-action', className)} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ children, onClick, className }) => {
  return (
    <button className={cn('alert-dialog-cancel', className)} onClick={onClick}>
      {children}
    </button>
  );
};
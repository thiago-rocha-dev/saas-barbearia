export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}
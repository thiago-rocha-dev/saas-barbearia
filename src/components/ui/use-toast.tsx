import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: []
};

let toastState = initialState;
let listeners: Array<(state: ToastState) => void> = [];

function dispatch(action: { type: string; toast?: Toast; toastId?: string }) {
  switch (action.type) {
    case 'ADD_TOAST':
      if (action.toast) {
        toastState = {
          ...toastState,
          toasts: [...toastState.toasts, action.toast]
        };
      }
      break;
    case 'REMOVE_TOAST':
      toastState = {
        ...toastState,
        toasts: toastState.toasts.filter(t => t.id !== action.toastId)
      };
      break;
    case 'DISMISS_TOAST':
      toastState = {
        ...toastState,
        toasts: toastState.toasts.filter(t => t.id !== action.toastId)
      };
      break;
  }
  
  listeners.forEach(listener => listener(toastState));
}

function genId() {
  return Math.random().toString(36).substr(2, 9);
}

export function useToast() {
  const [state] = useState(toastState);

  // const subscribe = useCallback((listener: (state: ToastState) => void) => {
  //   listeners.push(listener);
  //   return () => {
  //     listeners = listeners.filter(l => l !== listener);
  //   };
  // }, []);
  
  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = genId();
    const newToast: Toast = {
      ...props,
      id,
      duration: props.duration || 5000
    };
    
    dispatch({ type: 'ADD_TOAST', toast: newToast });
    
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', toastId: id });
      }, newToast.duration);
    }
    
    return {
      id,
      dismiss: () => dispatch({ type: 'DISMISS_TOAST', toastId: id })
    };
  }, []);
  
  return {
    toast,
    toasts: state.toasts,
    dismiss: (toastId: string) => dispatch({ type: 'DISMISS_TOAST', toastId })
  };
}
// utils/ToastUtils.ts
import { toast } from 'sonner';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  description?: string;
}

export const showToast = ({ type, title, description }: ToastProps) => {
  // Common styles or configuration can go here
  const options = {
    description: description,
  };

  switch (type) {
    case 'success':
      toast.success(title, options);
      break;
    case 'warning':
      toast.warning(title, options);
      break;
    case 'error':
      toast.error(title, options);
      break;
    case 'info':
      toast.info(title, options);
      break;
    default:
      toast(title, options);
      break;
  }
};

/**
 * Map HTTP status codes to user-friendly error toast titles.
 * Shared across mutation hooks to replace nested ternary chains.
 */
export const getErrorTitle = (status?: number): string => {
  if (status === 400) return 'Invalid Action';
  if (status === 404) return 'Not Found';
  if (status === 409) return 'Conflict';
  if (status === 422) return 'Validation Error';
  if (status === 429) return 'Too Many Requests';
  return 'Error';
};
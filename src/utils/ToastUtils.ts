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
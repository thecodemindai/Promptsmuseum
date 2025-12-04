import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-2xl shadow-black/10 dark:shadow-white/10 border border-zinc-800 dark:border-zinc-200">
        <div className="w-5 h-5 rounded-full bg-white dark:bg-black flex items-center justify-center text-black dark:text-white">
          <Check size={12} strokeWidth={3} />
        </div>
        <span className="text-sm font-bold tracking-wide">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
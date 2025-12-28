import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full m-4'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-xl ${sizeStyles[size]} w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-sm">
      <div className={`surface-card w-full overflow-hidden rounded-[28px] ${maxWidth}`}>
        <div className="flex items-center justify-between border-b border-blue-100 px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Confirm Action
            </div>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-slate-600">{children}</div>
      </div>
    </div>
  );
};

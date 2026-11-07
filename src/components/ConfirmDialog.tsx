import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  children,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-goat-navy-deep/80 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-goat-navy-light border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/40"
          >
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 text-goat-mist-dim hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            {description && <p className="text-goat-mist text-sm mb-4">{description}</p>}
            {children}

            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  destructive
                    ? 'bg-goat-red hover:bg-goat-red-light text-white'
                    : 'bg-goat-red hover:bg-goat-red-light text-white'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

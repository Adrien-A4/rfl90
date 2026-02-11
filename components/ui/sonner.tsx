"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "warning";
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const icons = {
  default: Info,
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: AlertCircle,
};

const colors = {
  default: "bg-neutral-800 border-neutral-700",
  success: "bg-green-900/90 border-green-700",
  destructive: "bg-red-900/90 border-red-700",
  warning: "bg-yellow-900/90 border-yellow-700",
};

const iconColors = {
  default: "text-neutral-400",
  success: "text-green-400",
  destructive: "text-red-400",
  warning: "text-yellow-400",
};

export function SonnerToast({
  title,
  description,
  variant = "default",
  open,
  onOpenChange,
}: ToastProps) {
  const Icon = icons[variant];
  const colorClass = colors[variant];
  const iconColorClass = iconColors[variant];

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`fixed bottom-4 right-4 z-50 flex items-start gap-3 p-4 rounded-xl border shadow-2xl max-w-sm ${colorClass}`}
        >
          <Icon className={`w-5 h-5 mt-0.5 ${iconColorClass}`} />
          <div className="flex-1">
            {title && <div className="font-medium text-white">{title}</div>}
            {description && (
              <div className="text-sm text-white/70 mt-0.5">{description}</div>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3, ease: "linear" }}
              className="h-full bg-white/30"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type ToastContextType = {
  toast: (props: Omit<ToastProps, "open" | "onOpenChange">) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [props, setProps] = React.useState<
    Omit<ToastProps, "open" | "onOpenChange">
  >({});

  const toast = React.useCallback(
    (newProps: Omit<ToastProps, "open" | "onOpenChange">) => {
      setProps(newProps);
      setOpen(true);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <SonnerToast {...props} open={open} onOpenChange={setOpen} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

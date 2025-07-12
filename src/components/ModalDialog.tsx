import { X } from "lucide-react";
import { ReactNode, ReactElement } from "react";

type ModalDialogProps = {
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactElement<{ handleClose: (result?: any) => void }>;
  onClose: () => void;
  showCloseButton?: boolean;
};

export function ModalDialog({
  title,
  size = "md",
  children,
  onClose,
  showCloseButton = true,
}: ModalDialogProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 bg-red-600/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-white/30 backdrop-blur-lg p-6 rounded-2xl ${sizeClasses[size]} w-full space-y-6 border border-red-200 shadow-lg`}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="hover:opacity-70 text-white"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

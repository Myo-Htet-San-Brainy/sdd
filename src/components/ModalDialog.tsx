// components/ui/modal-dialog.tsx
import { ModalProps } from "@/context/modalContext";
import { X } from "lucide-react";

export function ModalDialog({
  title,
  message,
  variant = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
  formComponent,
  size = "md",
  onClose,
  onConfirm,
}: ModalProps & {
  onClose: (result?: any) => void;
  onConfirm: () => void;
}) {
  const variantClasses = {
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
  };

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]}`}
      >
        <div
          className={`p-4 rounded-t-lg flex justify-between items-center ${variantClasses[variant]}`}
        >
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={() => onClose()} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {formComponent ? (
            formComponent
          ) : (
            <p className="text-gray-700 mb-4">{message}</p>
          )}
        </div>

        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          {cancelText && (
            <button
              onClick={() => onClose(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : variant === "warning"
                ? "bg-yellow-600 hover:bg-yellow-700"
                : variant === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

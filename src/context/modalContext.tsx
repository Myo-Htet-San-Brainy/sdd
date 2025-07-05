"use client";
import { ModalDialog } from "@/components/ModalDialog";
import { createContext, useContext, useState } from "react";

export type ModalProps = {
  title: string;
  message: string;
  variant?: "danger" | "warning" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
  // Additional props for different modal types
  formComponent?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

type ModalContextType = {
  showModal: (props: ModalProps) => Promise<boolean>;
  showConfirmation: (
    props: Omit<ModalProps, "formComponent">
  ) => Promise<boolean>;
  showFormModal: (props: ModalProps) => Promise<any>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalProps | null>(null);
  const [resolvePromise, setResolvePromise] = useState<(value: any) => void>(
    () => {}
  );

  const handleClose = (result: any = false) => {
    setModal(null);
    resolvePromise(result);
  };

  const showModal = (props: ModalProps): Promise<boolean> => {
    setModal(props);
    return new Promise((resolve) => {
      setResolvePromise(() => (value: boolean) => resolve(value));
    });
  };

  const showConfirmation = (
    props: Omit<ModalProps, "formComponent">
  ): Promise<boolean> => {
    return showModal({ ...props, cancelText: props.cancelText || "Cancel" });
  };

  const showFormModal = (props: ModalProps): Promise<any> => {
    setModal(props);
    return new Promise((resolve) => {
      setResolvePromise(() => (value: any) => resolve(value));
    });
  };

  return (
    <ModalContext.Provider
      value={{ showModal, showConfirmation, showFormModal }}
    >
      {children}
      {modal && (
        <ModalDialog
          {...modal}
          onClose={handleClose}
          onConfirm={() => handleClose(true)}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

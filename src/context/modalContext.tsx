"use client";
import { ModalDialog } from "@/components/ModalDialog";
import React, { createContext, useContext, useState } from "react";

type ModalProps = {
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  // content: React.ComponentType<{ handleClose: (result?: any) => void }>;
  // or if using JSX element:
  content: React.ReactElement<{ handleClose: (result?: any) => void }>;
};
type ModalContextType = {
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

  const showFormModal = (props: ModalProps): Promise<any> => {
    setModal(props);
    return new Promise((resolve) => {
      setResolvePromise(() => (value: any) => resolve(value));
    });
  };

  return (
    <ModalContext.Provider value={{ showFormModal }}>
      {children}
      {modal && (
        <ModalDialog
          title={modal.title}
          size={modal.size}
          showCloseButton={modal.showCloseButton}
          onClose={() => handleClose()}
        >
          {/* Render the component with handleClose */}
          {/* <modal.content handleClose={handleClose} /> */}
          {/* Alternative if using JSX element: */}
          {React.cloneElement(modal.content, { handleClose })}
        </ModalDialog>
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

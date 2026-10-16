"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ImageLightboxProps {
  imageUrl: string | null;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({
  imageUrl,
  alt,
  onClose,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Full image preview"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close full image preview"
        className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={imageUrl}
        alt={alt}
        className="max-h-[calc(100vh-2rem)] max-w-full object-contain"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

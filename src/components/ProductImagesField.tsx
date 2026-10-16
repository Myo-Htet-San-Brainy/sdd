"use client";

import { Camera, ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";

export type ProductImageItem = {
  id: string;
  previewUrl: string;
  file?: File;
};

interface ProductImagesFieldProps {
  label: string;
  cameraLabel: string;
  galleryLabel: string;
  images: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
}

export function ProductImagesField({
  label,
  cameraLabel,
  galleryLabel,
  images,
  onChange,
}: ProductImagesFieldProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onChange([
      ...images,
      {
        id: crypto.randomUUID(),
        previewUrl,
        file,
      },
    ]);
  };

  const handleRemove = (image: ProductImageItem) => {
    if (image.file) {
      URL.revokeObjectURL(image.previewUrl);
    }
    onChange(images.filter((item) => item.id !== image.id));
  };

  return (
    <div>
      <label className="block font-medium text-zinc-700 mb-1">{label}:</label>
      <div className="flex flex-wrap items-start gap-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative h-24 w-24 overflow-hidden rounded-md border border-zinc-300 bg-zinc-100"
          >
            <button
              type="button"
              onClick={() => setFullImageUrl(image.previewUrl)}
              aria-label="View image full size"
              className="block h-full w-full cursor-zoom-in"
            >
              <img
                src={image.previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
            <button
              type="button"
              onClick={() => handleRemove(image)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        <div className="flex h-24 w-24 flex-col gap-1">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex min-h-0 flex-1 items-center justify-center gap-1 rounded-md border border-dashed border-zinc-400 bg-zinc-50 px-1 text-zinc-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
          >
            <Camera className="h-5 w-5 shrink-0" />
            <span className="text-xs leading-tight">{cameraLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex min-h-0 flex-1 items-center justify-center gap-1 rounded-md border border-dashed border-zinc-400 bg-zinc-50 px-1 text-zinc-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
          >
            <ImagePlus className="h-5 w-5 shrink-0" />
            <span className="text-xs leading-tight">{galleryLabel}</span>
          </button>
        </div>
      </div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <ImageLightbox
        imageUrl={fullImageUrl}
        alt="Product image full size"
        onClose={() => setFullImageUrl(null)}
      />
    </div>
  );
}

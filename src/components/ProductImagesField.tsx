"use client";

import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";

export type ProductImageItem = {
  id: string;
  previewUrl: string;
  file?: File;
};

interface ProductImagesFieldProps {
  label: string;
  addLabel: string;
  images: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
}

export function ProductImagesField({
  label,
  addLabel,
  images,
  onChange,
}: ProductImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  const handleAddClick = () => {
    inputRef.current?.click();
  };

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

        <button
          type="button"
          onClick={handleAddClick}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-zinc-400 bg-zinc-50 text-zinc-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
        >
          <Camera className="h-6 w-6" />
          <span className="px-1 text-center text-xs leading-tight">
            {addLabel}
          </span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
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

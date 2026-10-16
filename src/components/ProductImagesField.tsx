"use client";

import { Camera, ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";

const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;

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
  const [isCompressing, setIsCompressing] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    const sourceUrl = URL.createObjectURL(file);

    try {
      const image = new Image();
      image.src = sourceUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Unable to read image."));
      });

      const scale = Math.min(
        1,
        MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d")?.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
      );

      if (!blob || blob.size >= file.size) {
        return file;
      }

      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
        type: "image/webp",
        lastModified: file.lastModified,
      });
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setIsCompressing(true);

    try {
      const uploadFile = await compressImage(file);
      onChange([
        ...images,
        {
          id: crypto.randomUUID(),
          previewUrl,
          file: uploadFile,
        },
      ]);
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      console.error("Image compression failed:", error);
    } finally {
      setIsCompressing(false);
    }
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
            disabled={isCompressing}
            className="flex min-h-0 flex-1 items-center justify-center gap-1 rounded-md border border-dashed border-zinc-400 bg-zinc-50 px-1 text-zinc-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-wait disabled:opacity-50"
          >
            <Camera className="h-5 w-5 shrink-0" />
            <span className="text-xs leading-tight">{cameraLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={isCompressing}
            className="flex min-h-0 flex-1 items-center justify-center gap-1 rounded-md border border-dashed border-zinc-400 bg-zinc-50 px-1 text-zinc-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-wait disabled:opacity-50"
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

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { verifyAnyPermission } from "@/lib/serverUtils";
import {
  PRODUCT_IMAGES_BUCKET,
  supabaseAdmin,
} from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  try {
    const permissionCheck = await verifyAnyPermission([
      MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_CREATE.name,
      MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_UPDATE.name,
    ]);

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status },
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files");

    if (
      files.length === 0 ||
      files.length > MAX_FILES ||
      files.some((value) => !(value instanceof File))
    ) {
      return NextResponse.json(
        { error: `Please upload between 1 and ${MAX_FILES} images.` },
        { status: 400 },
      );
    }

    const imageFiles = files as File[];
    for (const file of imageFiles) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, and WebP images are supported." },
          { status: 400 },
        );
      }

      if (file.size === 0 || file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Each image must be smaller than 5 MB." },
          { status: 400 },
        );
      }
    }

    const uploadedPaths: string[] = [];
    const imageUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const extension = file.type.split("/")[1];
        const path = `products/${randomUUID()}.${extension}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(path, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Supabase upload failed: ${uploadError.message}`);
        }

        uploadedPaths.push(path);
        const { data } = supabaseAdmin.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabaseAdmin.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .remove(uploadedPaths);
      }
      throw error;
    }

    return NextResponse.json({ imageUrls }, { status: 201 });
  } catch (error) {
    console.error("Upload product images error:", error);
    return NextResponse.json(
      { error: "Failed to upload product images." },
      { status: 500 },
    );
  }
}

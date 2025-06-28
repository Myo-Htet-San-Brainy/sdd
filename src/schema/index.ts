import { z } from "zod";

export const productSchema = z.object({
  type: z
    .array(
      z.object({
        value: z.string().min(1, "Each type must have at least 1 character"),
      })
    )
    .min(1, "At least one type is required"),
  brand: z.string(),
  source: z.string().min(1, "Source is required"),
  location: z.string().min(1, "Location is required"),
  noOfItemsInStock: z.number().int().min(0),
  buyingPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  description: z.string(),
  lowStockThreshold: z.number().int().min(0),
});

// 🧠 Schema
export const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
  role: z.string().min(1, "Role is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  isActive: z
    .string()
    .min(1, "Active status is required")
    .transform((val) => val === "true"),
  commissionRate: z
    .number()
    .min(0)
    .transform((val) => (val === 0 ? null : val)),
});

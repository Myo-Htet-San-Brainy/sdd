import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuthOptions";
import { getRoleByName } from "@/db/role";
import { hasPermission } from "@/lib/utils";
import { getCollection } from "./mongodb";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Complementary function to verify passwords
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function verifyPermission(requiredPermission: string): Promise<
  | { ok: true; session: Awaited<ReturnType<typeof getServerSession>> }
  | {
      ok: false;
      status: number;
      message: string;
      session?: Awaited<ReturnType<typeof getServerSession>>;
    }
> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const userRole = session.user.role;
  const role = await getRoleByName(userRole);

  if (!hasPermission(role?.permissions, requiredPermission)) {
    return { ok: false, status: 403, message: "Forbidden", session };
  }

  return { ok: true, session };
}

export async function verifyAnyPermission(
  requiredPermissions: string[]
): Promise<
  | { ok: true; session: Awaited<ReturnType<typeof getServerSession>> }
  | { ok: false; status: number; message: string }
> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const userRole = session.user.role;
  const role = await getRoleByName(userRole);

  // Check if at least one required permission exists in role's permissions
  const hasRequiredPermission = requiredPermissions.some((permission) =>
    hasPermission(role?.permissions, permission)
  );

  if (!hasRequiredPermission) {
    return { ok: false, status: 403, message: "Forbidden" };
  }

  return { ok: true, session };
}

// 1. Authentication Check
// This function checks if a user is authenticated (has an active session).
export async function authenticateSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  return { ok: true, session };
}

// 2. Authorization Check (Permission Check)
// This function checks if the authenticated user has at least one of the required permissions.
// It now returns the matched permission if found.
export async function verifyPermissions(
  session: any, // Requires a valid session object
  requiredPermissions: string[]
): Promise<
  | { ok: true; matchedPermission: string; userRole: string }
  | { ok: false; status: number; message: string }
> {
  // Ensure a session is provided. This function assumes authentication has already passed.
  if (!session || !session.user || !session.user.role) {
    // This case should ideally be caught by authenticateSession,
    // but it's a good safeguard for type safety.
    return {
      ok: false,
      status: 500,
      message: "Invalid session provided for permission check.",
    };
  }

  const userRole = session.user.role;
  const role = await getRoleByName(userRole);

  if (!role) {
    // Role not found, likely an invalid role assigned to the user
    return {
      ok: false,
      status: 403,
      message: "Forbidden: User role not found.",
    };
  }

  let matchedPermission: string | undefined;

  // Check if at least one required permission exists in role's permissions
  const hasRequiredPermission = requiredPermissions.some((permission) => {
    if (hasPermission(role.permissions, permission)) {
      matchedPermission = permission; // Store the matched permission
      return true;
    }
    return false;
  });

  if (!hasRequiredPermission || !matchedPermission) {
    // Should always have a matchedPermission if hasRequiredPermission is true
    return {
      ok: false,
      status: 403,
      message: "Forbidden: Insufficient permissions.",
    };
  }

  return { ok: true, matchedPermission, userRole };
}

export interface DuplicateDeletionResult {
  totalDeleted: number;
  duplicateGroupsFound: number;
  deletedGroups: Array<{
    type: string[];
    brand: string;
    description: string;
    count: number;
    deleted: number;
  }>;
}

export async function deleteDuplicateProducts(): Promise<DuplicateDeletionResult> {
  try {
    const productCollection = await getCollection("product");

    // Find all products and group them by type, brand, and description
    const allProducts = await productCollection.find({}).toArray();

    // Group products by their type, brand, and description combination
    const groupedProducts = new Map();

    allProducts.forEach((product: any) => {
      const key = JSON.stringify({
        type: product.type,
        brand: product.brand,
        description: product.description,
      });

      if (!groupedProducts.has(key)) {
        groupedProducts.set(key, []);
      }
      groupedProducts.get(key).push(product);
    });

    // Find groups with more than one product (duplicates)
    const duplicateGroups = Array.from(groupedProducts.values()).filter(
      (group: any[]) => group.length > 1
    );

    let totalDeleted = 0;
    const deletedGroups = [];

    // For each duplicate group, keep the first product and delete the rest
    for (const group of duplicateGroups) {
      const productsToDelete = group.slice(1); // Keep first, delete the rest
      const productIds = productsToDelete.map((p: any) => p._id);

      const deleteResult = await productCollection.deleteMany({
        _id: { $in: productIds },
      });

      totalDeleted += deleteResult.deletedCount;
      deletedGroups.push({
        type: group[0].type,
        brand: group[0].brand,
        description: group[0].description,
        count: group.length,
        deleted: deleteResult.deletedCount,
      });
    }

    return {
      totalDeleted,
      duplicateGroupsFound: duplicateGroups.length,
      deletedGroups,
    };
  } catch (error) {
    console.error("[DELETE_DUPLICATE_PRODUCTS_ERROR]", error);
    throw new Error("Failed to delete duplicate products");
  }
}

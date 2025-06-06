import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuthOptions";
import { getRoleByName } from "@/db/role";
import { hasPermission } from "@/lib/utils";

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

export async function verifyPermission(
  requiredPermission: string
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

  if (!hasPermission(role?.permissions, requiredPermission)) {
    return { ok: false, status: 403, message: "Forbidden" };
  }

  return { ok: true, session };
}

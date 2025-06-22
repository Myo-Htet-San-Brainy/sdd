import { NextRequest, NextResponse } from "next/server";
import { createRole, getAllRoles } from "@/db/role";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import {
  hashPassword,
  verifyAnyPermission,
  verifyPermission,
} from "@/lib/serverUtils";
import {
  createUser,
  getAllUsers,
  getUserById,
  getUsersByRole,
} from "@/db/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuthOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { ok: false, status: 401, message: "Unauthorized" };
    }
    const myId = (session.user as { id: string }).id;
    const me = await getUserById(myId);

    if (!me) {
      return NextResponse.json(
        { error: "Your Account is not found!" },
        { status: 404 }
      );
    }

    return NextResponse.json({ me }, { status: 200 });
  } catch (error) {
    console.error("Get my account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

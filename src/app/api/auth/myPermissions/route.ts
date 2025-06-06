import { getCollection } from "@/lib/mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/nextAuthOptions";
import { getRoleByName } from "@/db/role";

export async function GET(req: NextRequest) {
  try {
    // Check if logged in
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // throw new Error("test error");

    const userRole = session.user.role;

    const role = await getRoleByName(userRole);

    // Check if role exists
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Return permissions
    return NextResponse.json(
      { permissions: role.permissions || [] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

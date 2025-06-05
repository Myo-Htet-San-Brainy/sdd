import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuthOptions";
import { hasPermission } from "@/lib/utils"; // assume this is your util
import { createRole, getAllRoles, getRoleById, getRoleByName } from "@/db/role";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";

const REQUESTED_PERMISSION = "ROLE:READ";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // throw new Error("test error");
    // 1. Check session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check if user has permission to read roles
    const userRole = session.user.role;
    const role = await getRoleByName(userRole);
    if (
      !hasPermission(
        role?.permissions,
        MODULES_AND_PERMISSIONS.ROLE.PERMISSION_READ.name
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5. Return roles
    const id = params.id;
    const data = await getRoleById(id);
    if (!data) {
      // handle not found
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    return NextResponse.json({ role: data }, { status: 200 });
  } catch (error) {
    console.error("Get role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

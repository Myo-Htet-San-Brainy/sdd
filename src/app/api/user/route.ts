import { NextRequest, NextResponse } from "next/server";
import { createRole, getAllRoles } from "@/db/role";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { verifyPermission } from "@/lib/serverUtils";
import { getAllUsers } from "@/db/user";

export async function GET(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.USER.PERMISSION_READ.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const users = await getAllUsers();
    return NextResponse.json({ users: users || [] }, { status: 200 });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

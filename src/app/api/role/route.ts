import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuthOptions";
import { hasPermission } from "@/lib/utils"; // assume this is your util
import { createRole, getAllRoles, getRoleByName } from "@/db/role";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";

const REQUESTED_PERMISSION = "ROLE:READ";

export async function GET(req: NextRequest) {
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
    if (!hasPermission(role?.permissions, REQUESTED_PERMISSION)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5. Return roles
    const roles = await getAllRoles();
    return NextResponse.json({ roles: roles || [] }, { status: 200 });
  } catch (error) {
    console.error("Get roles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // throw new Error("test error");

    // 1. Check session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check if user has permission to create roles
    const userRole = session.user.role;
    const role = await getRoleByName(userRole);
    if (
      !hasPermission(
        role?.permissions,
        MODULES_AND_PERMISSIONS.ROLE.PERMISSION_CREATE.name
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Get data from request body
    const { roleName, allowedPermissions } = await req.json();

    // 5. Create new role in the 'role' collection
    const result = await createRole({
      name: roleName,
      permissions: allowedPermissions,
    });
    // 6. Check if insert was successful
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create role" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "creating role successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

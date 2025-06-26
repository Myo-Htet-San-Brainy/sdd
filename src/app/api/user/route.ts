import { NextRequest, NextResponse } from "next/server";
import { createRole, getAllRoles } from "@/db/role";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import {
  authenticateSession,
  hashPassword,
  verifyAnyPermission,
  verifyPermission,
  verifyPermissions,
} from "@/lib/serverUtils";
import { createUser, getAllUsers, getUsersByRole } from "@/db/user";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate Session
    const authResult = await authenticateSession();
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      );
    }
    const { session } = authResult; // Now session is guaranteed to be valid

    // 2. Check Permissions
    const requiredPermissions = [
      MODULES_AND_PERMISSIONS.USER.PERMISSION_READ.name, // Full read permission
      MODULES_AND_PERMISSIONS.USER.PERMISSION_READ_ONLY_NAMES.name, // Basic read permission
      // Add ADMIN:FULL_ACCESS here if you want it to also grant full access
      // MODULES_AND_PERMISSIONS.USER.ADMIN_ACCESS.name,
    ];

    const permissionCheck = await verifyPermissions(
      session,
      requiredPermissions
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const { matchedPermission } = permissionCheck; // Get the specific permission that allowed access

    // 3. Determine if only names should be returned based on matchedPermission
    let isOnlyNames = false;
    if (matchedPermission === "USER:READ_ONLY_NAMES") {
      isOnlyNames = true;
    }
    // If you have an ADMIN:FULL_ACCESS permission, you might explicitly set isOnlyNames = false if matchedPermission is ADMIN:FULL_ACCESS

    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get("role"); // Still allow filtering by role

    let users;
    if (role) {
      // Pass the isOnlyNames flag to the database function
      users = await getUsersByRole(role, isOnlyNames);
    } else {
      // Pass the isOnlyNames flag to the database function
      users = await getAllUsers(isOnlyNames);
    }

    return NextResponse.json({ users: users || [] }, { status: 200 });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const body = await req.json();
    let { password } = body;
    password = await hashPassword(password);
    const userPayload = {
      ...body,
      password,
    };

    const result = await createUser(userPayload);

    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Creating user successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

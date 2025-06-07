import { NextRequest, NextResponse } from "next/server";
import { createRole, getAllRoles } from "@/db/role";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hashPassword, verifyPermission } from "@/lib/serverUtils";
import { createUser, getAllUsers } from "@/db/user";

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

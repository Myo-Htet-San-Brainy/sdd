import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuthOptions";
import { hasPermission } from "@/lib/utils"; // assume this is your util
import {
  createRole,
  deleteRoleById,
  getAllRoles,
  getRoleById,
  getRoleByName,
  updateRole,
} from "@/db/role";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hashPassword, verifyPermission } from "@/lib/serverUtils";
import { deleteUserById, getUserById, updateUser } from "@/db/user";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.ROLE.PERMISSION_READ.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    // 5. Return roles
    const { id } = await params;
    const data = await getUserById(id);
    if (!data) {
      // handle not found
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user: data }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.USER.PERMISSION_UPDATE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }
    const { id } = await params;
    const user = await getUserById(id);
    if (!user) {
      // handle not found
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const body = await req.json();
    let { password } = body;
    if (password !== user.password) {
      password = await hashPassword(password);
    }

    const userPayload = {
      ...body,
      password,
    };
    const result = await updateUser(id, userPayload);
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "updating user successful!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.ROLE.PERMISSION_DELETE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const { id } = await params;
    if (!(await getUserById(id))) {
      // handle not found
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const result = await deleteUserById(id);
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "deleting user successful!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

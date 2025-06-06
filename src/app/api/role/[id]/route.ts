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
import { verifyPermission } from "@/lib/serverUtils";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.ROLE.PERMISSION_UPDATE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }
    const { id } = await params;
    if (!(await getRoleById(id))) {
      // handle not found
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    const { name, permissions } = await req.json();
    const result = await updateRole(id, { name, permissions });
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "updating role successful!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("update role error:", error);
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
    if (!(await getRoleById(id))) {
      // handle not found
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    const result = await deleteRoleById(id);
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "deleting role successful!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("delete role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

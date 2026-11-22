import { NextResponse } from "next/server";
import { getCommissionerOptions } from "@/db/user";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { verifyAnyPermission } from "@/lib/serverUtils";

export async function GET() {
  try {
    const permissionCheck = await verifyAnyPermission([
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_CREATE.name,
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_COMMISSION.name,
    ]);

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const users = await getCommissionerOptions();
    return NextResponse.json({ users: users || [] }, { status: 200 });
  } catch (error) {
    console.error("Get commissioners error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

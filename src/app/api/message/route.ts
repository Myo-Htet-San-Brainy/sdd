import { NextRequest, NextResponse } from "next/server";
import { getMessageById, updateMessageById } from "@/db/message";
import { verifyPermission } from "@/lib/serverUtils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";

const HARDCODED_MESSAGE_ID = "68564a89eb5d929e847b1f7f";
export async function GET() {
  try {
    const message = await getMessageById(HARDCODED_MESSAGE_ID);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.MESSAGE.PERMISSION_UPDATE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const body = await req.json();
    const result = await updateMessageById(HARDCODED_MESSAGE_ID, body);

    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to update message." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Message updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

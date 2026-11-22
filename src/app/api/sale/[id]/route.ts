import { NextRequest, NextResponse } from "next/server";
import {
  updateSale,
  getSaleByFilter,
  updateStockAfterTransaction,
  deleteSale,
  getSaleProductDetails,
} from "@/db/sale"; // your new DB functions
import {
  authenticateSession,
  verifyPermission,
  verifyPermissions,
} from "@/lib/serverUtils";
import { getUserById } from "@/db/user";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { ObjectId } from "mongodb";

function formatSaleBuyer(sale: any) {
  if (!sale?.buyer) {
    return { ...sale, buyer: null };
  }

  return {
    ...sale,
    buyer: {
      _id: sale.buyer._id?.toString(),
      username: sale.buyer.username,
      commissionRate: sale.buyer.commissionRate ?? null,
    },
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_UPDATE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const { id } = await params;

    // 🧠 Step 1: Ensure sale exists
    const existingSale = await getSaleByFilter({ _id: id });
    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // 🧠 Step 2: Get payload from body
    const salePayload = await req.json();

    // 🛠️ Step 3: Update the sale
    if (salePayload.soldProducts) {
      salePayload.soldProducts = await getSaleProductDetails(
        salePayload.soldProducts
      );
    }
    if (salePayload.buyer !== undefined) {
      if (salePayload.buyer === null) {
        salePayload.buyer = null;
      } else if (typeof salePayload.buyer === "string") {
        if (!ObjectId.isValid(salePayload.buyer)) {
          return NextResponse.json(
            { error: "Invalid buyer ID" },
            { status: 400 }
          );
        }
        const buyer = await getUserById(salePayload.buyer);
        if (!buyer) {
          return NextResponse.json(
            { error: "Buyer not found" },
            { status: 404 }
          );
        }
        salePayload.buyer = {
          _id: buyer._id.toString(),
          username: buyer.username,
          commissionRate: buyer.commissionRate ?? null,
        };
      } else {
        return NextResponse.json(
          { error: "Buyer must be null or a user ID" },
          { status: 400 }
        );
      }
    }
    const result = await updateSale(id, salePayload);
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to update sale" },
        { status: 500 }
      );
    }
    // Decrease stock only when sold products changed.
    if (salePayload.soldProducts) {
      await updateStockAfterTransaction(salePayload.soldProducts, {
        mode: "decrease",
      });
    }

    return NextResponse.json(
      { message: "Sale updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isOwn = req.nextUrl.searchParams.get("isOwn");

    // 🔐 Authenticate session
    const authResult = await authenticateSession();
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      );
    }

    const { session } = authResult;

    // 👤 If it's own sale
    if (isOwn) {
      const userId = session?.user.id;

      const sale = await getSaleByFilter({
        _id: id,
        "buyer._id": userId,
      });

      if (!sale) {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 });
      }

      return NextResponse.json(
        { sale: formatSaleBuyer(sale) },
        { status: 200 }
      );
    }

    // ✅ Permission check for admin/staff
    const requiredPermissions = [
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_READ.name,
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

    // 📦 Fetch sale by ID
    const sale = await getSaleByFilter({ _id: id });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json(
      { sale: formatSaleBuyer(sale) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get sale error:", error);
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
    // ✅ Permission check
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_DELETE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const { id } = await params;

    // 🧠 Ensure sale exists
    const existingSale = await getSaleByFilter({ _id: id });
    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // 🗑️ Delete the sale
    const result = await deleteSale(id);

    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to delete sale" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Sale deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

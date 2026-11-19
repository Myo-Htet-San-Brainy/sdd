import { NextRequest, NextResponse } from "next/server";
import { getUnitsSoldReport } from "@/db/report";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { verifyPermission } from "@/lib/serverUtils";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function parseDateBoundary(value: string, endOfDay = false) {
  if (!dateOnlyPattern.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(
    Date.UTC(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0)
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export async function GET(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_UNITS_SOLD.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const sortParam = searchParams.get("sort") || "most";

    if (!fromParam || !toParam || !["most", "least"].includes(sortParam)) {
      return NextResponse.json(
        { error: "from, to, and a valid sort are required" },
        { status: 400 }
      );
    }

    const from = parseDateBoundary(fromParam);
    const toInclusive = parseDateBoundary(toParam, true);

    if (!from || !toInclusive || from > toInclusive) {
      return NextResponse.json(
        { error: "from and to must be valid dates in ascending order" },
        { status: 400 }
      );
    }

    const to = new Date(toInclusive.getTime() + 1);
    const sort: "most" | "least" =
      sortParam === "least" ? "least" : "most";
    const report = await getUnitsSoldReport({
      from,
      to,
      sort,
    });

    return NextResponse.json({ products: report }, { status: 200 });
  } catch (error) {
    console.error("Units sold report fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

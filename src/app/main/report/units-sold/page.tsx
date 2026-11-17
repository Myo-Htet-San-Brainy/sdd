"use client";

import Link from "next/link";
import { useState } from "react";
import { useMyPermissionsContext } from "@/context";
import { UnitsSoldReport } from "@/Interfaces/Report";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetUnitsSoldReport } from "@/query/report";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekRange(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const daysSinceMonday = (day + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return { from: formatDate(start), to: formatDate(end) };
}

function getMonthRange(date: Date) {
  return {
    from: formatDate(new Date(date.getFullYear(), date.getMonth(), 1)),
    to: formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  };
}

const today = formatDate(new Date());

const Page = () => {
  const { myPermissions } = useMyPermissionsContext();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [sort, setSort] = useState<"most" | "least">("most");

  const canViewReport = hasPermission(
    myPermissions,
    MODULES_AND_PERMISSIONS.REPORT.PERMISSION_UNITS_SOLD.name,
  );
  const canViewProducts = hasPermission(
    myPermissions,
    MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_READ.name,
  );
  const {
    data: products,
    isPending,
    isFetching,
    isError,
  } = useGetUnitsSoldReport({ from, to, sort });

  if (!canViewReport) {
    return (
      <p className="mt-6 text-center text-red-700">
        You are not permitted to view{" "}
        {MODULES_AND_PERMISSIONS.REPORT.PERMISSION_UNITS_SOLD.displayName}.
      </p>
    );
  }

  const setRange = (range: { from: string; to: string }) => {
    setFrom(range.from);
    setTo(range.to);
  };

  return (
    <section className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8">
      <h1 className="text-2xl font-bold text-red-700">Units Sold</h1>

      <div className="mt-6 space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRange({ from: today, to: today })}
            className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setRange(getWeekRange(new Date()))}
            className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => setRange(getMonthRange(new Date()))}
            className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
          >
            This month
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium text-zinc-800">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 p-2 font-normal"
            />
          </label>
          <label className="text-sm font-medium text-zinc-800">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 p-2 font-normal"
            />
          </label>
          <label className="text-sm font-medium text-zinc-800">
            Sort by units sold
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "most" | "least")
              }
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white p-2 font-normal"
            >
              <option value="most">Most</option>
              <option value="least">Least</option>
            </select>
          </label>
        </div>
      </div>

      {isPending || isFetching ? (
        <p className="mt-6 animate-pulse text-center text-zinc-600">
          Loading units sold report...
        </p>
      ) : isError ? (
        <p className="mt-6 text-center text-red-700">
          Something went wrong while loading the report.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-center text-zinc-600">
          No products were sold during this period.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-100 text-zinc-700">
              <tr>
                <th className="px-2 py-3 text-left">Type</th>
                <th className="px-2 py-3 text-left">Brand</th>
                <th className="px-2 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Units sold</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  canViewProducts={canViewProducts}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const ProductRow = ({
  product,
  canViewProducts,
}: {
  product: UnitsSoldReport;
  canViewProducts: boolean;
}) => {
  return (
    <tr className="border-b border-zinc-100 last:border-b-0">
      <td className="px-2 py-3 text-zinc-600">
        {canViewProducts ? (
          <Link
            href={`/main/product/${product._id}`}
            className="block hover:text-red-700 hover:underline"
          >
            {product.type.join(", ")}
          </Link>
        ) : (
          product.type.join(", ")
        )}
      </td>
      <td className="px-2 py-3 text-zinc-600">{product.brand}</td>
      <td className="px-2 py-3 text-zinc-600">{product.description}</td>
      <td className="px-4 py-3 text-right font-semibold text-red-700">
        {product.unitsSold.toLocaleString()}
      </td>
    </tr>
  );
};

export default Page;

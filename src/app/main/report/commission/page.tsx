"use client";

import AllowedPermissions from "@/components/AllowedPermissions";
import { useMyPermissionsContext } from "@/context";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetCommissionReports } from "@/query/report";
import { useGetUsers } from "@/query/user";
import { useEffect, useState } from "react";

const years = [2025, 2026, 2027, 2028, 2029, 2030];
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const Page = () => {
  const { myPermissions } = useMyPermissionsContext();

  const {
    data: commissioners,
    isFetching: isFetchingCommissioners,
    isError: isErrorCommissioners,
    isPending: isPendingCommissioners,
  } = useGetUsers({ role: "commissioner" });

  const [commissionerId, setCommissionerId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    if (commissioners) {
      setCommissionerId(commissioners[0]._id);
    }
  }, [commissioners]);

  const {
    data: commissionRps,
    isFetching: isFetchingCommissionRps,
    isPending: isPendingCommissionRps,
    isError: isErrorCommissionRps,
  } = useGetCommissionReports({ commissionerId, date: date.toISOString() });

  if (
    !hasPermission(
      myPermissions,
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_COMMISSION.name
    )
  ) {
    return (
      <p className="mt-6 text-center text-red-700">
        You are not permitted to view{" "}
        {MODULES_AND_PERMISSIONS.REPORT.PERMISSION_COMMISSION.displayName}.
      </p>
    );
  }

  if (isFetchingCommissioners || isPendingCommissioners) {
    return (
      <p className="text-center text-zinc-600 animate-pulse mt-6">
        Loading your report...
      </p>
    );
  }

  if (isErrorCommissioners) {
    return (
      <p className="text-center text-red-700 mt-6">
        Something went wrong loading your report...
      </p>
    );
  }

  let reportContent;
  if (isFetchingCommissionRps || isPendingCommissionRps) {
    reportContent = (
      <p className="text-zinc-600 animate-pulse">Loading report...</p>
    );
  } else if (isErrorCommissionRps) {
    reportContent = (
      <p className="text-red-700">
        Something went wrong loading your report...
      </p>
    );
  } else {
    if (commissionRps.length <= 0) {
      reportContent = (
        <p className="text-zinc-500">No Reports Found for this selection.</p>
      );
    } else {
      reportContent = (
        <div>
          {/* Total Section */}
          <div className="mt-4 text-lg font-semibold text-zinc-800">
            Total Commission:{" "}
            <span className="text-red-700">
              {commissionRps
                .reduce((sum, rp) => sum + rp.commissionAmount, 0)
                .toLocaleString()}{" "}
              MMK
            </span>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {commissionRps.map((report, index) => (
              <div
                key={index}
                className="border border-zinc-200 bg-white p-4 rounded-xl shadow hover:shadow-md transition-all"
              >
                <p className="text-zinc-600">
                  <span className="font-medium text-zinc-800">Date:</span>{" "}
                  {new Date(report.date).toLocaleDateString()}
                </p>
                <p className="text-zinc-600">
                  <span className="font-medium text-zinc-800">Total Sale:</span>{" "}
                  {report.total.toLocaleString()} MMK
                </p>
                <p className="text-red-700 font-semibold text-lg">
                  +{report.commissionAmount.toLocaleString()} MMK
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8">
      <h1 className="text-2xl font-bold text-red-700">Commission Report</h1>

      {/* Form Section */}
      <div className="max-w-xl mt-6 space-y-4 bg-white border border-zinc-200 p-4 rounded-xl shadow-sm">
        <div>
          <label className="block mb-1 font-medium text-zinc-800">
            Select Commissioner
          </label>
          <select
            value={commissionerId}
            onChange={(e) => setCommissionerId(e.target.value)}
            className="w-full p-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            {commissioners.map((commissioner) => (
              <option
                key={commissioner._id}
                value={commissioner._id}
                className="text-zinc-800"
              >
                {commissioner.username}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium text-zinc-800">Year</label>
            <select
              value={date.getFullYear()}
              onChange={(e) => {
                const newDate = new Date(date);
                newDate.setFullYear(Number(e.target.value));
                setDate(newDate);
              }}
              className="w-full p-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              {years.map((year) => (
                <option key={year} value={year} className="text-zinc-800">
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block mb-1 font-medium text-zinc-800">
              Month
            </label>
            <select
              value={date.getMonth() + 1}
              onChange={(e) => {
                const newDate = new Date(date);
                newDate.setMonth(Number(e.target.value) - 1);
                setDate(newDate);
              }}
              className="w-full p-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              {months.map((month) => (
                <option key={month} value={month} className="text-zinc-800">
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6">{reportContent}</div>
    </section>
  );
};

export default Page;

"use client";

import AllowedPermissions from "@/components/AllowedPermissions";
import { useMyPermissionsContext } from "@/context";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetCommissionReports } from "@/query/report";
import { useGetUsers } from "@/query/user";
import { useEffect, useState } from "react";

const years = [2025, 2026, 2027, 2028, 2029, 2030];
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const Page = () => {
  const { myPermissions, isFetchingMyPermissions } = useMyPermissionsContext();

  const {
    data: commissioners,
    isFetching: isFetchingCommissioners,
    isError: isErrorCommissioners,
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
    isError: isErrorCommissionRps,
  } = useGetCommissionReports({ commissionerId, date: date.toISOString() });

  if (isFetchingMyPermissions) {
    return <div>checking permission...</div>;
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_COMMISSION.name
    )
  ) {
    return (
      <AllowedPermissions
        actionNotPermitted={
          MODULES_AND_PERMISSIONS.REPORT.PERMISSION_COMMISSION.displayName
        }
        myPermissions={myPermissions!}
      />
    );
  }
  if (isFetchingCommissioners) {
    return <p>loading your report...</p>;
  }

  if (isErrorCommissioners || !commissioners) {
    return <p>smth went wrong loading your report...</p>;
  }

  let reportContent;
  if (isFetchingCommissionRps) {
    reportContent = <p>loading your report...</p>;
  }

  if (isErrorCommissionRps) {
    reportContent = <p>smth went wrong loading your report...</p>;
  }

  if (commissionRps) {
    if (commissionRps.length <= 0) {
      reportContent = <p>No Reports Found!</p>;
    } else {
      reportContent = (
        <div>
          {/* Total Section */}
          <div className="mt-4 text-lg font-semibold">
            Total Commission:{" "}
            <span className="text-green-600">
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
                className="border p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(report.date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Total Sale:</span>{" "}
                  {report.total.toLocaleString()} MMK
                </p>
                <p className="text-green-600 font-semibold">
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
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Commission Report</h1>

      {/* Form Section */}
      <div className="max-w-xl space-y-4">
        <div>
          <label className="block mb-1 font-medium">Select Commissioner</label>
          <select
            value={commissionerId}
            onChange={(e) => setCommissionerId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {commissioners.map((commissioner) => (
              <option key={commissioner._id} value={commissioner._id}>
                {commissioner.username}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Year</label>
            <select
              value={date.getFullYear()}
              onChange={(e) => {
                const newDate = new Date(date);
                newDate.setFullYear(Number(e.target.value));
                setDate(newDate);
              }}
              className="w-full p-2 border rounded"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block mb-1 font-medium">Month</label>
            <select
              value={date.getMonth() + 1}
              onChange={(e) => {
                const newDate = new Date(date);
                newDate.setMonth(Number(e.target.value) - 1);
                setDate(newDate);
              }}
              className="w-full p-2 border rounded"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {reportContent}
    </div>
  );
};

export default Page;

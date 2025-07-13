"use client";

import { MyPermissionsContext } from "@/context";
import { navInfo } from "@/lib/constants";
import { useGetMyPermissions } from "@/query/miscellaneous";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();

  if (isFetchingMyPermissions) {
    return (
      <div className="w-full min-h-[calc(100vh-72px)] py-6 text-center bg-zinc-50">
        <p className="text-zinc-800 animate-pulse">Checking permissions...</p>
      </div>
    );
  }

  // Helper function to check if user has any of the required permissions
  const hasAnyRequiredPermission = (requiredPermissions: string[]) => {
    if (!myPermissions) return false;
    return requiredPermissions.some((permission) =>
      myPermissions.includes(permission)
    );
  };

  // Get report navigation items and filter by permissions
  const reportChildren = navInfo.REPORT.children;
  const allowedReportItems = Object.entries(reportChildren).filter(
    ([key, navItem]) => hasAnyRequiredPermission(navItem.requiredPermissions)
  );

  if (allowedReportItems.length === 0) {
    return (
      <p className="mt-6 text-center text-red-700">
        You are not allowed to view reports.
      </p>
    );
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8">
      {/* 🔥 Red Themed Tabs */}
      <nav className="mb-6 flex flex-wrap gap-4">
        {allowedReportItems.map(([key, navItem]) => (
          <a
            key={key}
            href={navItem.link}
            className="text-sm font-medium px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            {navItem.displayName}
          </a>
        ))}
      </nav>

      <MyPermissionsContext
        value={{ myPermissions: myPermissions!, isFetchingMyPermissions }}
      >
        {children}
      </MyPermissionsContext>
    </section>
  );
};

export default Layout;

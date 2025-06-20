"use client";

import { MyPermissionsContext } from "@/context";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
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

  const permissionEntries = Object.entries(
    MODULES_AND_PERMISSIONS.REPORT
  ).filter(
    ([key, value]) =>
      key.startsWith("PERMISSION_") &&
      typeof value === "object" &&
      "name" in value &&
      typeof value.name === "string"
  ) as [string, { name: string }][];

  const hasAnyPermission = permissionEntries.some(([_, perm]) =>
    hasPermission(myPermissions!, perm.name)
  );

  if (!hasAnyPermission) {
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
        {Object.values(MODULES_AND_PERMISSIONS.REPORT)
          .filter(
            (
              perm
            ): perm is { name: string; displayName: string; link: string } =>
              typeof perm === "object" &&
              "name" in perm &&
              "link" in perm &&
              "displayName" in perm
          )
          .map((perm) =>
            hasPermission(myPermissions!, perm.name) ? (
              <a
                key={perm.name}
                href={perm.link}
                className="text-sm font-medium px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
              >
                {perm.displayName}
              </a>
            ) : null
          )}
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

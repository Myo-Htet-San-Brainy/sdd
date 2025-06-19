"use client";

import { MyPermissionsContext, useMyPermissionsContext } from "@/context";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();

  if (isFetchingMyPermissions) {
    return <div>checking permission...</div>;
  }
  // Filter and safely type the permission keys
  const permissionEntries = Object.entries(
    MODULES_AND_PERMISSIONS.REPORT
  ).filter(
    ([key, value]) =>
      key.startsWith("PERMISSION_") &&
      typeof value === "object" &&
      "name" in value &&
      typeof value.name === "string"
  ) as [string, { name: string }][]; // 👈 Force TS to understand

  const hasAnyPermission = permissionEntries.some(([_, perm]) =>
    hasPermission(myPermissions!, perm.name)
  );
  if (!hasAnyPermission) {
    return <p>You are not allowed to view reports.</p>;
  }
  return (
    <div>
      <nav className="mb-4 flex gap-4 border-b pb-2">
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
                className="text-sm px-3 py-1 rounded hover:bg-slate-100 transition-colors"
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
    </div>
  );
};

export default layout;

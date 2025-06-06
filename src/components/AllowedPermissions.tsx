import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface AllowedPermissionsProps {
  actionNotPermitted: string;
  myPermissions: string[];
}

const AllowedPermissions: React.FC<AllowedPermissionsProps> = ({
  actionNotPermitted,
  myPermissions,
}) => {
  return (
    <div>
      <p>you are not permitted to {actionNotPermitted}. do these instead...</p>
      {Object.values(MODULES_AND_PERMISSIONS).map((module) => {
        return (
          hasPermission(myPermissions!, module.PERMISSION_READ.name) && (
            <Link
              href={module.PERMISSION_READ.link}
              className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
            >
              {module.PERMISSION_READ.displayName}
            </Link>
          )
        );
      })}
    </div>
  );
};

export default AllowedPermissions;

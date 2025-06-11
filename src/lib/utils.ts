import { MODULES_AND_PERMISSIONS } from "./constants";

export function hasPermission(
  allowedPermissions: string[],
  requestedPermission: string
): boolean {
  return allowedPermissions.includes(requestedPermission);
}

export function hasAnyModulePermission(
  allowedPermissions: string[],
  moduleName: string
): boolean {
  return allowedPermissions.some((permission) =>
    permission.startsWith(`${moduleName}:`)
  );
}

export const getAllPermissions = () => {
  return Object.values(MODULES_AND_PERMISSIONS)
    .flatMap((module: any) =>
      Object.values(module).filter(
        (val: any) => typeof val === "object" && val.name
      )
    )
    .map((p: any) => ({ name: p.name, displayName: p.displayName }));
};

import { ObjectId } from "mongodb";

export function isItemInList<T extends { _id: ObjectId | string }>(
  item: T,
  list: T[]
): boolean {
  const itemId = item._id.toString();

  return list.some((listItem) => listItem._id.toString() === itemId);
}

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

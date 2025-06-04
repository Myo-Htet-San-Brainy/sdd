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

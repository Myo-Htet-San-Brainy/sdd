export const MODULES_AND_PERMISSIONS = {
  ROLE: {
    displayName: "Manage Roles",
    PERMISSION_READ: {
      name: "ROLE:READ",
      displayName: "View Roles",
      link: "/main/role",
    },
    PERMISSION_CREATE: {
      name: "ROLE:CREATE",
      displayName: "Create Roles",
      link: "/main/role/create",
    },
    PERMISSION_UPDATE: {
      name: "ROLE:UPDATE",
      displayName: "Update Role",
    },
    PERMISSION_DELETE: {
      name: "ROLE:DELETE",
      displayName: "Delete Role",
    },
  },
  USER: {
    displayName: "Manage Users",
    PERMISSION_READ: {
      name: "USER:READ",
      displayName: "View Users",
      link: "/main/user",
    },
    PERMISSION_CREATE: {
      name: "USER:CREATE",
      displayName: "Create Users",
      link: "/main/user/create",
    },
    PERMISSION_UPDATE: {
      name: "USER:UPDATE",
      displayName: "Update User",
    },
    PERMISSION_DELETE: {
      name: "USER:DELETE",
      displayName: "Delete User",
    },
  },
};

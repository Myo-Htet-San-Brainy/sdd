export const MODULES_AND_PERMISSIONS = [
  {
    name: "ROLE",
    displayName: "Role Management",
    displayPermission: {
      name: "ROLE:READ",
      displayName: "View Roles",
      link: "/main/role",
    },
    permissions: [
      {
        name: "ROLE:READ",
        displayName: "View Roles",
      },
      {
        name: "ROLE:CREATE",
        displayName: "Create Roles",
      },
      {
        name: "ROLE:UPDATE",
        displayName: "Update Roles",
      },
      {
        name: "ROLE:DELETE",
        displayName: "Delete Roles",
      },
    ],
  },
  {
    name: "USER",
    displayName: "User Management",
    displayPermission: {
      name: "USER:READ",
      displayName: "View Users",
      link: "/main/user",
    },
    permissions: [
      {
        name: "USER:READ",
        displayName: "View Users",
      },
      {
        name: "USER:CREATE",
        displayName: "Create Users",
      },
      {
        name: "USER:UPDATE",
        displayName: "Update Users",
      },
      {
        name: "USER:DELETE",
        displayName: "Delete Users",
      },
    ],
  },
];

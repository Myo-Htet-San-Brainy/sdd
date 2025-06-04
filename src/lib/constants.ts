export const PERMISSIONS = [
  {
    name: "ROLE",
    displayName: "Role Management",
    actions: [
      {
        name: "ROLE:READ",
        displayName: "View Roles",
        link: "/main/role",
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
    actions: [
      {
        name: "USER:READ",
        displayName: "View Users",
        link: "/main/user",
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

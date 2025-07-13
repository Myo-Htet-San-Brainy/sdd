export const MODULES_AND_PERMISSIONS = {
  ROLE: {
    PERMISSION_READ: {
      name: "ROLE:READ",
      displayName: "View Roles",
    },
    PERMISSION_CREATE: {
      name: "ROLE:CREATE",
      displayName: "Create Roles",
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
    PERMISSION_READ: {
      name: "USER:READ",
      displayName: "View Users",
    },
    PERMISSION_READ_ONLY_NAMES: {
      name: "USER:READ_ONLY_NAMES",
      displayName: "View Only User Names",
    },
    PERMISSION_CREATE: {
      name: "USER:CREATE",
      displayName: "Create Users",
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
  PRODUCT: {
    PERMISSION_READ: {
      name: "PRODUCT:READ",
      displayName: "View Products",
    },
    PERMISSION_CREATE: {
      name: "PRODUCT:CREATE",
      displayName: "Create Products",
    },
    PERMISSION_UPDATE: {
      name: "PRODUCT:UPDATE",
      displayName: "Update Product",
    },
    PERMISSION_DELETE: {
      name: "PRODUCT:DELETE",
      displayName: "Delete Product",
    },
  },
  SALE: {
    PERMISSION_READ: {
      name: "SALE:READ",
      displayName: "View Sales",
    },
    PERMISSION_CREATE: {
      name: "SALE:CREATE",
      displayName: "Create Sales",
    },
    PERMISSION_UPDATE: {
      name: "SALE:UPDATE",
      displayName: "Update Sale",
    },
    PERMISSION_DELETE: {
      name: "SALE:DELETE",
      displayName: "Delete Sale",
    },
  },
  REPORT: {
    PERMISSION_LOW_STOCK_ALERT: {
      name: "REPORT:LOW_STOCK_ALERT",
      displayName: "View Low Stock Alerts",
    },
    PERMISSION_COMMISSION: {
      name: "REPORT:COMMISSION",
      displayName: "View Monthly Commission Reports",
    },
  },
  MESSAGE: {
    PERMISSION_UPDATE: {
      name: "MESSAGE:UPDATE",
      displayName: "Update Message",
    },
    PERMISSION_READ: {
      name: "MESSAGE:READ",
      displayName: "View Message",
    },
  },
};

export const globalNavbarData = [
  {
    id: "role",
    displayName: "Manage Roles",
    link: "/main/role",
    requiredPermissions: [MODULES_AND_PERMISSIONS.ROLE.PERMISSION_READ.name],
  },
  {
    id: "user",
    displayName: "Manage Users",
    link: "/main/user",
    requiredPermissions: [MODULES_AND_PERMISSIONS.USER.PERMISSION_READ.name],
  },
  {
    id: "product",
    displayName: "Manage Products",
    link: "/main/product",
    requiredPermissions: [MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_READ.name],
  },
  {
    id: "sale",
    displayName: "Manage Sales",
    link: "/main/sale",
    requiredPermissions: [MODULES_AND_PERMISSIONS.SALE.PERMISSION_READ.name],
  },
  {
    id: "report",
    displayName: "Reports & Analytics",
    link: "/main/report",
    requiredPermissions: [
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_LOW_STOCK_ALERT.name,
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_COMMISSION.name,
    ],
  },
  {
    id: "message",
    displayName: "Messages",
    link: "/main/message",
    requiredPermissions: [MODULES_AND_PERMISSIONS.MESSAGE.PERMISSION_READ.name],
  },
];

export const reportNavbarData = [
  {
    id: "low-stock",
    displayName: "Low Stock Alerts",
    link: "/main/report/low-stock",
    requiredPermissions: [
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_LOW_STOCK_ALERT.name,
    ],
  },
  {
    id: "commission",
    displayName: "Monthly Commission Reports",
    link: "/main/report/commission",
    requiredPermissions: [
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_COMMISSION.name,
    ],
  },
];

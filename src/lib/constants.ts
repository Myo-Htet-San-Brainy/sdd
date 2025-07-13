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
    PERMISSION_READ_ONLY_NAMES: {
      name: "USER:READ_ONLY_NAMES",
      displayName: "View Only User Names",
      link: "",
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
  PRODUCT: {
    displayName: "Manage Products",
    PERMISSION_READ: {
      name: "PRODUCT:READ",
      displayName: "View Products",
      link: "/main/product",
    },
    PERMISSION_CREATE: {
      name: "PRODUCT:CREATE",
      displayName: "Create Products",
      link: "/main/product/create",
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
    displayName: "Manage Sales",
    PERMISSION_READ: {
      name: "SALE:READ",
      displayName: "View Sales",
      link: "/main/sale",
    },
    PERMISSION_CREATE: {
      name: "SALE:CREATE",
      displayName: "Create Sales",
      link: "/main/sale/create",
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
    displayName: "Reports & Analytics",
    link: "/main/report",
    PERMISSION_LOW_STOCK_ALERT: {
      name: "REPORT:LOW_STOCK_ALERT",
      displayName: "View Low Stock Alerts",
      link: "/main/report/low-stock",
    },
    PERMISSION_COMMISSION: {
      name: "REPORT:COMMISSION",
      displayName: "View Monthly Commission Reports",
      link: "/main/report/commission",
    },
  },
  MESSAGE: {
    displayName: "",
    PERMISSION_UPDATE: {
      name: "MESSAGE:UPDATE",
      displayName: "Update Message",
      link: "",
    },
    PERMISSION_READ: {
      name: "MESSAGE:READ",
      displayName: "View Message",
      link: "/main/message/",
    },
  },
};

export const navInfo = {
  ROLE: {
    displayName: "Manage Roles",
    link: "/main/role",
    requiredPermissions: ["ROLE:READ"],
    children: {},
  },
  USER: {
    displayName: "Manage Users",
    link: "/main/user",
    requiredPermissions: ["USER:READ"],
    children: {},
  },
  PRODUCT: {
    displayName: "Manage Products",
    link: "/main/product",
    requiredPermissions: ["PRODUCT:READ"],
    children: {},
  },
  SALE: {
    displayName: "Manage Sales",
    link: "/main/sale",
    requiredPermissions: ["SALE:READ"],
    children: {},
  },
  REPORT: {
    displayName: "Reports & Analytics",
    link: "/main/report",
    requiredPermissions: ["REPORT:LOW_STOCK_ALERT", "REPORT:COMMISSION"],
    children: {
      LOW_STOCK: {
        displayName: "Low Stock Alerts",
        link: "/main/report/low-stock",
        requiredPermissions: ["REPORT:LOW_STOCK_ALERT"],
        children: {},
      },
      COMMISSION: {
        displayName: "Monthly Commission Reports",
        link: "/main/report/commission",
        requiredPermissions: ["REPORT:COMMISSION"],
        children: {},
      },
    },
  },
  MESSAGE: {
    displayName: "Messages",
    link: "/main/message",
    requiredPermissions: ["MESSAGE:READ"],
    children: {},
  },
};

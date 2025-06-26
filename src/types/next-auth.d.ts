import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: string;
    name: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, and used by `getServerSession`
   * Augment the JWT interface to include your custom properties.
   */
  interface JWT {
    name: string;
    id: string; // Ensure id is in the JWT token
    role: string; // Ensure role is in the JWT token
    // ... other properties you want to store in the JWT
  }
}

import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const signInApiUrl = "";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const res = await axios.post(
            "https://when-we-free-gp4d.vercel.app/api/auth/signIn",
            {
              username: credentials?.username,
              password: credentials?.password,
            }
          );

          if (res.status === 200) {
            const { userId, userRole } = res.data;
            //userId, role, username
            return { id: userId, name: credentials?.username!, role: userRole };
          } else {
            throw new Error("Login failed, please try again later");
          }
        } catch (error: any) {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            if (status === 400) {
              throw new Error("MissingCredentials");
            } else if (status === 401) {
              throw new Error("InvalidCredentials");
            } else if (status === 500) {
              throw new Error("ServerError");
            } else {
              throw new Error("UnexpectedError");
            }
          } else {
            throw new Error("UnknownError");
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name;

      return session;
    },
  },
  pages: {
    error: "/auth/error", // 👈 tell NextAuth to use your custom error page
    signIn: "/auth/credentials-signin",
  },
};

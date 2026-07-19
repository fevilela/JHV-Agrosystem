import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as {
          role?: string;
          isSuperAdmin?: boolean;
          organizationId?: string | null;
        };
        token.role = u.role;
        token.isSuperAdmin = u.isSuperAdmin;
        token.organizationId = u.organizationId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const u = session.user as {
          id?: string;
          role?: string;
          isSuperAdmin?: boolean;
          organizationId?: string | null;
        };
        u.id = token.sub;
        u.role = token.role as string;
        u.isSuperAdmin = token.isSuperAdmin as boolean;
        u.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
});

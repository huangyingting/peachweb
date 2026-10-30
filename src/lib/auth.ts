import { PrismaAdapter } from "@auth/prisma-adapter";
import { randomBytes } from "node:crypto";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { authorizeWithCredentials } from "./account-admission/credentials";
import { prisma } from "./prisma";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days
const useSecureCookies = (process.env.NEXTAUTH_URL ?? "").startsWith("https://");
const sessionCookieName = useSecureCookies
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "database",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const user = await authorizeWithCredentials(prisma, {
            email: credentials.email,
            password: credentials.password,
          });
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            status: user.status,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) {
        return false;
      }
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
      });
      if (!dbUser || dbUser.status !== "ACTIVE") {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user && user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        session.user.id = user.id;
        session.user.role = dbUser?.role ?? "USER";
        session.user.status = dbUser?.status ?? "ACTIVE";
      }
      return session;
    },
  },
  // NextAuth v4 requires explicit database session creation when using CredentialsProvider with strategy: "database"
  events: {},
};

export async function createDatabaseSessionForUser(userId: string) {
  const sessionToken = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  return {
    cookieName: sessionCookieName,
    sessionToken,
    expires,
    secure: useSecureCookies,
  };
}

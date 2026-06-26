import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      id: "owner-credentials",
      name: "Owner Login",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;
        try {
          const { SHEETS_AVAILABLE } = await import("@/lib/sheets/mock-data");
          if (!SHEETS_AVAILABLE) {
            // Demo credentials when sheets not configured
            if (email === "admin@adityatextile.com" && password === "admin123") {
              return { id: "usr_owner_demo", email, name: "Aditya Owner", role: "owner" };
            }
            return null;
          }
          const { usersAdapter } = await import("@/lib/sheets");
          const user = await usersAdapter.getUserByEmail(email);
          if (!user || user.role !== "owner") return null;
          const isValid = await compare(password, user.passwordHash);
          if (!isValid) return null;
          await usersAdapter.updateLastLogin(user.id);
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch { return null; }
      },
    }),
    CredentialsProvider({
      id: "customer-otp",
      name: "Customer OTP",
      credentials: { phone: { label: "Phone", type: "tel" }, otp: { label: "OTP", type: "text" } },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;
        const phone = credentials.phone as string;
        const otp = credentials.otp as string;
        if (otp !== "123456") return null;
        try {
          const { SHEETS_AVAILABLE } = await import("@/lib/sheets/mock-data");
          if (!SHEETS_AVAILABLE) {
            return { id: `usr_demo_${phone.slice(-4)}`, email: undefined, name: `Customer ${phone.slice(-4)}`, role: "customer", phone };
          }
          const { usersAdapter } = await import("@/lib/sheets");
          let user = await usersAdapter.getUserByPhone(phone);
          if (!user) user = await usersAdapter.createUser({ role: "customer", email: "", phone, passwordHash: "", name: `Customer ${phone.slice(-4)}`, isActive: true });
          await usersAdapter.updateLastLogin(user.id);
          return { id: user.id, email: user.email || undefined, name: user.name, role: user.role, phone: user.phone };
        } catch { return null; }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.role = (user as { role: string }).role; token.phone = (user as { phone?: string }).phone; }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        (session.user as { role: string }).role = token.role as string;
        (session.user as { phone?: string }).phone = token.phone as string | undefined;
      }
      return session;
    },
  },
});

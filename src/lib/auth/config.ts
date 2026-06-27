import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { SHEETS_AVAILABLE } from "@/lib/sheets/mock-data";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      id: "staff-login",
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;
        try {
          if (!SHEETS_AVAILABLE) {
            if (email === "owner@adityatextile.com" && password === "owner123") {
              return { id: "staff_owner_demo", email, name: "Aditya (Owner)", role: "owner" };
            }
            if (email === "staff@adityatextile.com" && password === "staff123") {
              return { id: "staff_001_demo", email, name: "Ravi (Staff)", role: "staff" };
            }
            return null;
          }
          // TODO: query Staff sheet when SHEETS_AVAILABLE
          return null;
        } catch { return null; }
      },
    }),
    CredentialsProvider({
      id: "customer-otp",
      name: "Customer OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;
        if ((credentials.otp as string) !== "123456") return null;
        const phone = credentials.phone as string;
        try {
          if (!SHEETS_AVAILABLE) {
            return { id: `cust_demo_${phone.slice(-4)}`, name: `Customer ${phone.slice(-4)}`, role: "customer", phone };
          }
          // TODO: find or create customer in Sheets when SHEETS_AVAILABLE
          return null;
        } catch { return null; }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.phone = (user as { phone?: string }).phone;
      }
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

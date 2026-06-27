import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const SECRET = process.env.NEXTAUTH_SECRET ?? "aditya-textile-nextauth-secret-2024-fallback";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "staff-login",
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;
        if (email === "owner@adityatextile.com" && password === "owner123") {
          return { id: "owner_001", email, name: "Aditya (Owner)", role: "owner" };
        }
        if (email === "staff@adityatextile.com" && password === "staff123") {
          return { id: "staff_001", email, name: "Ravi (Staff)", role: "staff" };
        }
        return null;
      },
    }),
    Credentials({
      id: "customer-otp",
      name: "Customer OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        otp: { label: "OTP", type: "text" },
      },
      authorize(credentials) {
        const phone = credentials?.phone as string;
        const otp = credentials?.otp as string;
        if (!phone || !otp) return null;
        if (otp === "123456") {
          return { id: `cust_${phone.slice(-4)}`, name: `Customer ${phone.slice(-4)}`, role: "customer", phone };
        }
        return null;
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
        if (token.phone) {
          (session.user as { phone?: string }).phone = token.phone as string;
        }
      }
      return session;
    },
  },
});

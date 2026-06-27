import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Hardcoded fallback secret so auth works even without NEXTAUTH_SECRET env var
const SECRET = process.env.NEXTAUTH_SECRET ?? "aditya-textile-nextauth-secret-2024-fallback";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: SECRET,
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
        // Demo credentials — replace with DB lookup when going live
        if (email === "owner@adityatextile.com" && password === "owner123") {
          return { id: "owner_001", email, name: "Aditya (Owner)", role: "owner" };
        }
        if (email === "staff@adityatextile.com" && password === "staff123") {
          return { id: "staff_001", email, name: "Ravi (Staff)", role: "staff" };
        }
        return null;
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
        // Demo: any phone + OTP 123456 works
        if ((credentials.otp as string) === "123456") {
          const phone = credentials.phone as string;
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
        (session.user as { phone?: string }).phone = token.phone as string | undefined;
      }
      return session;
    },
  },
});

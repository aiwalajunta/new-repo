import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      id: "staff-login", name: "Staff Login",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;
        try {
          const { SHEETS_AVAILABLE } = await import("@/lib/sheets/mock-data");
          if (!SHEETS_AVAILABLE) {
            if (email === "owner@adityatextile.com" && password === "owner123") return { id: "staff_owner_demo", email, name: "Aditya (Owner)", role: "owner" };
            if (email === "staff@adityatextile.com" && password === "staff123") return { id: "staff_001_demo", email, name: "Ravi (Staff)", role: "staff" };
            return null;
          }
          // TODO: query Staff sheet
          return null;
        } catch { return null; }
      },
    }),
    CredentialsProvider({
      id: "customer-otp", name: "Customer OTP",
      credentials: { phone: { label: "Phone", type: "tel" }, otp: { label: "OTP", type: "text" } },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;
        if ((credentials.otp as string) !== "123456") return null;
        try {
          const phone = credentials.phone as string;
          const { SHEETS_AVAILABLE } = await import("@/lib/sheets/mock-data");
          if (!SHEETS_AVAILABLE) return { id: `cust_demo_${phone.slice(-4)}`, name: `Customer ${phone.slice(-4)}`, role: "customer", phone };
          const { customersAdapter } = await import("@/lib/sheets");
          let customer = await customersAdapter.getCustomerByPhone(phone);
          if (!customer) customer = await customersAdapter.createCustomer({ name: `Customer ${phone.slice(-4)}`, phone, email: "", address: "", notes: "", isActive: true });
          return { id: customer.id, name: customer.name, role: "customer", phone: customer.phone };
        } catch { return null; }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) { if (user) { token.role = (user as { role: string }).role; token.phone = (user as { phone?: string }).phone; } return token; },
    session({ session, token }) { if (session.user) { session.user.id = token.sub ?? ""; (session.user as { role: string }).role = token.role as string; (session.user as { phone?: string }).phone = token.phone as string | undefined; } return session; },
  },
});

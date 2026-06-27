"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Store, Users, Phone, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_CONFIG } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"staff" | "customer">("staff");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", phone: "", otp: "" });

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("staff-login", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password. Check demo credentials above.");
    } else {
      // Let the server session resolve, then root page.tsx handles redirect by role
      router.push("/");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("customer-otp", { phone: form.phone, otp: form.otp, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid OTP. Use 123456 for demo.");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-ivory px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-5">

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-wine text-2xl font-bold text-white shadow-lg">AT</div>
          <h1 className="font-display text-2xl font-bold text-brand-wine">{APP_CONFIG.name}</h1>
          <p className="text-sm text-gray-500">{APP_CONFIG.tagline}</p>
        </div>

        <div className="flex rounded-xl border border-gray-200 bg-white p-1">
          <button type="button" onClick={() => { setTab("staff"); setError(""); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${tab === "staff" ? "bg-brand-wine text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Store size={15} /> Staff / Owner
          </button>
          <button type="button" onClick={() => { setTab("customer"); setError(""); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${tab === "customer" ? "bg-brand-wine text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Users size={15} /> Customer
          </button>
        </div>

        {tab === "staff" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div>
              <p className="font-semibold text-gray-800">Staff / Owner Login</p>
              <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs space-y-1">
                <p className="font-semibold text-amber-800">Demo Credentials</p>
                <p className="text-amber-700">\ud83d\udc51 Owner: <code className="rounded bg-amber-100 px-1 font-mono">owner@adityatextile.com</code> / <code className="rounded bg-amber-100 px-1 font-mono">owner123</code></p>
                <p className="text-amber-700">\ud83d\udc77 Staff: <code className="rounded bg-amber-100 px-1 font-mono">staff@adityatextile.com</code> / <code className="rounded bg-amber-100 px-1 font-mono">staff123</code></p>
              </div>
            </div>
            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
            <form onSubmit={handleStaffLogin} className="space-y-3">
              <div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input type="email" placeholder="owner@adityatextile.com" className="pl-9" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input type={showPass ? "text" : "password"} placeholder="Password" className="pl-9 pr-10" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
            </form>
          </div>
        )}

        {tab === "customer" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div>
              <p className="font-semibold text-gray-800">Customer Login</p>
              <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-2 text-xs text-amber-700">Demo: any phone + OTP <code className="font-mono font-bold">123456</code></div>
            </div>
            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
            {!otpSent ? (
              <div className="space-y-3">
                <div className="relative"><Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input type="tel" placeholder="+91 98765 43210" className="pl-9" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
                <Button type="button" className="w-full" onClick={() => { if (!form.phone.trim()) { setError("Enter your phone number"); return; } setError(""); setOtpSent(true); }}>Send OTP</Button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <p className="text-xs text-gray-500">OTP sent to <strong>{form.phone}</strong></p>
                <Input type="text" inputMode="numeric" placeholder="123456" maxLength={6} className="h-14 text-center text-2xl font-bold tracking-[0.4em]" value={form.otp} onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value }))} autoFocus />
                <Button type="submit" className="w-full" disabled={loading || form.otp.length < 6}>{loading ? "Verifying..." : "Verify & Continue"}</Button>
                <button type="button" onClick={() => { setOtpSent(false); setError(""); }} className="w-full text-center text-xs text-gray-400 hover:text-gray-600">\u2190 Change number</button>
              </form>
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

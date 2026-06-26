"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Store, Users, Phone, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"staff" | "customer">("staff");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", phone: "", otp: "" });

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("staff-login", { email: form.email, password: form.password, redirect: false });
      if (result?.error) {
        toast({ title: "Invalid email or password", variant: "error" });
      } else {
        toast({ title: "Welcome back!", variant: "success" });
        router.push("/dashboard");
        router.refresh();
      }
    } catch { toast({ title: "Login failed. Try again.", variant: "error" }); }
    finally { setLoading(false); }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) { toast({ title: "Enter your phone number", variant: "error" }); return; }
    setOtpSent(true);
    toast({ title: "OTP sent! Use 123456 for demo" });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("customer-otp", { phone: form.phone, otp: form.otp, redirect: false });
      if (result?.error) {
        toast({ title: "Invalid OTP. Use 123456 for demo", variant: "error" });
      } else {
        toast({ title: "Logged in!", variant: "success" });
        router.push("/");
        router.refresh();
      }
    } catch { toast({ title: "Login failed", variant: "error" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-ivory px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-wine text-white font-bold text-2xl shadow-lg mb-3">AT</div>
          <h1 className="font-display text-2xl font-bold text-brand-wine">{APP_CONFIG.name}</h1>
          <p className="text-sm text-brand-text-muted">{APP_CONFIG.tagline}</p>
        </div>

        <div className="flex rounded-xl border border-gray-200 bg-white p-1">
          <button onClick={() => setTab("staff")} className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${tab === "staff" ? "bg-brand-wine text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Store size={15} /> Staff / Owner
          </button>
          <button onClick={() => setTab("customer")} className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${tab === "customer" ? "bg-brand-wine text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Users size={15} /> Customer
          </button>
        </div>

        {tab === "staff" && (
          <Card><CardContent className="p-5 space-y-4">
            <div>
              <p className="font-semibold text-gray-800">Staff / Owner Login</p>
              <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs space-y-1.5">
                <p className="font-semibold text-amber-800">Demo Credentials</p>
                <p className="text-amber-700">\ud83d\udc51 Owner: <code className="font-mono bg-amber-100 px-1 rounded">owner@adityatextile.com</code> / <code className="font-mono bg-amber-100 px-1 rounded">owner123</code></p>
                <p className="text-amber-700">\ud83d\udc77 Staff: <code className="font-mono bg-amber-100 px-1 rounded">staff@adityatextile.com</code> / <code className="font-mono bg-amber-100 px-1 rounded">staff123</code></p>
              </div>
            </div>
            <form onSubmit={handleStaffLogin} className="space-y-3">
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input type="email" placeholder="owner@adityatextile.com" className="pl-9" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input type={showPass ? "text" : "password"} placeholder="Password" className="pl-9 pr-10" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In to Dashboard"}
              </Button>
            </form>
          </CardContent></Card>
        )}

        {tab === "customer" && (
          <Card><CardContent className="p-5 space-y-4">
            <div>
              <p className="font-semibold text-gray-800">Customer Login</p>
              <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                Demo OTP: <code className="font-mono font-bold">123456</code>
              </div>
            </div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input type="tel" placeholder="+91 98765 43210" className="pl-9" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
                </div>
                <Button type="submit" className="w-full">Send OTP</Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <p className="text-xs text-gray-500">OTP sent to <strong>{form.phone}</strong></p>
                <Input type="text" inputMode="numeric" placeholder="123456" maxLength={6} className="text-center text-2xl tracking-[0.4em] font-bold h-14" value={form.otp} onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value }))} autoFocus />
                <Button type="submit" className="w-full" disabled={loading || form.otp.length < 6}>
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <button type="button" onClick={() => setOtpSent(false)} className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">
                  \u2190 Change number
                </button>
              </form>
            )}
          </CardContent></Card>
        )}

      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

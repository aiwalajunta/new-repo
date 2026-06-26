"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/constants";

export default function LoginPage() {
  const [tab, setTab] = useState<"staff" | "customer">("staff");
  const [form, setForm] = useState({ email: "", password: "", phone: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-ivory px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-wine text-white font-bold text-2xl shadow-lg">AT</div>
          <h1 className="mt-3 font-display text-2xl font-bold text-brand-wine">{APP_CONFIG.name}</h1>
          <p className="text-sm text-brand-text-muted">{APP_CONFIG.tagline}</p>
        </div>
        <div className="flex rounded-xl border border-gray-200 bg-white p-1">
          <button onClick={() => setTab("staff")} className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${tab === "staff" ? "bg-brand-wine text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><Store size={15} /> Staff / Owner</button>
          <button onClick={() => setTab("customer")} className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${tab === "customer" ? "bg-brand-wine text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><Users size={15} /> Customer</button>
        </div>
        {tab === "staff" ? (
          <Card><CardContent className="p-5 space-y-4">
            <div><p className="font-semibold text-gray-800">Staff / Owner Login</p><p className="text-xs text-gray-500 mt-0.5">Demo: owner@adityatextile.com / owner123</p></div>
            <form className="space-y-3">
              <div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input type="email" placeholder="owner@adityatextile.com" className="pl-9" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
              <div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input type="password" placeholder="Password" className="pl-9" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Sign In to Dashboard</Button>
            </form>
          </CardContent></Card>
        ) : (
          <Card><CardContent className="p-5 space-y-4">
            <div><p className="font-semibold text-gray-800">Customer Login</p><p className="text-xs text-gray-500 mt-0.5">Enter your phone number to continue</p></div>
            <div className="space-y-3">
              <Input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              {!otpSent ? (
                <Button className="w-full" onClick={() => setOtpSent(true)}>Send OTP</Button>
              ) : (
                <>
                  <Input type="text" placeholder="Enter 6-digit OTP" maxLength={6} className="text-center tracking-widest text-lg" value={form.otp} onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value }))} />
                  <p className="text-xs text-gray-400 text-center">Demo: use 123456</p>
                  <Button className="w-full">Verify & Continue</Button>
                </>
              )}
            </div>
          </CardContent></Card>
        )}
      </motion.div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, ArrowRight, Store, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/constants";
import { useAppStore } from "@/store/app-store";

type LoginMode = "select" | "owner" | "customer-phone" | "customer-otp";

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("select");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const language = useAppStore((s) => s.language);

  const handleOwnerLogin = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); /* TODO: signIn owner */ setLoading(false); };
  const handleSendOtp = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setMode("customer-otp"); setLoading(false); };
  const handleVerifyOtp = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); /* TODO: signIn customer-otp */ setLoading(false); };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-wine">{language === "hi" ? "आदित्य" : APP_CONFIG.name}</h1>
          <p className="mt-1 text-sm text-brand-text-muted">{language === "hi" ? "एथनिक की कला" : APP_CONFIG.tagline}</p>
        </div>

        {mode === "select" && (
          <div className="space-y-3">
            <Card className="cursor-pointer transition-all hover:border-brand-wine hover:shadow-md" onClick={() => setMode("customer-phone")}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-rose"><ShoppingBag className="text-brand-wine" size={24} /></div>
                <div className="flex-1">
                  <CardTitle className="text-base">{language === "hi" ? "ग्राहक लॉगिन" : "Customer Login"}</CardTitle>
                  <CardDescription>{language === "hi" ? "फोन नंबर + OTP से" : "Login with phone + OTP"}</CardDescription>
                </div>
                <ArrowRight size={18} className="text-brand-text-light" />
              </CardContent>
            </Card>
            <Card className="cursor-pointer transition-all hover:border-brand-wine hover:shadow-md" onClick={() => setMode("owner")}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/10"><Store className="text-brand-gold" size={24} /></div>
                <div className="flex-1">
                  <CardTitle className="text-base">{language === "hi" ? "मालिक लॉगिन" : "Owner Login"}</CardTitle>
                  <CardDescription>{language === "hi" ? "ईमेल + पासवर्ड से" : "Login with email + password"}</CardDescription>
                </div>
                <ArrowRight size={18} className="text-brand-text-light" />
              </CardContent>
            </Card>
          </div>
        )}

        {mode === "owner" && (
          <Card>
            <CardHeader>
              <CardTitle>{language === "hi" ? "मालिक लॉगिन" : "Owner Login"}</CardTitle>
              <CardDescription>{language === "hi" ? "ईमेल और पासवर्ड से लॉगिन करें" : "Sign in with your email and password"}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOwnerLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-brand-text">{language === "hi" ? "ईमेल" : "Email"}</label>
                  <div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-light" /><Input id="email" type="email" placeholder="admin@adityatextile.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-brand-text">{language === "hi" ? "पासवर्ड" : "Password"}</label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? (language === "hi" ? "लॉगिन हो रहा है..." : "Signing in...") : (language === "hi" ? "लॉगिन" : "Sign In")}</Button>
                <button type="button" onClick={() => setMode("select")} className="w-full text-center text-sm text-brand-text-muted hover:text-brand-wine">← {language === "hi" ? "वापस" : "Back"}</button>
              </form>
            </CardContent>
          </Card>
        )}

        {mode === "customer-phone" && (
          <Card>
            <CardHeader>
              <CardTitle>{language === "hi" ? "फोन से लॉगिन" : "Login with Phone"}</CardTitle>
              <CardDescription>{language === "hi" ? "अपना फोन नंबर दर्ज करें, हम OTP भेजेंगे" : "Enter your phone number, we'll send an OTP"}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-brand-text">{language === "hi" ? "फोन नंबर" : "Phone Number"}</label>
                  <div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-light" /><Input id="phone" type="tel" placeholder="+91 98765 43210" className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? (language === "hi" ? "भेज रहे हैं..." : "Sending...") : (language === "hi" ? "OTP भेजें" : "Send OTP")}</Button>
                <button type="button" onClick={() => setMode("select")} className="w-full text-center text-sm text-brand-text-muted hover:text-brand-wine">← {language === "hi" ? "वापस" : "Back"}</button>
              </form>
            </CardContent>
          </Card>
        )}

        {mode === "customer-otp" && (
          <Card>
            <CardHeader>
              <CardTitle>{language === "hi" ? "OTP दर्ज करें" : "Enter OTP"}</CardTitle>
              <CardDescription>{language === "hi" ? `${phone} पर भेजा गया 6-अंकीय कोड दर्ज करें` : `Enter the 6-digit code sent to ${phone}`}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" className="text-center text-2xl tracking-[0.5em]" value={otp} onChange={(e) => setOtp(e.target.value)} required autoFocus />
                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>{loading ? (language === "hi" ? "सत्यापित कर रहे हैं..." : "Verifying...") : (language === "hi" ? "सत्यापित करें" : "Verify OTP")}</Button>
                <button type="button" onClick={() => setMode("customer-phone")} className="w-full text-center text-sm text-brand-text-muted hover:text-brand-wine">← {language === "hi" ? "नंबर बदलें" : "Change number"}</button>
              </form>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

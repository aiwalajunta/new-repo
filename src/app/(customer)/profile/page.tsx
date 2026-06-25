"use client";
import { User, Heart, CalendarCheck, Gift, Globe, Bell, LogOut, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { LOYALTY } from "@/lib/constants";

function SettingRow({ icon: Icon, label, href, badge, rightEl }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; href?: string; badge?: string; rightEl?: React.ReactNode }) {
  const content = (<div className="flex items-center justify-between py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cream"><Icon size={18} className="text-brand-wine" /></div><span className="text-sm font-medium text-brand-text">{label}</span>{badge && <Badge variant="secondary">{badge}</Badge>}</div>{rightEl ?? <ChevronRight size={18} className="text-brand-text-light" />}</div>);
  if (href) return <Link href={href}>{content}</Link>;
  return <div className="cursor-pointer">{content}</div>;
}

export default function ProfilePage() {
  const { language, setLanguage } = useAppStore();
  const mockUser = { name: "Priya Sharma", phone: "+91 98765 43210", points: 245 };
  const initials = mockUser.name.split(" ").map((n) => n[0]).join("");
  const pointsRupees = Math.floor(mockUser.points * LOYALTY.pointValueInRupees);
  return (
    <div className="space-y-5 px-4 py-4 pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
        <Avatar className="h-16 w-16 border-2 border-brand-gold/40"><AvatarFallback className="font-display text-xl">{initials}</AvatarFallback></Avatar>
        <div className="flex-1"><h2 className="font-display text-xl font-semibold text-brand-text">{mockUser.name}</h2><p className="text-sm text-brand-text-muted">{mockUser.phone}</p></div>
        <Button variant="outline" size="sm" asChild><Link href="/profile/edit">{language === "hi" ? "संपादित करें" : "Edit"}</Link></Button>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-wine to-brand-wine-dark p-5 text-white">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-gold/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2"><Star size={18} className="fill-brand-gold text-brand-gold" /><span className="text-sm font-medium text-brand-gold">{language === "hi" ? "लॉयल्टी पॉइंट्स" : "Loyalty Points"}</span></div>
          <p className="mt-2 font-display text-4xl font-bold">{mockUser.points.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-sm text-white/70">{language === "hi" ? `= ₹${pointsRupees} की छूट` : `= ₹${pointsRupees} discount value`}</p>
          <div className="mt-3 flex items-center gap-2"><span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">{language === "hi" ? `₹100 खर्च पर ${LOYALTY.pointsPerHundredRupees} पॉइंट` : `Earn ${LOYALTY.pointsPerHundredRupees}pt per ₹100 spent`}</span></div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3">
        {[{ icon: Heart, label: language === "hi" ? "पसंद" : "Wishlist", href: "/wishlist" },{ icon: CalendarCheck, label: language === "hi" ? "आरक्षण" : "Reservations", href: "/reservations" }].map(({ icon: Icon, label, href }) => (<Link key={href} href={href} className="flex flex-col items-center gap-2 rounded-2xl border border-brand-border bg-white py-5 shadow-sm transition-all hover:border-brand-wine hover:shadow-md"><Icon size={24} className="text-brand-wine" /><span className="text-xs font-medium text-brand-text">{label}</span></Link>))}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-brand-border bg-white px-4 shadow-sm">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cream"><Globe size={18} className="text-brand-wine" /></div><span className="text-sm font-medium text-brand-text">{language === "hi" ? "भाषा" : "Language"}</span></div>
          <div className="flex items-center gap-2"><span className={`text-xs font-medium ${language === "en" ? "text-brand-wine" : "text-brand-text-light"}`}>EN</span><Switch checked={language === "hi"} onCheckedChange={(checked) => setLanguage(checked ? "hi" : "en")} aria-label="Toggle language" /><span className={`text-xs font-medium ${language === "hi" ? "text-brand-wine" : "text-brand-text-light"}`}>HI</span></div>
        </div>
        <Separator />
        <SettingRow icon={Bell} label={language === "hi" ? "सूचनाएं" : "Notifications"} href="/profile/notifications" />
        <Separator />
        <SettingRow icon={Gift} label={language === "hi" ? "परिवार के साइज़" : "Family Sizes"} href="/profile/family-sizes" badge={language === "hi" ? "नया" : "NEW"} />
        <Separator />
        <button className="flex w-full items-center gap-3 py-3 text-left tap-target"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50"><LogOut size={18} className="text-red-500" /></div><span className="text-sm font-medium text-red-500">{language === "hi" ? "लॉगआउट" : "Logout"}</span></button>
      </motion.div>
      <p className="text-center text-xs text-brand-text-light">Aditya Textile v0.1.0 · {language === "hi" ? "एथनिक की कला" : "Art of Ethnic"}</p>
    </div>
  );
}

export const APP_CONFIG = { name: "Aditya Textile", nameHi: "आदित्य टेक्सटाइल", tagline: "Art of Ethnic", taglineHi: "एथनिक की कला", description: "Premium Ethnic Textile Showroom — Retail Management Platform", url: "https://adityatextile.vercel.app", locale: "en-IN" } as const;

export const APPOINTMENT_STATUSES = [
  { value: "pending",    label: "Pending",    labelHi: "लंबित",            color: "bg-gray-100 text-gray-700",    dot: "bg-gray-400" },
  { value: "confirmed",  label: "Confirmed",  labelHi: "पुष्टि की गई",     color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500" },
  { value: "preparing",  label: "Preparing",  labelHi: "तैयार हो रहा है",    color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  { value: "ready",      label: "Ready",      labelHi: "तैयार है",           color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  { value: "arrived",    label: "Arrived",    labelHi: "पहुंच गए",          color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  { value: "trial",      label: "Trial",      labelHi: "ट्रायल",             color: "bg-pink-100 text-pink-700",   dot: "bg-pink-500" },
  { value: "purchased",  label: "Purchased",  labelHi: "खरीद लिया",         color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  { value: "closed",     label: "Closed",     labelHi: "बंद",               color: "bg-gray-100 text-gray-500",   dot: "bg-gray-300" },
  { value: "cancelled",  label: "Cancelled",  labelHi: "रद्द",              color: "bg-red-100 text-red-700",     dot: "bg-red-500" },
] as const;

export const TIME_SLOTS = ["10:00","10:30","11:00","11:30","12:00","12:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30"] as const;
export const PRODUCT_FABRICS = ["Pure Silk","Chanderi Silk","Banarasi Silk","Kanjivaram Silk","Cotton","Chanderi Cotton","Linen","Georgette","Chiffon","Net","Velvet","Crepe","Satin","Tussar","Organza"] as const;
export const PRODUCT_OCCASIONS = ["Wedding","Bridal","Festive","Party","Casual","Office","Daily","Navratri","Diwali","Eid","Puja"] as const;
export const STOCK_LOW_THRESHOLD = 5;
export const STOCK_CRITICAL_THRESHOLD = 2;

export const OWNER_NAV = [
  { href: "/dashboard", label: "Dashboard", labelHi: "डैशबोर्ड", icon: "LayoutDashboard" },
  { href: "/dashboard/products", label: "Products", labelHi: "उत्पाद", icon: "Package" },
  { href: "/dashboard/staff-lookup", label: "Price Lookup", labelHi: "मूल्य खोज", icon: "Search" },
  { href: "/dashboard/appointments", label: "Appointments", labelHi: "अपॉइंटमेंट", icon: "CalendarCheck" },
  { href: "/dashboard/customers", label: "Customers", labelHi: "ग्राहक", icon: "Users" },
  { href: "/dashboard/inventory", label: "Inventory", labelHi: "इन्वेंटरी", icon: "BarChart3" },
] as const;

export const CUSTOMER_NAV = [
  { href: "/", label: "Home", labelHi: "होम", icon: "Home" },
  { href: "/browse", label: "Products", labelHi: "उत्पाद", icon: "Grid3x3" },
  { href: "/appointment", label: "Book Visit", labelHi: "विज़िट बुक करें", icon: "CalendarPlus" },
  { href: "/my-appointments", label: "My Visits", labelHi: "मेरे विज़िट", icon: "CalendarCheck" },
] as const;

import * as React from "react";
import { cn } from "@/lib/utils/cn";
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (<input type={type} className={cn("flex h-11 w-full rounded-lg border border-brand-border bg-white px-4 py-2 text-sm text-brand-text ring-offset-background placeholder:text-brand-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-wine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />));
Input.displayName = "Input";
export { Input };

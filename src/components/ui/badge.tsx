import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors", { variants: { variant: { default: "bg-brand-wine text-white", secondary: "bg-brand-gold/20 text-brand-gold-muted", success: "bg-brand-emerald-light text-brand-emerald", warning: "bg-amber-100 text-amber-800", danger: "bg-red-100 text-red-800", outline: "border border-brand-border text-brand-text-muted" } }, defaultVariants: { variant: "default" } });
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) { return <div className={cn(badgeVariants({ variant }), className)} {...props} />; }
export { Badge, badgeVariants };

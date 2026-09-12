"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  UtensilsCrossed,
  CalendarDays,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useKitchenConfig } from "@/lib/supabase/hooks";

const iconMap = {
  LayoutDashboard,
  ShieldCheck,
  UtensilsCrossed,
  CalendarDays,
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const { config } = useKitchenConfig();

  return (
    <aside className="hidden lg:flex flex-col w-[var(--sidebar-width)] h-screen fixed left-0 top-0 bg-white border-r border-border z-40">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <ChefHat size={22} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">
              {config?.kitchen_name || "Dapur SPPG"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Sistem Menu & Food Safety
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Menu Utama
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-light text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={cn(
                  "transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

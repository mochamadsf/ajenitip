"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  UtensilsCrossed,
  CalendarDays,
  ChefHat,
  Menu,
  X,
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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { config } = useKitchenConfig();

  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the drawer when the route changes (compare during render, no effect)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Lock body scroll while drawer is open + close on Escape
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* ── Mobile Top Bar (< lg) ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-white/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu navigasi"
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-xl text-foreground hover:bg-surface-hover active:scale-95 transition-all"
        >
          <Menu size={22} />
        </button>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
            <ChefHat size={20} strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground">
              {config?.kitchen_name || "Dapur SPPG"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Sistem Menu & Food Safety
            </p>
          </div>
        </Link>

        {/* Spacer to keep brand visually centered */}
        <div className="w-10" />
      </header>

      {/* ── Mobile Drawer Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          "lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* ── Mobile Drawer Sidebar (< lg) ── */}
      <aside
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        inert={!open}
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] max-w-[85vw] bg-white border-r border-border shadow-xl flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo & Brand */}
        <div className="p-6 border-b border-border flex items-center justify-between">
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
          <button
            type="button"
            onClick={close}
            aria-label="Tutup menu"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground active:scale-95 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                onClick={close}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-light text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground active:scale-[0.98]",
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
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
    </>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  LogOut,
  UserCircle,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Kelola Menu", icon: UtensilsCrossed },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function BrandMark() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
        <span className="font-bold text-sm">A</span>
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-foreground">Panel Admin</p>
        <p className="text-[10px] text-muted-foreground">SPPG Dapur</p>
      </div>
    </Link>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV_LINKS.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary-light text-primary shadow-sm"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground active:scale-[0.98]"
            )}
          >
            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            <span>{item.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </>
  );
}

function UserFooter({ userEmail }: { userEmail: string }) {
  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-3 px-3 py-2">
        <UserCircle size={24} className="text-muted-foreground shrink-0" />
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-semibold text-foreground truncate">
            {userEmail}
          </p>
        </div>
      </div>
      <form action="/auth/signout" method="post">
        <button className="w-full mt-2 flex items-center gap-2 justify-center px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 active:scale-[0.98] transition-all">
          <LogOut size={14} />
          Keluar
        </button>
      </form>
    </div>
  );
}

export function AdminNav({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open + close on Escape
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
      {/* ── Desktop Sidebar (≥ md) ── */}
      <aside className="w-64 bg-white border-r border-border fixed inset-y-0 left-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <BrandMark />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLinks pathname={pathname} />
          <div className="pt-4 mt-4 border-t border-border">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <ExternalLink size={18} />
              Lihat Website
            </Link>
          </div>
        </nav>

        <UserFooter userEmail={userEmail} />
      </aside>

      {/* ── Mobile Top Bar (< md) ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-16 bg-white/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu navigasi"
          aria-expanded={open}
          aria-controls="admin-mobile-drawer"
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-xl text-foreground hover:bg-surface-hover active:scale-95 transition-all"
        >
          <Menu size={22} />
        </button>

        <BrandMark />

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            aria-label="Keluar"
            className="flex items-center justify-center w-10 h-10 -mr-2 rounded-xl text-red-600 hover:bg-red-50 active:scale-95 transition-all"
          >
            <LogOut size={20} />
          </button>
        </form>
      </header>

      {/* ── Mobile Drawer Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          "md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* ── Mobile Drawer (< md) ── */}
      <aside
        id="admin-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi admin"
        inert={!open}
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-border shadow-xl flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <BrandMark />
          <button
            type="button"
            onClick={close}
            aria-label="Tutup menu"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground active:scale-95 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Utama
          </p>
          <NavLinks pathname={pathname} onNavigate={close} />
          <div className="pt-4 mt-4 border-t border-border">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <ExternalLink size={18} />
              Lihat Website
            </Link>
          </div>
        </nav>

        <UserFooter userEmail={userEmail} />
      </aside>
    </>
  );
}

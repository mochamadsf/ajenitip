"use client";

import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Footer } from "./footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileNav />

      {/* Main content area — pt-20 clears the fixed mobile top bar */}
      <main className="lg:ml-[var(--sidebar-width)] min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-20 lg:pt-8">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}

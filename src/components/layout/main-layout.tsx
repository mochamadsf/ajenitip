"use client";

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { Footer } from "./footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <BottomNav />

      {/* Main content area */}
      <main className="lg:ml-[var(--sidebar-width)] min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-[calc(var(--bottomnav-height)+1rem)] lg:pb-8">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}

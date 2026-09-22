"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { MenuHeroCard } from "@/components/menu/menu-hero-card";
import { MenuComponentsList } from "@/components/menu/menu-components-list";
import { NutritionTable } from "@/components/menu/nutrition-table";
import { SafetyWarning } from "@/components/menu/safety-warning";
import { useMenuByDate, useTodayMenu } from "@/lib/supabase/hooks";
import { HeroSkeleton, CardSkeleton } from "@/components/ui/skeleton";

function MenuContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  
  // Use today's menu if no date is specified
  const todayHook = useTodayMenu();
  const dateHook = useMenuByDate(dateParam);
  
  const { menu, loading, error } = dateParam ? dateHook : todayHook;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {dateParam ? "Detail Menu" : "Menu Hari Ini"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Informasi lengkap komponen menu, nilai gizi, dan saran penyajian.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <HeroSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="space-y-6">
              <CardSkeleton />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
          Terjadi kesalahan saat memuat data: {error}
        </div>
      ) : !menu ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-muted-foreground">
          Belum ada data menu.
        </div>
      ) : (
        <div className="space-y-6">
          <MenuHeroCard menu={menu} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 animate-slide-up stagger-1">
              <MenuComponentsList components={menu.menu_components} />
              <NutritionTable menu={menu} />
            </div>
            
            <div className="animate-slide-up stagger-2">
              <SafetyWarning />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuHariIniPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat...</div>}>
        <MenuContent />
      </Suspense>
    </MainLayout>
  );
}

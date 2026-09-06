"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DateFilter } from "@/components/history/date-filter";
import { HistoryGrid } from "@/components/history/history-grid";
import { useMenuHistory } from "@/lib/supabase/hooks";
import { GridSkeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function RiwayatMenuPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { menus, loading, error, fetchAll, fetchByDate } = useMenuHistory();

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    if (date) {
      fetchByDate(date);
    } else {
      fetchAll();
    }
  };

  const handleShowAll = () => {
    setSelectedDate(null);
    setSearchTerm("");
    fetchAll();
  };

  const filteredMenus = menus.filter((menu) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchName = menu.menu_name.toLowerCase().includes(term);
    const matchComponent = menu.menu_components.some((c) =>
      c.toLowerCase().includes(term)
    );
    return matchName || matchComponent;
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-fade-in mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Riwayat Menu
          </h1>
          <p className="text-muted-foreground text-sm">
            Lihat daftar menu yang telah disajikan pada hari-hari sebelumnya.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <DateFilter
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onShowAll={handleShowAll}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <GridSkeleton count={6} />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
                Terjadi kesalahan saat memuat data: {error}
              </div>
            ) : (
              <HistoryGrid menus={filteredMenus} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

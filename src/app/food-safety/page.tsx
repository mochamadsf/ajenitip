"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { BatchSafetyRings } from "@/components/food-safety/batch-safety-rings";
import { SafetySummaryTable } from "@/components/food-safety/safety-summary-table";
import { useTodayMenu } from "@/lib/supabase/hooks";
import { TableSkeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function FoodSafetyPage() {
  const { menu, loading, error } = useTodayMenu();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Status Keamanan Pangan
          </h1>
          <p className="text-muted-foreground text-sm">
            Pantau status keamanan makanan secara real-time untuk memastikan makanan
            layak konsumsi.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <CardSkeleton />
            <TableSkeleton />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
            Terjadi kesalahan saat memuat data: {error}
          </div>
        ) : !menu ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center text-muted-foreground">
            Belum ada data menu dan jadwal.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Safety Card: 1 card — realtime clock + 3 batch countdown rings */}
            <BatchSafetyRings menu={menu} />

            {/* Summary Table */}
            <SafetySummaryTable menu={menu} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

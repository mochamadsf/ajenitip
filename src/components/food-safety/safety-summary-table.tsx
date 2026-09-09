"use client";

import { Table } from "lucide-react";
import type { DailyMenu } from "@/lib/supabase/types";
import { formatDateShortWIB, formatTimeRange } from "@/lib/time";

interface SummaryTableProps {
  menu: DailyMenu;
}

export function SafetySummaryTable({ menu }: SummaryTableProps) {
  const menuDate = new Date(menu.menu_date + "T00:00:00+07:00");

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden card-hover animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Table size={16} strokeWidth={2} className="text-muted-foreground" />
        <h3 className="text-sm font-bold text-foreground">Ringkasan Jadwal</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Informasi
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Batch 1
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Batch 2
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Batch 3
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-surface/50 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">Tanggal</td>
              <td
                className="px-4 py-3 text-muted-foreground tabular-nums"
                colSpan={3}
              >
                {formatDateShortWIB(menuDate)}
              </td>
            </tr>
            <tr className="hover:bg-surface/50 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">
                Jam Produksi
              </td>
              <td className="px-4 py-3 text-muted-foreground tabular-nums">
                {menu.batch1_production_time || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground tabular-nums">
                {menu.batch2_production_time || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground tabular-nums">
                {menu.batch3_production_time || "—"}
              </td>
            </tr>
            <tr className="hover:bg-surface/50 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">
                Rentang Pengiriman
              </td>
              <td className="px-4 py-3 text-muted-foreground tabular-nums">
                {formatTimeRange(menu.batch1_delivery_start, menu.batch1_delivery_end) || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground tabular-nums">
                {formatTimeRange(menu.batch2_delivery_start, menu.batch2_delivery_end) || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground tabular-nums">
                {formatTimeRange(menu.batch3_delivery_start, menu.batch3_delivery_end) || "—"}
              </td>
            </tr>
            <tr className="hover:bg-surface/50 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">
                Status Pengiriman
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    menu.batch1_delivered ? "badge-safe" : "badge-warning"
                  }
                >
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {menu.batch1_delivered ? "Terkirim" : "Menunggu"}
                  </span>
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    menu.batch2_delivered ? "badge-safe" : "badge-warning"
                  }
                >
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {menu.batch2_delivered ? "Terkirim" : "Menunggu"}
                  </span>
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    menu.batch3_delivered ? "badge-safe" : "badge-warning"
                  }
                >
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {menu.batch3_delivered ? "Terkirim" : "Menunggu"}
                  </span>
                </span>
              </td>
            </tr>
            <tr className="hover:bg-surface/50 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">
                Masa Aman
              </td>
              <td className="px-4 py-3 text-muted-foreground" colSpan={3}>
                {menu.safe_hours} jam setelah proses produksi
              </td>
            </tr>
            {menu.nutritionist_name && (
              <tr className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  Ahli Gizi
                </td>
                <td className="px-4 py-3 text-muted-foreground" colSpan={3}>
                  {menu.nutritionist_name}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

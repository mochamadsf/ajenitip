"use client";

import Image from "next/image";
import { ShieldCheck, Calendar, ImageIcon, Truck } from "lucide-react";
import type { DailyMenu } from "@/lib/supabase/types";
import { formatDateWIB, formatTimeRange } from "@/lib/time";

interface MenuHeroProps {
  menu: DailyMenu;
}

export function MenuHeroCard({ menu }: MenuHeroProps) {
  const menuDate = new Date(menu.menu_date + "T00:00:00+07:00");

  const deliveryRanges = [
    {
      label: "Batch 1",
      start: menu.batch1_delivery_start,
      end: menu.batch1_delivery_end,
      delivered: menu.batch1_delivered,
    },
    {
      label: "Batch 2",
      start: menu.batch2_delivery_start,
      end: menu.batch2_delivery_end,
      delivered: menu.batch2_delivered,
    },
    {
      label: "Batch 3",
      start: menu.batch3_delivery_start,
      end: menu.batch3_delivery_end,
      delivered: menu.batch3_delivered,
    },
  ].filter((r) => formatTimeRange(r.start, r.end));

  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden animate-fade-in flex flex-col md:flex-row shadow-sm">
      {/* Hero Image */}
      <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto md:min-h-[280px] bg-surface overflow-hidden flex-shrink-0">
        {menu.photo_url ? (
          <Image
            src={menu.photo_url}
            alt={`Foto menu ${menu.menu_name}`}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground bg-surface">
            <ImageIcon size={40} strokeWidth={1.5} />
            <span className="text-sm font-medium">Foto Menu</span>
          </div>
        )}

        {/* Overlay Badge */}
        <div className="absolute top-4 left-4">
          <div className="badge-safe inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-emerald-500/90 text-white">
            <ShieldCheck size={14} strokeWidth={2.5} />
            AMAN
          </div>
        </div>
      </div>

      {/* Menu Info */}
      <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
        <div className="flex items-center gap-2 text-primary mb-3 bg-primary/10 w-fit px-3 py-1.5 rounded-lg">
          <Calendar size={14} strokeWidth={2.5} />
          <span className="text-xs font-bold">{formatDateWIB(menuDate)}</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4">
          {menu.menu_name}
        </h2>
        
        {/* Jadwal rentang pengiriman per batch (24 jam) */}
        {deliveryRanges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {deliveryRanges.map((r) => (
              <span
                key={r.label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border/60 text-xs font-semibold text-foreground"
              >
                <Truck
                  size={12}
                  className={
                    r.delivered ? "text-emerald-500" : "text-orange-500"
                  }
                />
                {r.label}: {formatTimeRange(r.start, r.end)} WIB
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-auto pt-6 border-t border-border/50">
          {menu.beneficiary_count > 0 && (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Porsi Disiapkan
              </span>
              <span className="text-lg font-bold text-foreground">
                {menu.beneficiary_count.toLocaleString("id-ID")}
              </span>
            </div>
          )}
          
          {menu.safe_hours && (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Batas Konsumsi
              </span>
              <span className="text-lg font-bold text-foreground">
                {menu.safe_hours} Jam
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

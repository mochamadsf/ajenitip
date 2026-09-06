"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Users, Calendar } from "lucide-react";
import type { DailyMenu } from "@/lib/supabase/types";
import { formatDateShortWIB } from "@/lib/time";

interface HistoryGridProps {
  menus: DailyMenu[];
}

export function HistoryGrid({ menus }: HistoryGridProps) {
  if (menus.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-border p-12 text-center animate-fade-in shadow-sm">
        <Calendar size={44} strokeWidth={1.5} className="text-muted-foreground mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground mb-1">
          Belum Ada Menu
        </h3>
        <p className="text-xs text-muted-foreground">
          Tidak ditemukan data menu untuk tanggal atau filter yang Anda pilih.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {menus.map((menu, index) => {
        const menuDate = new Date(menu.menu_date + "T00:00:00+07:00");
        return (
          <div
            key={menu.id}
            className={cn(
              "group bg-white rounded-3xl border border-border overflow-hidden animate-slide-up flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-200",
              `stagger-${Math.min(index + 1, 5)}`
            )}
          >
            {/* Thumbnail */}
            <div className="relative aspect-[16/9] bg-surface overflow-hidden">
              {menu.photo_url ? (
                <Image
                  src={menu.photo_url}
                  alt={`Menu ${menu.menu_name}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-gradient-to-br from-surface to-border/30">
                  <ImageIcon size={36} strokeWidth={1.2} />
                  <span className="text-xs font-medium">Foto Menu Ompreng</span>
                </div>
              )}
              {/* Date Badge over image */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-foreground flex items-center gap-2 shadow-sm border border-black/5">
                <Calendar size={14} strokeWidth={2.5} className="text-primary" />
                {formatDateShortWIB(menuDate)}
              </div>

              {/* Beneficiaries Badge */}
              {menu.beneficiary_count > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <Users size={12} />
                  <span>{menu.beneficiary_count.toLocaleString("id-ID")} porsi</span>
                </div>
              )}
            </div>

            {/* Info Body */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-base font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
                {menu.menu_name}
              </h3>
              
              {/* Detailed Components List */}
              <div className="flex-1 mb-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Komponen Menu Sajian
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {menu.menu_components.map((comp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface text-xs font-medium text-foreground border border-border/60"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Batch Delivery Statuses */}
              <div className="bg-surface/60 rounded-2xl p-3 border border-border/60 mb-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Status Distribusi Batch
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-xl p-2 border border-border/40">
                    <p className="text-[10px] text-muted-foreground font-semibold">Batch 1</p>
                    <p className={cn("text-[11px] font-bold mt-0.5", menu.batch1_delivered ? "text-emerald-600" : "text-orange-500")}>
                      {menu.batch1_delivered ? "✓ Terkirim" : "Produksi"}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-border/40">
                    <p className="text-[10px] text-muted-foreground font-semibold">Batch 2</p>
                    <p className={cn("text-[11px] font-bold mt-0.5", menu.batch2_delivered ? "text-emerald-600" : "text-orange-500")}>
                      {menu.batch2_delivered ? "✓ Terkirim" : "Produksi"}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-border/40">
                    <p className="text-[10px] text-muted-foreground font-semibold">Batch 3</p>
                    <p className={cn("text-[11px] font-bold mt-0.5", menu.batch3_delivered ? "text-emerald-600" : "text-orange-500")}>
                      {menu.batch3_delivered ? "✓ Terkirim" : "Produksi"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Details */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground mt-auto">
                <div>
                  Ahli Gizi: <span className="font-semibold text-foreground">{menu.nutritionist_name || "—"}</span>
                </div>
                <div>
                  Masa Aman: <span className="font-semibold text-foreground">{menu.safe_hours} Jam</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

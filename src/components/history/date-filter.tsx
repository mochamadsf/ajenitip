"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Search, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  onShowAll: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function DateFilter({
  selectedDate,
  onDateSelect,
  onShowAll,
  searchTerm = "",
  onSearchChange,
}: DateFilterProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [isOpen, setIsOpen] = useState(true);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function handleDateClick(day: number) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onDateSelect(dateStr);
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-3xl border border-border p-5 sm:p-6 shadow-sm animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Filter size={18} strokeWidth={2} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Filter & Cari</h3>
            <p className="text-[10px] text-muted-foreground">Pencarian menu & tanggal</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-lg"
        >
          {isOpen ? "Sembunyikan" : "Kalender"}
        </button>
      </div>

      {/* Search Input (If provided) */}
      {onSearchChange && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama menu / lauk..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-surface focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      )}

      {/* Quick Action Pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            onDateSelect(todayStr);
          }}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1",
            selectedDate === todayStr
              ? "bg-primary text-white shadow-sm"
              : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground border border-border/50"
          )}
        >
          <CalendarDays size={13} />
          Hari Ini
        </button>
        <button
          onClick={() => {
            onShowAll();
            onDateSelect(null);
          }}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1",
            selectedDate === null && !searchTerm
              ? "bg-primary text-white shadow-sm"
              : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground border border-border/50"
          )}
        >
          <RotateCcw size={12} />
          Semua Data
        </button>
      </div>

      {/* Selected Date Tag */}
      {selectedDate && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs font-bold text-primary">
          <span>Filter: {selectedDate}</span>
          <button
            onClick={() => onDateSelect(null)}
            className="text-[10px] text-primary/80 hover:text-primary underline font-medium"
          >
            Reset
          </button>
        </div>
      )}

      {/* Interactive Calendar Widget */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 pt-2 border-t border-border/50",
          isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pt-0 border-t-0"
        )}
      >
        {/* Month & Year Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg hover:bg-surface transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-bold text-foreground tracking-tight">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg hover:bg-surface transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day Name Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-bold text-muted-foreground/80 py-0.5"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isFuture = new Date(dateStr) > today;

            return (
              <button
                key={day}
                onClick={() => !isFuture && handleDateClick(day)}
                disabled={isFuture}
                className={cn(
                  "w-full aspect-square rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center",
                  isSelected
                    ? "bg-primary text-white shadow-sm scale-105"
                    : isToday
                    ? "bg-primary/10 text-primary font-black border border-primary/30"
                    : isFuture
                    ? "text-muted-foreground/20 cursor-not-allowed"
                    : "text-foreground hover:bg-surface hover:scale-105"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

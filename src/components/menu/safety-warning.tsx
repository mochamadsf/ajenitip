"use client";

import { AlertTriangle, Lightbulb, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  SAFETY_WARNING_TITLE,
  SAFETY_WARNING_ITEMS,
  SERVING_SUGGESTIONS_TITLE,
  SERVING_SUGGESTIONS,
} from "@/lib/constants";

export function SafetyWarning() {
  const [warningOpen, setWarningOpen] = useState(true);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Warning Card */}
      <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
        <button
          onClick={() => setWarningOpen(!warningOpen)}
          className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-red-50/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} strokeWidth={2.2} className="text-red-500" />
          </div>
          <span className="text-sm font-bold text-foreground flex-1">
            {SAFETY_WARNING_TITLE}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              warningOpen && "rotate-180"
            )}
          />
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            warningOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-5 pb-5 pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              Jangan dikonsumsi apabila:
            </p>
            <ul className="space-y-2">
              {SAFETY_WARNING_ITEMS.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Serving Suggestions Card */}
      <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
        <button
          onClick={() => setSuggestionsOpen(!suggestionsOpen)}
          className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-amber-50/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Lightbulb size={16} strokeWidth={2.2} className="text-amber-500" />
          </div>
          <span className="text-sm font-bold text-foreground flex-1">
            {SERVING_SUGGESTIONS_TITLE}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              suggestionsOpen && "rotate-180"
            )}
          />
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            suggestionsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-5 pb-5 pt-0">
            <ul className="space-y-2">
              {SERVING_SUGGESTIONS.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

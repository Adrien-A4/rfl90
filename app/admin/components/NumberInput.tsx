"use client";

import { Minus, Plus } from "lucide-react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 99,
  className = "",
}: NumberInputProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-lg bg-[#0d0d0d] border border-white/10 flex items-center justify-center hover:bg-[#1a1a1a] hover:border-white/20 transition-colors"
      >
        <Minus className="w-4 h-4 text-white/60" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (!isNaN(val)) {
            onChange(Math.max(min, Math.min(max, val)));
          }
        }}
        min={min}
        max={max}
        className="w-16 px-2 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white text-center"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-lg bg-[#0d0d0d] border border-white/10 flex items-center justify-center hover:bg-[#1a1a1a] hover:border-white/20 transition-colors"
      >
        <Plus className="w-4 h-4 text-white/60" />
      </button>
    </div>
  );
}

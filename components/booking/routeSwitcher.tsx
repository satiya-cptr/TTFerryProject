"use client";

// the route switching part of the booking widget

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons";

type Direction = "POS_TO_TBG" | "TBG_TO_POS";

interface RouteSwitcherProps {
  onRouteChange?: (from: string, to: string) => void;
}

export default function RouteSwitcher({ onRouteChange }: RouteSwitcherProps) {
  const [direction, setDirection] = useState<Direction>("POS_TO_TBG");

  const fromCode = direction === "POS_TO_TBG" ? "POS" : "TBG";
  const toCode = direction === "POS_TO_TBG" ? "TBG" : "POS";

  const fromDisplay = direction === "POS_TO_TBG" ? "Port-of-Spain" : "Scarborough";
  const toDisplay = direction === "POS_TO_TBG" ? "Scarborough" : "Port-of-Spain";

  const swap = () => {
    const newDirection = direction === "POS_TO_TBG" ? "TBG_TO_POS" : "POS_TO_TBG";
    setDirection(newDirection);

    const newFrom = newDirection === "POS_TO_TBG" ? "POS" : "TBG";
    const newTo = newDirection === "POS_TO_TBG" ? "TBG" : "POS";
    
    if (onRouteChange) {
      onRouteChange(newFrom, newTo);
    }
  };

  
  useEffect(() => {
    if (onRouteChange) {
      onRouteChange(fromCode, toCode);
    }
  }, [fromCode, toCode, onRouteChange]);

  return (
    <div className="inline-flex items-center gap-[32px]">

      {/* from */}
      <div className="flex items-center gap-2">
        <div>
          <div className="text-xs uppercase font-bold text-blue-ink/60 mb-1">
            From
          </div>

          <div className="mt-[8px] text-base font-bold text-blue-ink">
            {fromDisplay}
          </div>
        </div>
      </div>

      {/* swap button */}
      <button onClick={swap} className="transition-transform active:scale-95">
        <div className="w-[44px] h-[44px] rounded-full bg-blue-ink/5 border border-blue-ink/25 flex items-center justify-center shrink-0">
          <div className="w-[32px] h-[32px] hover:h-[30px] hover:w-[30px] rounded-full bg-blue-ink flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} size={20} className="text-light-surface" />
          </div>
        </div>
      </button>

      {/* to */}
      <div className="flex items-center gap-2">
        <div>
          <div className="text-xs uppercase font-bold text-blue-ink/60 mb-1">
            To
          </div>

          <div className="mt-2 text-base font-bold text-blue-ink">
            {toDisplay}
          </div>
        </div>
      </div>

    </div>
  );
}
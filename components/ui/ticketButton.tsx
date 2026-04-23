"use client";

// DEPRECATED

import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
import RollingText from './rollingText';


import { motion } from "framer-motion";

interface TicketButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: "arrow-right" | "arrow-up-right";
  variant?: "dark" | "light";
}

export default function TicketButton({
  children,
  onClick,
  className = "",
  icon = "arrow-up-right",
  variant = "dark",
}: TicketButtonProps) {
  const SelectedIcon =
    icon === "arrow-right" ? ArrowRight02Icon : ArrowUpRight01Icon;

  const styles = {
    dark: {
      stroke: "var(--color-blue-ink)",
      text: "text-blue-ink",
      divider: "var(--color-blue-ink)",
      fillOpacity: 0,
    },
    light: {
      stroke: "var(--color-light-surface)",
      text: "text-light-surface",
      divider: "var(--color-light-surface)",
      fillOpacity: 0,
    },
  };

  const current = styles[variant];

  return (
    <motion.button
      onClick={onClick}
      className={`relative ${className}`}
      style={{ width: "158px", height: "35px" }}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {/* SVG Background */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 158 35"
        fill="none"
      >
        <path
          d="M146 0C152.627 0 158 5.37258 158 12V23C158 29.6274 152.627 35 146 35H126C126 32.7909 124.209 31 122 31C119.791 31 118 32.7909 118 35H12C5.37258 35 0 29.6274 0 23V12C0 5.37258 5.37258 0 12 0H118C118 2.20914 119.791 4 122 4C124.209 4 126 2.20914 126 0H146Z"
          fill="white"
          fillOpacity={current.fillOpacity}
        />

        <path
          d="M12 0.400391H117.619C117.821 2.64275 119.705 4.40039 122 4.40039C124.295 4.40039 126.179 2.64275 126.381 0.400391H146C152.407 0.400391 157.6 5.5935 157.6 12V23C157.6 29.4065 152.407 34.5996 146 34.5996H126.381C126.179 32.3572 124.295 30.5996 122 30.5996C119.705 30.5996 117.821 32.3572 117.619 34.5996H12C5.5935 34.5996 0.400391 29.4065 0.400391 23V12C0.400391 5.5935 5.5935 0.400391 12 0.400391Z"
          fill="none"
          stroke={current.stroke}
          strokeWidth="1.2"
        />
      </svg>

      {/* Divider */}
      <div
        className="absolute top-1/2 -translate-y-1/2 border-l border-dashed"
        style={{
          left: "122px",
          height: "55%",
          borderColor: current.divider,
        }}
      />

      {/* Content */}
      <div className="relative h-full flex">
        <div
          className={`flex-1 flex items-center justify-center font-ubuntu text-[14px] ${current.text}`}
        >
          <RollingText
            primary={children as string}
            secondary={children as string}
          />
        </div>

        <div className="w-[38px] flex items-center justify-center">
          <HugeiconsIcon
            icon={SelectedIcon}
            size={20.8}
            color={current.stroke}
          />
        </div>
      </div>
    </motion.button>
  );
}
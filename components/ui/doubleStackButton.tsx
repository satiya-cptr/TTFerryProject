import { motion } from "framer-motion";
import { ReactNode } from "react";

// double stacked button (button with nested container)
// has light and dark variants, start and end content, and optional child space

interface DoubleStackButtonProps {
  children?: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  variant?: "light" | "dark" | "bland";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export const DoubleStackButton = ({
  children,
  startContent,
  endContent,
  variant = "dark",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: DoubleStackButtonProps) => {
  const isIconOnly = !children;
  const styles = {
    dark: {
      outerBg: "bg-blue-ink/5",
      outerStroke: "border-blue-ink/25",
      innerBg: "bg-blue-ink",
      textColor: "text-light-surface",
      gradientTop: "from-blue-ink/20 80%",
    },
    light: {
      outerBg: "bg-[#E4EFF7]/20",
      outerStroke: "border-[#CCDAE3]/60",
      innerBg: "bg-[#F1F7FB]",
      textColor: "text-blue-ink",
      gradientTop: "from-blue-surface/20 80%",
    },
    bland: {
      outerBg: "bg-blue-surface/5",
      outerStroke: "border-blue-ink/10",
      innerBg: "bg-light-surface",
      textColor: "text-blue-ink/60",
      gradientTop: "from-light-surface 80%",
    }
  };

  const current = styles[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      initial="rest"  
      whileHover="hover"  
      animate="rest"    
      whileTap={disabled ? {} : { scale: 0.96 }}
      className={`group relative h-12 flex items-center justify-center rounded-full border box-border transition-opacity disabled:opacity-50 
        ${current.outerBg} ${current.outerStroke} ${className}
        ${isIconOnly ? "w-12" : "w-fit"} 
      `}
      style={{ padding: '8px' }}
    >
      <motion.div
        whileTap={disabled ? {} : { scale: 0.94 }}
        className={`relative h-8 flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 
          ${current.innerBg} ${current.textColor}
          ${isIconOnly ? "w-8 px-0" : "w-full px-[14px] gap-1.5"}
        `}
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${current.gradientTop} to-light-surface/20 pointer-events-none`} />

        {startContent && (
          <div className="relative z-10 flex items-center justify-center">
            {startContent}
          </div>
        )}

        {children && (
          <div className="relative z-10 text-base font-regular">
            {children}
          </div>
        )}

        {endContent && (
          <div className="relative z-10 flex items-center justify-center">
            {endContent}
          </div>
        )}
      </motion.div>
    </motion.button>
  );
};
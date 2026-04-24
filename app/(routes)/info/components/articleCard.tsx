
import { DoubleStackButton } from "@/components/ui/doubleStackButton";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";

interface ArticleCardProps {
  index: string;
  title: string;
  subtitle: string;
  badge?: string;
  image?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const ArticleCard = ({
  index,
  title,
  subtitle,
  badge,
  image,
  onClick,
  disabled = false,
}: ArticleCardProps) => {
  return (
    <div className="relative group">
      <div
        onClick={!disabled ? onClick : undefined}
        className={` relative w-full text-left bg-light-surface rounded-[24px] p-8 border border-blue-ink/5 transition-all duration-200 select-none
          ${!disabled 
            ? "cursor-pointer hover:shadow-[1px_2px_18px_0px_rgba(8,23,50,0.05)] active:scale-[0.99]" 
            : "cursor-not-allowed"}
        `}
      >
        {/* index + badge */}
        <div className="relative flex items-center w-full h-[32px]"> 
          <span className="text-base font-semimedium text-blue-ink/60 tracking-tight">  /{index} </span>
  
          {badge && (
            <div className="absolute right-0 px-4  pt-[8px] pb-[6px]  border border-blue-ink/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-light text-blue-ink/60 uppercase leading-none mt-[-1px]"> {badge} </span>
            </div>
          )}
        </div>

        {/* img/gradient */}
        <div className="mt-[54px] flex justify-center">
          <div className="relative w-[215px] h-[260px] rounded-[69px] overflow-hidden bg-blue-surface/5">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-surface/20 to-light-surface/20 pointer-events-none" />
            {image && (
              <div className="relative w-full h-full p-2 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image src={image} alt={title} fill className="object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* title */}
        <div className="mt-[79px] flex flex-row items-end justify-between md:gap-[28px]">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-semimedium text-blue-ink line-clamp-2 leading-tight inter-tight">
              {title}
            </h3>
            <p className="mt-2 text-sm font-light text-blue-ink/60 line-clamp-1 inter-tight">
              {subtitle}
            </p>
          </div>

          {/* btn */}
          <div className="flex-shrink-0">
            <DoubleStackButton 
              variant="dark" 
              startContent={ <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={1.5} /> } 
              className="pointer-events-none"
            />
          </div>
        </div>

        {/* disabled overlay */}
        {disabled && (
          <div className="absolute inset-0 z-50 rounded-[24px] bg-gradient-to-b from-blue-surface/10 to-light-surface/30 pointer-events-auto" />
        )}
      </div>
    </div>
  );
};
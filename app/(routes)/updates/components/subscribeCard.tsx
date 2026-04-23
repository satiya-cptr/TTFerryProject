"use client";

//TODO: make functional

import { DoubleStackButton } from "@/components/ui/doubleStackButton";
import RollingText from "@/components/ui/rollingText";
import { toast } from "@heroui/react";
import Image from "next/image";

export const SubscribeCard = () => {
  return (
    <section className="mx-[10px] mb-[10px] relative min-h-[300px] rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-6 md:p-12">
      
      <Image  src="/images/pexels-alexeydemidov-temp.jpg" alt=" " fill className="object-cover md:object-[center_53%]" />

      <div className="absolute inset-0 bg-blue-ink/5" />
      <div className="absolute inset-0 bg-blue-ink/45 mix-blend-overlay" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[900px]">
        <h2 className="text-light-surface text-center font-medium font-inter-tight text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-5">
          Never want to miss an update?
        </h2>

        <div className="w-full max-w-sm flex items-center h-[48px] rounded-full border border-[#CCDAE3] bg-[#E4EFF7]/20 backdrop-blur-[6px] overflow-hidden">
          <input
            type="email"
            placeholder="name@email.com"
            className="flex-1 min-w-0 h-full bg-transparent px-4 md:px-6 text-light-surface placeholder:text-light-surface/80 outline-none text-sm font-light"
          />
          <div className="h-full flex-shrink-0">
            <DoubleStackButton variant="light" className="h-full px-5 md:px-8" onClick={() => toast.success("You have subscribed to service updates.")}>
              <RollingText primary="subscribe" secondary="subscribe" />
            </DoubleStackButton>
          </div>
        </div>
      </div>
    </section>
  );
};
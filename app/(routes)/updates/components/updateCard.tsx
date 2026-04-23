"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@heroui/react"; 
import { Update } from "@/lib/types/updateTypes";
import { DoubleStackButton } from "@/components/ui/doubleStackButton";
import RollingText from "@/components/ui/rollingText";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon} from "@hugeicons/core-free-icons";

interface UpdateCardProps {
  update: Update;
}

export const UpdateCard = ({ update }: UpdateCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const jsDate = update.createdAt.toDate();
  const monthText = jsDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const dayText = jsDate.toLocaleDateString("en-US", { day: "2-digit" });

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger className="group relative w-full border border-blue-ink/5 flex flex-col md:flex-row md:items-center p-8 md:py-5 md:px-7 bg-light-surface rounded-[32px] cursor-pointer select-none transition-all duration-200 active:scale-[0.99] hover:shadow-[1px_2px_12px_0px_rgba(8,23,50,0.05)]">
  
        {/* date */}
        <div className="flex items-center justify-between md:justify-start md:min-w-[80px] md:shrink-0">
          <div className="flex flex-row items-baseline gap-1 md:gap-2 text-blue-ink">
            <span className="text-lg md:text-4xl font-semimedium leading-none"> {dayText} </span>
            <span className="text-xs font-light uppercase tracking-tight "> {monthText} </span>
          </div>
        </div>

        {/* img/gradient */}
        <div className="mt-12 md:mt-0 md:mx-8 flex justify-center md:block shrink-0">
          <div className="relative w-[215px] h-[260px] rounded-[69px] md:w-[90px] md:h-[100px] md:rounded-[36px] overflow-hidden bg-blue-surface/5">
            {update.imageUrl ? (
              <Image src={update.imageUrl} alt={update.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-blue-surface/50 to-light-surface/100" />
            )}
          </div>
        </div>

        {/* content + btn */}
        <div className="mt-12 md:mt-0 flex flex-col md:flex-row md:items-center justify-between flex-1 min-w-0">
          <div className="flex-1 min-w-0 text-left">
            <h3 className="text-2xl font-semimedium text-blue-ink line-clamp-2 md:line-clamp-1 font-inter-tight">
              {update.title}
            </h3>
            <p className="mt-2 md:mt-1 text-sm md:text-lg font-light md:font-regular text-blue-ink/60 line-clamp-2 md:line-clamp-1 font-inter-tight">
              {update.subtitle}
            </p>
          </div>

          <div className="mt-8 md:mt-0 md:ml-8 flex-shrink-0">
            <DoubleStackButton variant="dark" className="w-full md:w-auto pointer-events-none"
              endContent={<HugeiconsIcon icon={ArrowRight02Icon} size={20} strokeWidth={1.5} />}
            >
              <RollingText primary="see more" secondary="see more" />
            </DoubleStackButton>
          </div>
        </div>
      </Modal.Trigger>

      {/* content */}
      <Modal.Backdrop>
        <Modal.Container scroll="outside" size="cover" >
          <Modal.Dialog className="max-w-2xl bg-light-surface rounded-[32px] h-auto font-inter-tight">
            <Modal.CloseTrigger />
            <Modal.Header className="pt-8 md:px-8">
              <Modal.Heading className="text-3xl font-semimedium text-blue-ink">
                {update.title}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className=" md:px-8">
              <p className="text-blue-ink/60 mb-6 text-lg">{update.subtitle}</p>
              
              {update.imageUrl && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
                  <Image src={update.imageUrl} alt={update.title} fill className="object-cover" />
                </div>
              )}
              
              <div className="text-blue-ink/80 text-base font-regular leading-relaxed whitespace-pre-wrap mb-8">
                {update.body}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
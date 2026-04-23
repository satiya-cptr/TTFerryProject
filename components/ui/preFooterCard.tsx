import Image from "next/image";
import { DoubleStackButton } from "./doubleStackButton";
import RollingText from "./rollingText";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";

interface PreFooterProps {
  message: string;
  buttonText: string;
  onClick: () => void;
}

export default function PreFooterWidget({ message, buttonText, onClick }: PreFooterProps) {
  return (
    <section className="mx-[10px] mb-[10px] relative min-h-[300px] rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-6 md:p-12">
      
      <Image src="/images/pexels-alexeydemidov-temp.jpg" alt=" " fill className="object-cover md:object-[center_53%]" />

      <div className="absolute inset-0 bg-blue-ink/5" />

      <div className="absolute inset-0 bg-blue-ink/45 mix-blend-overlay" />

      <div className="relative z-10 flex flex-col items-center max-w-300">
        <h2 className="text-light-surface text-center font-medium font-inter-tight text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-5 ">
          {message}
        </h2>

        <DoubleStackButton variant="light" onClick={onClick} endContent={<HugeiconsIcon icon={ArrowRight02Icon} size={20} strokeWidth={1.5} />}>
          <RollingText primary={buttonText} secondary={buttonText} />
        </DoubleStackButton>
      </div>
    </section>
  );
}
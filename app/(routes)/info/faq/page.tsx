"use client";

import Image from "next/image";
import FAQManager from "./components/faqManager";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-light-surface">
      {/* header */}
      <section className=" mx-[10px] mt-[max(10px,env(safe-area-inset-top))] relative h-[64vh] w-[calc(100%-20px)] rounded-[32px] py-4 overflow-hidden ">
        {/* background img */}
        <Image src="/images/pexels-haris-philip-all.webp" alt="" fill priority className="object-cover md:object-[center_83%]" />

        {/* header text */}
        <div className="relative h-full w-full flex flex-col justify-end p-4 pb-10 md:p-9" >
          {/* heading */}
          <h1 className="text-light-surface font-semimedium font-inter-tight text-6xl md:text-7xl left-align">
            <span className="md:hidden">FAQs</span>
            <span className="hidden md:inline">Frequently Asked Questions</span>
          </h1>

          {/* subtext */}
          <div className="mt-6 md:mt-[44px] flex flex-col md:flex-row md:items-start md:justify-start gap-8 md:gap-0">
            
            <div className="flex-shrink-0">
              <p className="text-xs font-semireg text-light-surface font-inter-tight">
                Updated: APR 11
              </p>
            </div>

            <div className="md:ml-60">
              <p className="text-light-surface font-inter-tight font-light text-xl max-w-sm leading-tight">
                Everything you need to know, all in one place. Browse clear answers to common questions, so you can plan with confidence and travel with ease.
              </p>
            </div>

          </div>
        </div>
      </section>

      <FAQManager />

      <div className="h-[10vh]" />
    </main>
  );
}
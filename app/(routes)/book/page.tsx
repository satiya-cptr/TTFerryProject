"use client";

import BookingWidget from "@/components/booking/bookingWidget";
import Image from "next/image";

export default function BookingPage() {
  return (
    <main className="relative min-h-screen bg-light-surface">
      <section className="px-[10px] pb-[10px] pt-[max(10px,env(safe-area-inset-top))]">
        <div className="relative z-0 w-full min-h-[calc(100dvh-20px)] rounded-[32px] overflow-hidden">
          
          <Image src="/images/pexels-juniorbastos.webp" alt=" " fill priority className="object-cover object-[center_0%] -z-10"/>

          <div className="relative min-h-[calc(100dvh-20px)] px-4 py-4 md:px-9 md:py-9 flex flex-col">

            <div className="flex-grow" />

            <div className="flex flex-col items-center md:items-start text-center md:text-left mt-42 md:mt-0">
              <h1 className="md:ml-2 text-6xl md:text-7xl text-light-surface font-inter-tight font-semimedium">
                Your journey <br /> awaits
              </h1>

              <div className="hidden md:block w-full h-[1px] bg-light-surface/60 mt-4 mb-4" />

              <p className="mt-4 md:mt-0 md:ml-2 text-lg md:text-xl text-light-surface/80 font-inter-tight font-light leading-tight">
                Choose your route, select your dates, <br className="hidden md:block" /> and book your trip in minutes
              </p>
            </div>

            <div className="h-20 md:h-[160px]" />

            <div className="w-full">
              <BookingWidget />
            </div>
            
          </div>
        </div>
      </section>
    </main>
  );
}
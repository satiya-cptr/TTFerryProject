"use client";

// DEPRECATED

import Image from "next/image";
import BookingWidget from "../booking/bookingWidget";

export default function Hero() {
  return (
    <section className="px-[10px] pb-[10px] pt-[max(10px,env(safe-area-inset-top))]">
      
      {/* Hero Card */}
      <div className=" relative z-0 w-full h-[calc(100dvh-20px)] rounded-[32px] overflow-hidden">
        
        {/* Background image */}
        <Image src="/images/hero.webp" alt="Hero background" fill priority className="object-cover" />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-blue-ink/10" />

        {/* content */}
        <div className="relative h-full px-4 py-4 md:px-9 md:py-9 flex flex-col justify-between">

          <div className="flex flex-1 items-center">
            <div className="text-center md:text-left mx-auto md:mx-0">
              <h1 className=" text-light-surface text-5xl md:text-8xl font-medium leading-[1.05] max-w-[612px]  ">
                Bringing T&amp;T{" "}
                <span className="italic">Even</span>{" "}
                Closer
              </h1>

              <p className=" mt-[12px] text-light-surface text-xs md:text-lg font-light max-w-[524px] ">
                Our mission is to make your inter-island trip unforgettable,
                comfortable, and carefree.
              </p>

            </div>
          </div>

          <BookingWidget />
        </div>
        
      </div>
    </section>
  );
}
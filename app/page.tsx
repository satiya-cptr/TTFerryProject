'use client';


import Image from "next/image";
import BookingWidget from '@/components/booking/bookingWidget';

export default function Home() {

  return (
    <main className="min-h-screen">
      <section className="px-[10px] pb-[10px] pt-[max(10px,env(safe-area-inset-top))]">
        <div className="relative z-0 w-full h-[calc(100dvh-20px)] rounded-[32px] overflow-hidden">
        
          <Image src="/images/pexels-shreyaan.webp" alt="Coastal view of Trinidad and Tobago" fill priority className="object-cover" />

          <div className="relative h-full px-4 py-8 md:px-9 md:py-9 flex flex-col justify-between">
          
            <div className="flex flex-col items-center mt-[15vh] md:mt-[20vh] w-full text-center">
            
              <h1 className="font-inter-tight font-medium tracking-tight text-light-surface text-center">
                <span className="text-[8vw] md:text-[5vw] block leading-none">
                  Bringing T&T closer
                </span>
  
                <span className="text-[8vw] md:text-[5vw] block leading-none pb-2 bg-gradient-to-b from-blue-surface to-light-surface bg-clip-text text-transparent">
                  one crossing at a time
                </span>
              </h1>

              {/* DMS Codes for each terminal */}
              <div className="w-full">
              
                <div className="block md:hidden h-[1px] w-full bg-light-surface/60 mb-2" />

                <div className="flex justify-between w-full font-inter-tight font-light text-sm text-light-surface/80">
                  {/* sca code */}
                  <span>
                    <span className="hidden md:inline">11°10&apos;57&quot;N 60°44&apos;15&quot;W</span>
                    <span className="inline md:hidden">11°10&apos;N 60°44&apos;W</span>
                  </span>
                  {/* pos code */}
                  <span>
                    <span className="hidden md:inline">10°38&apos;53&quot;N 61°30&apos;44&quot;W</span>
                    <span className="inline md:hidden">10°38&apos;N 61°30&apos;W</span>
                  </span>
                </div>

                <div className="hidden md:block h-[1px] w-full bg-light-surface/60 mt-2" />

                <div className="mt-4">
                  <p className="font-inter-tight font-light text-center text-light-surface/80 text-base md:text-lg leading-tight">
                    <span className="hidden md:inline">
                      Our mission is to make every journey feel effortless, <br />
                      from the moment you board to the moment you arrive
                    </span>
                    <span className="inline md:hidden">
                      Making every journey feel effortless, from boarding to arrival
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <BookingWidget />
          
          </div>
        </div>
      </section>

    </main>
  );
}
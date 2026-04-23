"use client";

import FleetTextStacked from "@/components/logos/fleetTextStacked";
import FleetTextFlat from "@/components/logos/fleetTextFlat";
import {VesselSection} from "./components/vesselSection";

export default function FleetPage() {
  return (
    <main className="relative flex flex-col gap-4">
      <header className="mx-[10px] mt-[max(10px,env(safe-area-inset-top))] relative h-[40vh] lg:h-[52vh] w-[calc(100%-20px)] rounded-[32px] overflow-hidden bg-gradient-to-b from-blue-surface via-[#BED9ED] to-light-surface flex flex-col justify-end [clip-path:inset(0_round_32px)]">
        <h1 className="sr-only">Meet the Fleet</h1>
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-x-[10px] top-[max(100px,env(safe-area-inset-top))] md:top-[max(10px,env(safe-area-inset-top))] h-[25vh] lg:h-[48vh] flex flex-col justify-end px-2 lg:px-8 pb-6 lg:pb-10">
              <div className="w-full">
                <FleetTextStacked className="w-full h-auto text-light-surface block  md:hidden" />
                <FleetTextFlat className="w-full h-auto text-light-surface hidden md:block" />
              </div>
          </div>
        </div>
      </header>

      <div className="-mt-12 md:-mt-44 lg:-mt-12 flex flex-col gap-8  mx-[10px] px-10 mb-18">
        <VesselSection 
          imageSrc="/images/vessels/buccooreef.webp"
          altText="Buccoo reef ferry at sea"
          headerText="The Buccoo Reef"
          bodyParagraphs={[
            "The newest vessel in the fleet, Buccoo Reef was built by Incat Tasmania for modern inter-island travel.",
            "This 100m wave-piercing catamaran carries up to 1,000 passengers and 240 vehicles, combining high capacity with efficient design.",
            "With crossing times of just under 3.5 hours, it’s built to move more people, more comfortably, in less time. ",
          ]}
          textPosition="left" 
          objectCenter="64% center"
        />

        <VesselSection 
          imageSrc="/images/vessels/aptjames.webp"
          altText="APT James ferry at sea"
          headerText="The A.P.T. James"
          bodyParagraphs={[
            "Built in 2020 by Austal Vietnam, A.P.T. James represents a newer generation of high-speed ferry design.",
            "It carries close to 1,000 passengers and 222 vehicles, balancing speed with everyday reliability.",
            "As the first vessel constructed at Austal’s Vietnam shipyard, it marked an important step in the fleet’s expansion.",
          ]}
          textPosition="right" 
          objectCenter="22% center"
        />

        <VesselSection 
          imageSrc="/images/vessels/ttspirit.webp"
          altText="The T&T Spirit ferry at sea"
          headerText="The T&T Spririt"
          bodyParagraphs={[
            "Serving since 2007, T&T Spirit is the longest-running vessel in the current fleet.",
            "This 98m Incat wave-piercing catamaran carries up to 865 passengers and 180 vehicles across the sea bridge.",
            "Originally built for military use and later converted for passenger service, it remains a dependable part of the fleet.",
          ]}
          textPosition="left" 
          objectCenter="center"
        />

        <VesselSection 
          imageSrc="/images/vessels/galleonspassage.webp"
          altText="The Galleons Passage ferry at sea"
          headerText="The Galleons Passage"
          bodyParagraphs={[
            "Commissioned in 2018, the Galleons Passage provides a more compact and flexible inter-island service.",
            "Built to Lloyd’s Special Service Craft standards, this RoRo catamaran is capable of carrying up to 400 passengers and 60 vehicles.",
          ]}
          textPosition="right" 
          objectCenter="80% center"
        />
      </div>
    </main>
  );
}
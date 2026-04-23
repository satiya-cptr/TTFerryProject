"use client";

// componet to nav and manage the faq tabs 

import { FAQ_CONTENT } from "@/lib/data/faqData";
import { useState } from "react";
import FAQTabLayout from "./faqTabLayout";

export default function FAQManager() {
  const [activeTabId, setActiveTabId] = useState(FAQ_CONTENT[0].id);

  return (
    <div className="w-full">
      {/* sticky tab nav */}
      <div className=" sticky top-0 z-[20] bg-light-surface pt-[max(10px,env(safe-area-inset-top))]  ">
        <nav className=" mt-[60px] md:mt-[72px] mx-[10px] md:mx-[46px] relative ">
          <div className=" flex items-end overflow-x-auto scrollbar-hide gap-5 md:gap-12 border-b border-blue-ink/20 ">
            {FAQ_CONTENT.map((tab) => {
              const isActive = activeTabId === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={` relative transition-all hover:text-blue-ink duration-200 pb-1 md:pb-3 px-2 font-inter-tight text-left whitespace-nowrap after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0
                    ${isActive 
                      ? "text-blue-ink font-semimedium after:h-0.5 md:after:h-1 after:bg-blue-ink" 
                      : "text-blue-ink/40 font-normal text-base md:text-4xl after:h-0"}
                    text-base md:text-4xl
                    ${isActive ? "text-xl md:text-4xl" : "text-base md:text-4xl"}
                  `}
                >
                  {tab.tabTitle}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* active tab content */}
      <div className="mx-[10px] md:mx-[46px] mt-14">
        {FAQ_CONTENT.map((tab) => {
          if (tab.id === activeTabId) {
            return <FAQTabLayout key={tab.id} tabData={tab} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
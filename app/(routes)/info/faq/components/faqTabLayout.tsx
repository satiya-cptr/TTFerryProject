"use client";

// component for the layout of each tab

import { FAQTab } from "@/lib/data/faqData";
import { useState, useEffect } from "react";
import FAQSection from "./faqSection";
import { motion } from "motion/react";


interface FAQTabLayoutProps {
  tabData: FAQTab;
}

export default function FAQTabLayout({ tabData }: FAQTabLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".faq-scroll-section");
      const scrollPosition = window.scrollY + (window.innerHeight * 0.3);

      sections.forEach((section, index) => {
        const top = (section as HTMLElement).offsetTop;
        const height = (section as HTMLElement).offsetHeight;

        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveIndex(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tabData]);

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 lg:gap-[16px]">
      
      {/* chapters thingy + indicator, lg only */}
      <aside className="hidden lg:block lg:col-start-2 lg:col-end-4 relative">
        <div className="sticky top-[180px] self-start">
          <div className="relative">
            <motion.div 
              initial={false}
              animate={{ 
                y: activeIndex * 40 + 17,
                x: -14 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                restDelta: 0.001
              }}
              className="absolute top-0 left-0 w-[6px] h-[6px] bg-blue-ink rounded-[2px] z-10"
              style={{ rotate: 45 }} 
            />

            <ul className="flex flex-col">
              {tabData.sections.map((section, index) => {
                const isActive = activeIndex === index;
                return (
                  <li key={section.id} className="h-[40px] flex items-center">
                    <a href={`#${section.id}`} className={`font-inter-tight text-base hover:text-blue-ink transition-colors duration-300
                      ${isActive ? "font-semibold text-blue-ink" : "font-normal text-blue-ink/40"}`}
                    >
                      {section.sectionTitle}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>

      {/* tab sections */}
      <div className="col-span-4 md:col-span-8 lg:col-start-5 lg:col-end-12 flex flex-col gap-12 lg:gap-20">
        {tabData.sections.map((section) => (
          <div key={section.id} className="faq-scroll-section">
            <FAQSection section={section} />
          </div>
        ))}
      </div>
    </div>
  );
}
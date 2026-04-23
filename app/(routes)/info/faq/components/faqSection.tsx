"use client";

// component for the individual sections in a tab

import { Accordion } from "@heroui/react";
import { FAQSection as FAQSectionType } from "@/lib/data/faqData";

interface FAQSectionProps {
  section: FAQSectionType;
}

export default function FAQSection({ section }: FAQSectionProps) {
  return (
    <div id={section.id} className="scroll-mt-40 mb-20">
      
      {/* section header */}
      <h2 className="font-inter-tight font-medium text-blue-ink text-3xl md:text-5xl mb-10 md:mb-12">
        {section.sectionTitle}
      </h2>

      {/* questions */}
      <Accordion className="w-full px-0 border-b border-blue-ink/10 py-0">
        {section.questions.map((q) => (
          <Accordion.Item key={q.id} className="border-b border-blue-ink/10 px-0">
            <Accordion.Heading className="px-0 hover:bg-blue-ink/5 rounded-xl transition-colors">
              <Accordion.Trigger className="px-2 py-3.5 font-inter-tight font-semimedium text-blue-ink text-lg md:text-xl text-left w-full  ">
                {q.question}
                <Accordion.Indicator className="text-blue-ink px-0" />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="pt-5 px-2 font-inter-tight font-light text-base md:text-base text-blue-ink/80 text-left">
                {q.answer}
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import ScheduleText from "@/components/logos/scheduleText";
import WeeklySchedule from "@/components/schedule/weeklySchedule";
import MonthlySchedule from "@/components/schedule/monthlySchedule";
import MonthlyScheduleWidget from "@/components/schedule/newMonthlySchedule";

export default function SchedulePage() {
  const [scheduleView, setScheduleView] = useState<'week' | 'month'>('month');

  useEffect(() => {
    if (window.innerWidth < 768) {
      setScheduleView('week');
    }
  }, []);

  return (
    <main className="flex flex-col gap-4">
      {/* header */}
      <header className="mx-[10px] mt-[max(10px,env(safe-area-inset-top))] relative h-[20vh] lg:h-[48vh] w-[calc(100%-20px)] rounded-[32px] overflow-hidden bg-gradient-to-b from-blue-surface via-[#BED9ED] to-light-surface flex flex-col justify-end">
        <h1 className="sr-only">The Schedule</h1>
        <div className="relative w-full flex flex-col items-start px-2 lg:px-8">
          <div className="flex-shrink-0 ml-2.5 mb-2">
            <p className="text-xs font-normal text-light-surface font-inter-tight tracking-wider opacity-80">
              Updated: APR 21
            </p>
          </div>

          <div className="w-full">
            <ScheduleText className="w-full h-auto text-light-surface block" />
          </div>
        </div>
      </header>

      <section className="mx-[10px] flex flex-col mb-6">
      {/* Top Divider */}
      <div className="w-full h-[1px] bg-blue-ink/20" />

      {/* Controls Row */}
      <div className="flex items-center justify-between w-full py-2 px-2 md:px-9">
        <div className="flex items-center">
          <span className="text-sm font-medium text-blue-ink/60">View:</span>
          
          <div className="flex items-center ml-4 gap-2">
            {/* Monthly Button */}
            <button
              onClick={() => setScheduleView('month')}
              className={`px-4 py-1 rounded-full border transition-all duration-200 flex items-center group ${
                scheduleView === "month"
                  ? "border-blue-ink bg-blue-ink text-light-surface"
                  : "border-blue-ink/20 bg-light-surface text-blue-ink/60 hover:bg-blue-ink/5"
              }`}
            >
              <span className="text-sm font-inter-tight">Monthly</span>
            </button>

            {/* Weekly Button */}
            <button
              onClick={() => setScheduleView('week')}
              className={`px-4 py-1 rounded-full border transition-all duration-200 flex items-center group ${
                scheduleView === "week"
                  ? "border-blue-ink bg-blue-ink text-light-surface"
                  : "border-blue-ink/20 bg-light-surface text-blue-ink/60 hover:bg-blue-ink/5"
              }`}
            >
              <span className="text-sm font-inter-tight">Weekly</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Divider */}
      <div className="w-full h-[1px] bg-blue-ink/20" />
    </section>

      <section className="mx-[10px] mb-24">
        {scheduleView === 'week' ? <WeeklySchedule /> : <MonthlyScheduleWidget />}
      </section>
    </main>
  );
}
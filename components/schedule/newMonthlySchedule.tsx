"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@heroui/react";
import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Sailing } from '@/lib/types/sailingTypes';
import { Vessel } from '@/lib/types/vesselTypes';
import SailingCard from './sailingCard';

export default function MonthlyScheduleWidget() {
  const [selectedDate, setSelectedDate] = useState<CalendarDate>(today(getLocalTimeZone()));
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);

  // calender date to JS Date
  const toJSDate = (cDate: CalendarDate) => new Date(cDate.year, cDate.month - 1, cDate.day);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const vesselsSnap = await getDocs(collection(db, 'vessels'));
      setVessels(vesselsSnap.docs.map(doc => doc.data() as Vessel));

      const sailingsSnap = await getDocs(collection(db, 'sailings'));
      setSailings(sailingsSnap.docs.map(doc => doc.data() as Sailing));
      setLoading(false);
    };
    fetchData();
  }, []);

  // availability 
  const getDayStatus = (date: CalendarDate) => {
    const jsDate = toJSDate(date);
    const daySailings = sailings.filter(s => {
      const sDate = s.departureTime.toDate();
      return sDate.toDateString() === jsDate.toDateString();
    });

    if (daySailings.length === 0) return null;

    let totalCapacity = 0;
    daySailings.forEach(s => {
      const v = vessels.find(v => v.callsign === s.vesselCallsign);
      if (v) {
        const pass = (s.availableCapacity.premium + s.availableCapacity.economy) / (v.passengerCapacity.premium + v.passengerCapacity.economy);
        const veh = s.availableCapacity.laneMeters / v.vehicleCapacity.laneMeters;
        totalCapacity += Math.min(pass, veh);
      }
    });

    const avg = totalCapacity / daySailings.length;
    if (avg > 0.5) return 'high';
    if (avg > 0.2) return 'medium';
    return 'low';
  };

  // get selected days sailings
  const selectedDaySailings = selectedDate 
    ? sailings.filter(s => s.departureTime.toDate().toDateString() === toJSDate(selectedDate).toDateString())
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 font-inter-tight">
      <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
    
        {/* calendar */}
        <div className="col-span-4 md:col-start-1 md:col-span-3 lg:col-start-1 lg:col-span-3 mb-4 md:mb-0">
          <div className="md:sticky top-16 p-6 bg-light-surface rounded-[32px] md:rounded-[24px] border border-blue-ink/10 hover:shadow-[1px_2px_18px_0px_rgba(8,23,50,0.05)] transition-all duration-200">
            <Calendar 
              aria-label="Sailing Schedule"
              value={selectedDate}
              onChange={setSelectedDate}
              minValue={today(getLocalTimeZone())}
              className="w-full shadow-none" 
            >
              <Calendar.Header>
                <Calendar.Heading className="text-blue-ink" />
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>
                  {(date) => {
                    const status = getDayStatus(date);
                    return (
                      <Calendar.Cell 
                        className={(state) => {
                          const isPast = date.compare(today(getLocalTimeZone())) < 0;

                          return `
                            ${state.isSelected ? 'text-light-surface' : 'text-blue-ink'}
                            ${state.isUnavailable ? 'text-blue-ink opacity-10' : ''}
                            ${state.isInvalid ? 'opacity-10' : ''}
                            ${state.isOutsideMonth ? '!opacity-10 pointer-events-none' : ''}
                            ${isPast ? '!opacity-10 !pointer-events-none !before:hidden !after:hidden ![background-image:none]' : ''}
                          `;
                        }}
                        date={date}>
                        {({formattedDate}) => (
                          <>
                            {formattedDate}
                            {status && (
                              <Calendar.CellIndicator 
                                className={
                                  status === 'high' ? "bg-green-500" :
                                  status === 'medium' ? "bg-yellow-500" : "bg-red-500"
                                }
                              />
                            )}
                          </>
                        )}
                      </Calendar.Cell>
                    );
                  }}
                </Calendar.GridBody>
              </Calendar.Grid>
            </Calendar>
          </div>

          <div className="hidden flex flex-col gap-2 text-center mt-4">
            <div className="flex items-center justify-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-green-500" /> High 
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-yellow-500" /> Mid 
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-red-500" /> Low 
              </span>
            </div>
          </div>

        </div>

        {/* sailing cards */}
        <div className="col-span-4 md:col-start-4 md:col-span-5 lg:col-start-4 lg:col-span-9 flex flex-col gap-4">
          {selectedDate ? (
            <>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semimedium text-blue-ink">
                  {selectedDate.toDate(getLocalTimeZone()).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <span className="text-xs font-medium text-blue-ink/40">
                  {selectedDaySailings.length} Sailing{selectedDaySailings.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="w-full h-[1px] bg-blue-ink/20 mt-1 mb-3" />
            </div>
              
          
              {selectedDaySailings.length > 0 ? (
                selectedDaySailings.map(sailing => (
                  <SailingCard 
                    key={sailing.id} 
                    sailing={sailing} 
                    vessel={vessels.find(v => v.callsign === sailing.vesselCallsign)} 
                  />
                ))
              ) : (
                <div className="py-12 border-2 border-dashed border-blue-ink/10 rounded-[32px] flex items-center justify-center">
                  <p className="text-sm text-blue-ink/40">No sailings scheduled for this date.</p>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 flex items-center justify-center">
              <p className="text-sm text-blue-ink/40">Select a date to view available sailings.</p>
            </div>
          )}
        </div>
    
      </div>
    </div>
  );
}
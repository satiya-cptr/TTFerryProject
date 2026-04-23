'use client';

// the weekly schedule 
// TODO: use new design and deprecate

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Sailing } from '@/lib/types/sailingTypes';
import { Vessel } from '@/lib/types/vesselTypes';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import SailingCard from './sailingCard';

export default function WeeklySchedule() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);

  // get start of the week, which is Sunday
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  // get an array of 7 days from the current week start date 
  function getWeekDays(): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }

  // load the weeks vessels and sailings
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // load vessels
        const vesselsSnapshot = await getDocs(collection(db, 'vessels'));
        const vesselsData = vesselsSnapshot.docs.map(doc => doc.data() as Vessel);
        setVessels(vesselsData);

        // load sailings
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const sailingsQuery = query(
          collection(db, 'sailings'),
          where('departureTime', '>=', Timestamp.fromDate(currentWeekStart)),
          where('departureTime', '<', Timestamp.fromDate(weekEnd))
        );

        const sailingsSnapshot = await getDocs(sailingsQuery);
        const sailingsData = sailingsSnapshot.docs.map(doc => doc.data() as Sailing);
        
        // sort by departure time
        sailingsData.sort((a, b) => a.departureTime.toMillis() - b.departureTime.toMillis());
        
        setSailings(sailingsData);
      } catch (err) {
        console.error('Error loading schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentWeekStart]);

  // to navigate weeks
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  };

  // filter sailings by selected date
  const getSailingsForDate = (date: Date): Sailing[] => {
    return sailings.filter(sailing => {
      const sailingDate = sailing.departureTime.toDate();
      return (
        sailingDate.getFullYear() === date.getFullYear() &&
        sailingDate.getMonth() === date.getMonth() &&
        sailingDate.getDate() === date.getDate()
      );
    });
  };

  const weekDays = getWeekDays();
  const selectedDaySailings = getSailingsForDate(selectedDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* header with week days and nav */}
      <div className="flex items-center gap-4 mb-6">
        {/* prev button*/}
        <button
          onClick={goToPreviousWeek}
          className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous week"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
        </button>

        {/* the week days */}
        <div className="flex-1 flex justify-between">
          {weekDays.map((day, index) => {
            const selected = isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`
                  flex-1 px-2 py-4 text-center transition-all relative
                  hover:bg-gray-50
                  ${selected ? 'border-b-4 border-blue-600' : ''}
                `}
              >
                <div className={`text-sm font-semibold ${selected ? 'text-blue-600' : 'text-gray-600'}`}>
                  {formatDay(day)}
                </div>
                <div className={`text-lg font-bold ${selected ? 'text-blue-600' : 'text-gray-900'}`}>
                  {formatDate(day)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getSailingsForDate(day).length} sailing{getSailingsForDate(day).length !== 1 ? 's' : ''}
                </div>
                {today && !selected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* next buttton */}
        <button
          onClick={goToNextWeek}
          className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next week"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
        </button>
      </div>

      {/* list of sailing cards */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Sailings for {formatDay(selectedDate)} {formatDate(selectedDate)}
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading sailings...</div>
        ) : selectedDaySailings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No sailings scheduled for this day</div>
        ) : (
          <div className="space-y-3">
            {selectedDaySailings.map(sailing => {
              const vessel = vessels.find(v => v.callsign === sailing.vesselCallsign);
    
              return (
                <SailingCard 
                  key={sailing.id}
                  sailing={sailing}
                  vessel={vessel}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
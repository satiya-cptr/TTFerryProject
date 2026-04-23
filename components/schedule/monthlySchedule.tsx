'use client';

// DEPRECATED

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Sailing } from '@/lib/types/sailingTypes';
import { Vessel } from '@/lib/types/vesselTypes';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import SailingCard from './sailingCard';

export default function MonthlySchedule() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);

  // get first and last day of month
  function getMonthBounds(date: Date): { start: Date; end: Date } {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  }

  // get calendar days
  function getCalendarDays(): Date[] {
    const { start, end } = getMonthBounds(currentMonth);
    const days: Date[] = [];

    // add padding days from previous month
    const startDay = start.getDay(); // 0 = Sunday
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(start);
      day.setDate(day.getDate() - (i + 1));
      days.push(day);
    }

    // add days of current month
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    // add padding days from next month
    const endDay = end.getDay();
    for (let i = 1; i < 7 - endDay; i++) {
      const day = new Date(end);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days;
  }

  // load current month data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // oad vessels
        const vesselsSnapshot = await getDocs(collection(db, 'vessels'));
        const vesselsData = vesselsSnapshot.docs.map(doc => doc.data() as Vessel);
        setVessels(vesselsData);

        // oad sailings for the month with some extra days
        const { start, end } = getMonthBounds(currentMonth);
        const monthEnd = new Date(end);
        monthEnd.setDate(monthEnd.getDate() + 7);

        const sailingsQuery = query(
          collection(db, 'sailings'),
          where('departureTime', '>=', Timestamp.fromDate(start)),
          where('departureTime', '<', Timestamp.fromDate(monthEnd))
        );

        const sailingsSnapshot = await getDocs(sailingsQuery);
        const sailingsData = sailingsSnapshot.docs.map(doc => doc.data() as Sailing);
        
        setSailings(sailingsData);
      } catch (err) {
        console.error('Error loading schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentMonth]);

  // Get sailings for a specific date
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

  // Calculate availability level for a day
  const getAvailabilityLevel = (date: Date): 'none' | 'high' | 'medium' | 'low' => {
    const daySailings = getSailingsForDate(date);
    if (daySailings.length === 0) return 'none';

    // Calculate average availability across all sailings
    let totalCapacityPercent = 0;
    daySailings.forEach(sailing => {
      const vessel = vessels.find(v => v.callsign === sailing.vesselCallsign);
      if (vessel) {
        const passengerPercent = 
          (sailing.availableCapacity.premium + sailing.availableCapacity.economy) /
          (vessel.passengerCapacity.premium + vessel.passengerCapacity.economy);
        
        const vehiclePercent = 
          sailing.availableCapacity.laneMeters / vessel.vehicleCapacity.laneMeters;
        
        // Use the lower of the two (most constrained)
        totalCapacityPercent += Math.min(passengerPercent, vehiclePercent);
      }
    });

    const avgCapacity = totalCapacityPercent / daySailings.length;

    // Determine level
    if (avgCapacity > 0.5) return 'high';     
    if (avgCapacity > 0.2) return 'medium';    
    return 'low';                          
  };

  // Get color classes for availability
  const getAvailabilityColor = (level: 'none' | 'high' | 'medium' | 'low'): string => {
    switch (level) {
      case 'none': return 'bg-gray-100 text-gray-400';
      case 'high': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 hover:bg-red-200';
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(null);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const formatMonthYear = () => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const calendarDays = getCalendarDays();
  const selectedDaySailings = selectedDate ? getSailingsForDate(selectedDate) : [];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold">{formatMonthYear()}</h2>
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:underline mt-1"
          >
            Go to today
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
        </button>
      </div>

      {/* calendar grid */}
      <div className="mb-6">
        {/* day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const daySailings = getSailingsForDate(day);
            const availabilityLevel = getAvailabilityLevel(day);
            const availabilityColor = getAvailabilityColor(availabilityLevel);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);
            const currentMonthDay = isCurrentMonth(day);
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <button
                key={index}
                onClick={() => !isPast && daySailings.length > 0 ? setSelectedDate(day) : null}
                disabled={isPast || daySailings.length === 0}
                className={`
                  aspect-square p-2 rounded-lg transition-all
                  ${isPast ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60' : availabilityColor}
                  ${selected ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
                  ${!currentMonthDay ? 'opacity-30' : ''}
                  ${isPast || daySailings.length === 0 ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`
                    text-lg font-semibold
                    ${today && !selected ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center' : ''}
                  `}>
                    {day.getDate()}
                  </span>
                  {daySailings.length > 0 && (
                    <span className="text-xs mt-1">
                      {daySailings.length} sailing{daySailings.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* legend */}
      <div className="flex items-center justify-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
          <span>High Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
          <span>Medium Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
          <span>Low Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
          <span>No Sailings</span>
        </div>
      </div>

      {/* selected day's sailings */}
      {selectedDate && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              Sailings for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear selection
            </button>
          </div>

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
      )}
    </div>
  );
}
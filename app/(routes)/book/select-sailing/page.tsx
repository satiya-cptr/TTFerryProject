"use client";

// This page allowes users to choose from available sailings based on their search criteria, 
// and also select their ticket class (economy or premium) for each sailing. 
// It then saves these selections and moves on to the passenger details page.

// kinda chunky - return starts at ~224, sailing card moved to components/booking/sailingCard 

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { Sailing } from "@/lib/types/sailingTypes";
import { Vessel } from "@/lib/types/vesselTypes";
import { VEHICLE_TYPES } from "@/lib/types/vehicleTypes";
import { PASSENGER_TYPES } from "@/lib/types/passengerTypes";
import { parseDate } from "@internationalized/date";
import SailingCard from "@/components/booking/sailingCard";

export default function SelectSailingPage() {
  const router = useRouter();
  
  const [searchCriteria, setSearchCriteria] = useState<any>(null);
  const [outboundSailings, setOutboundSailings] = useState<Sailing[]>([]);
  const [returnSailings, setReturnSailings] = useState<Sailing[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);

  // track selected sailings and ticket classes
  const [selectedOutbound, setSelectedOutbound] = useState<{
    sailing: Sailing | null;
    ticketClass: "economy" | "premium" | null;
  }>({ sailing: null, ticketClass: null });

  const [selectedReturn, setSelectedReturn] = useState<{
    sailing: Sailing | null;
    ticketClass: "economy" | "premium" | null;
  }>({ sailing: null, ticketClass: null });

  useEffect(() => {
    loadSearchAndSailings();
  }, []);

  const filterByAvailability = (sailings: Sailing[], criteria: any) => {
    // calculate number of seats needed (infants and pets don't need seats)
    let seatsNeeded = 0;
    Object.entries(criteria.passengers as Record<string, number>).forEach(([typeId, count]) => {
      const passengerType = PASSENGER_TYPES.find(t => t.id === typeId);
      if (passengerType && passengerType.requiresSeat) {
        seatsNeeded += count;
      }
    });
  
    // calculate vehicle spae needed based on vehicle type lane meters 
    let totalLaneMetersNeeded = 0;
    Object.entries(criteria.vehicles as Record<string, number>).forEach(([vehicleId, count]) => {
      if (count > 0) {
        const vehicleType = VEHICLE_TYPES.find(v => v.id === vehicleId);
        if (vehicleType) {
          totalLaneMetersNeeded += vehicleType.laneMeters * count;
        }
      }
    });

    return sailings.filter(sailing => {
      const totalPassengerCapacity = sailing.availableCapacity.premium + sailing.availableCapacity.economy;
      const hasEnoughSeats = totalPassengerCapacity >= seatsNeeded;
      const hasEnoughVehicleSpace = sailing.availableCapacity.laneMeters >= totalLaneMetersNeeded;
    
      return hasEnoughSeats && hasEnoughVehicleSpace;
    });
  };


  const loadSearchAndSailings = async () => {
    try {
      const stored = sessionStorage.getItem("bookingSearch");
      
      if (!stored) {
        router.push("/");
        return;
      }

      const criteria = JSON.parse(stored);
      setSearchCriteria(criteria);

      // load all vessels 
      const vesselsSnapshot = await getDocs(collection(db, "vessels"));
      const vesselsData = vesselsSnapshot.docs.map(doc => doc.data() as Vessel);
      setVessels(vesselsData);

      // parse outbound date
      const outboundDate = parseDate(criteria.outboundDate);
      const outboundStart = new Date(outboundDate.year, outboundDate.month - 1, outboundDate.day);
      outboundStart.setHours(0, 0, 0, 0);
      
      const outboundEnd = new Date(outboundStart);
      outboundEnd.setHours(23, 59, 59, 999);

      // query outbound sailings 
      const outboundQuery = query(
        collection(db, "sailings"),
        where("departurePort", "==", criteria.route.from),
        where("arrivalPort", "==", criteria.route.to),
        where("departureTime", ">=", Timestamp.fromDate(outboundStart)),
        where("departureTime", "<=", Timestamp.fromDate(outboundEnd)),
        where("status", "==", "scheduled")
      );

      const outboundSnapshot = await getDocs(outboundQuery);
      let outboundSailingsData = outboundSnapshot.docs.map(doc => doc.data() as Sailing);

      // filter and sort the dailings
      outboundSailingsData = filterByAvailability(outboundSailingsData, criteria);
      outboundSailingsData.sort((a, b) => a.departureTime.toMillis() - b.departureTime.toMillis());
      setOutboundSailings(outboundSailingsData);

      // do the same for round trips, if they've selected that
      if (criteria.tripType === "round" && criteria.returnDate) {
        const returnDate = parseDate(criteria.returnDate);
        const returnStart = new Date(returnDate.year, returnDate.month - 1, returnDate.day);
        returnStart.setHours(0, 0, 0, 0);
        
        const returnEnd = new Date(returnStart);
        returnEnd.setHours(23, 59, 59, 999);

        // query return sailings, using the reserved route
        const returnQuery = query(
          collection(db, "sailings"),
          where("departurePort", "==", criteria.route.to),
          where("arrivalPort", "==", criteria.route.from),
          where("departureTime", ">=", Timestamp.fromDate(returnStart)),
          where("departureTime", "<=", Timestamp.fromDate(returnEnd)),
          where("status", "==", "scheduled")
        );

        const returnSnapshot = await getDocs(returnQuery);
        let returnSailingsData = returnSnapshot.docs.map(doc => doc.data() as Sailing);

        // filter and sort results 
        returnSailingsData = filterByAvailability(returnSailingsData, criteria);
        returnSailingsData.sort((a, b) => a.departureTime.toMillis() - b.departureTime.toMillis());
        setReturnSailings(returnSailingsData);
      }

    } catch (error) {
      console.error("Error loading sailings:", error);
      alert("Error loading sailings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // validate selections
    if (!selectedOutbound.sailing || !selectedOutbound.ticketClass) {
      alert("Please select an outbound sailing and ticket class");
      return;
    }

    if (searchCriteria.tripType === "round") {
      if (!selectedReturn.sailing || !selectedReturn.ticketClass) {
        alert("Please select a return sailing and ticket class");
        return;
      }
    }

    // save selections to sessionStorage
    const selections = {
      outbound: {
        sailing: selectedOutbound.sailing,
        ticketClass: selectedOutbound.ticketClass,
      },
      ...(searchCriteria.tripType === "round" && {
        return: {
          sailing: selectedReturn.sailing,
          ticketClass: selectedReturn.ticketClass,
        }
      })
    };

    // stringify since session storage only stores text
    sessionStorage.setItem("selectedSailings", JSON.stringify(selections));
    
    // go to passenger details
    router.push("/book/passenger-details");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-lg text-blue-ink font-medium">Searching for available sailings...</p>
      </div>
    );
  }

  if (!searchCriteria) {
    return null;
  }

  const totalPassengers = Object.values(searchCriteria.passengers as Record<string, number>)
    .reduce((sum: number, count) => sum + count, 0);
  
  const totalVehicles = Object.values(searchCriteria.vehicles as Record<string, number>)
    .reduce((sum: number, count) => sum + count, 0);

  const seatsNeeded = Object.entries(searchCriteria.passengers as Record<string, number>)
    .reduce((total, [typeId, count]) => {
      const passengerType = PASSENGER_TYPES.find(t => t.id === typeId);
      if (passengerType && passengerType.requiresSeat) {
        return total + count;
      }
      return total;
    }, 0);


  // the actual UI starts here
  return (
    <div className="min-h-screen bg-light-surface p-3 md:p-8 mt-20 md:mt-16 font-inter-tight">
      <div className="max-w-5xl mx-auto">
        
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-ink mb-4">Select Your Sailing</h1>
          
          <div className="bg-light-surface rounded-3xl hover:shadow-sm transition-all duration-200 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 text-blue-ink">
              <div>
                <p className="text-xs uppercase font-bold text-blue-ink/60 mb-2">Route</p>
                <p className="text-base md:text-lg font-bold">
                  {searchCriteria.route.from === "POS" ? "Port of Spain" : "Scarborough"} 
                  {" → "}
                  {searchCriteria.route.to === "TBG" ? "Scarborough" : "Port of Spain"}
                </p>
              </div>
    
              <div className="flex gap-10 md:gap-10">
                <div>
                  <p className="text-xs uppercase font-bold text-blue-ink/60 mb-2">Passengers</p>
                  <p className="text-base md:text-lg font-bold">{totalPassengers}</p>
                </div>
      
                {totalVehicles > 0 && (
                  <div>
                    <p className="text-xs uppercase font-bold text-blue-ink/60 mb-2">Vehicles</p>
                    <p className="text-base md:text-lg font-bold">{totalVehicles}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push("/book")}
                className="w-auto  md:ml-auto px-4 py-3 md:py-2 text-md md:text-sm font-medium text-blue-ink border border-blue-ink/10 rounded-3xl bg-blue-ink/5 hover:bg-blue-ink/10 transition-colors"
              >
                Modify Search
              </button>
            </div>
          </div>
        </div>

        {/* outbound sailings */}
        <div className="mb-12">
          <h2 className="text-lg md:text-2xl font-bold text-blue-ink mb-4">
            Outbound • {parseDate(searchCriteria.outboundDate).toDate("AST").toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric' 
            })}
          </h2>
          
          {outboundSailings.length === 0 ? (
            <div className="bg-light-surface rounded-2xl p-8 text-center">
              <p className="text-blue-ink/60">No outbound sailings available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outboundSailings.map(sailing => (
                <SailingCard
                  key={sailing.id}
                  sailing={sailing}
                  vessel={vessels.find(v => v.callsign === sailing.vesselCallsign)}
                  isSelected={selectedOutbound.sailing?.id === sailing.id}
                  selectedClass={selectedOutbound.sailing?.id === sailing.id ? selectedOutbound.ticketClass : null}
                  onSelect={(ticketClass) => {
                    setSelectedOutbound({ sailing, ticketClass });
                  }}
                  seatsNeeded={seatsNeeded}
                />
              ))}
            </div>
          )}
        </div>

        {/* return sailings, only shown for round trips */}
        {searchCriteria.tripType === "round" && (
          <div className="mb-12">
            <h2 className="text-lg md:text-2xl font-bold text-blue-ink mb-4">
              Return • {parseDate(searchCriteria.returnDate).toDate("AST").toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              })}
            </h2>
            
            {returnSailings.length === 0 ? (
              <div className="bg-light-surface rounded-2xl p-8 text-center">
                <p className="text-blue-ink/60">No return sailings available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {returnSailings.map(sailing => (
                  <SailingCard
                    key={sailing.id}
                    sailing={sailing}
                    vessel={vessels.find(v => v.callsign === sailing.vesselCallsign)}
                    isSelected={selectedReturn.sailing?.id === sailing.id}
                    selectedClass={selectedReturn.sailing?.id === sailing.id ? selectedReturn.ticketClass : null}
                    onSelect={(ticketClass) => {
                      setSelectedReturn({ sailing, ticketClass });
                    }}
                    seatsNeeded={seatsNeeded}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* continue cutton */}
        {((outboundSailings.length > 0 && searchCriteria.tripType === "oneway") ||
          (outboundSailings.length > 0 && returnSailings.length > 0 && searchCriteria.tripType === "round")) && (
          <div className="sticky bottom-6 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={
                !selectedOutbound.sailing || 
                !selectedOutbound.ticketClass ||
                (searchCriteria.tripType === "round" && (!selectedReturn.sailing || !selectedReturn.ticketClass))
              }
              className="px-6 md:px-8 py-2 md:py-4 bg-blue-ink text-light-surface rounded-full font-bold text-lg hover:bg-blue-ink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              Continue <span className="hidden md:inline">to Passenger Details</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
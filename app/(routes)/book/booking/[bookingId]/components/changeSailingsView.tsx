import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { parseDate } from "@internationalized/date";
import SailingCard from "@/components/booking/sailingCard";
import { PASSENGER_TYPES } from "@/lib/types/passengerTypes";
import { VEHICLE_TYPES } from "@/lib/types/vehicleTypes";
import { Button, Modal } from "@heroui/react";

function ChangeSailingsView({ booking, onBack, onSave }: any) {
  const [changeType, setChangeType] = useState<"both" | "outbound" | "return" | null>(null);
  const [currentDate, setCurrentDate] = useState(booking.outbound.departureTime.toDate());
  const [sailings, setSailings] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedOutbound, setSelectedOutbound] = useState<any>(null);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  // Calculate seats needed
  const seatsNeeded = booking.passengers.reduce((total: number, p: any) => {
    const passengerType = PASSENGER_TYPES.find(t => t.id === p.type);
    return total + (passengerType?.requiresSeat ? 1 : 0);
  }, 0);

  // Calculate lane meters needed
  const laneMetersNeeded = booking.vehicles.reduce((total: number, v: any) => {
    const vehicleType = VEHICLE_TYPES.find(t => t.id === v.type);
    return total + (vehicleType?.laneMeters || 0);
  }, 0);

  useEffect(() => {
    if (changeType) {
      loadSailings();
    }
  }, [changeType, currentDate]);

  const loadSailings = async () => {
    setLoading(true);
    try {
      // Load vessels
      const vesselsSnapshot = await getDocs(collection(db, "vessels"));
      const vesselsData = vesselsSnapshot.docs.map(doc => doc.data());
      setVessels(vesselsData);

      // Query sailings for the selected date
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      const sailingsQuery = query(
        collection(db, "sailings"),
        where("departurePort", "==", booking.route.from),
        where("arrivalPort", "==", booking.route.to),
        where("departureTime", ">=", Timestamp.fromDate(startOfDay)),
        where("departureTime", "<=", Timestamp.fromDate(endOfDay)),
        where("status", "==", "scheduled")
      );

      const sailingsSnapshot = await getDocs(sailingsQuery);
      let sailingsData = sailingsSnapshot.docs.map(doc => doc.data());

      // Filter by availability
      sailingsData = sailingsData.filter(sailing => {
        const totalSeats = sailing.availableCapacity.premium + sailing.availableCapacity.economy;
        return totalSeats >= seatsNeeded && sailing.availableCapacity.laneMeters >= laneMetersNeeded;
      });

      sailingsData.sort((a, b) => a.departureTime.toMillis() - b.departureTime.toMillis());
      setSailings(sailingsData);
    } catch (error) {
      console.error("Error loading sailings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Choose what to change
  if (!changeType) {
    return (
      <>
        <Modal.Header>
          <Modal.Heading className="text-2xl font-bold text-blue-ink">
            Change Sailings
          </Modal.Heading>
        </Modal.Header>
        <Modal.Body className="p-6">
          <p className="text-blue-ink mb-4">What would you like to change?</p>
          <div className="space-y-3">
            {booking.tripType === "round" && (
              <button
                onClick={() => setChangeType("both")}
                className="w-full p-4 text-left border-2 border-blue-ink/20 rounded-xl hover:border-blue-ink/40 hover:bg-blue-ink/5 transition-all"
              >
                <p className="font-bold text-blue-ink">Both Sailings</p>
                <p className="text-sm text-blue-ink/60">Change outbound and return</p>
              </button>
            )}
            <button
              onClick={() => setChangeType("outbound")}
              className="w-full p-4 text-left border-2 border-blue-ink/20 rounded-xl hover:border-blue-ink/40 hover:bg-blue-ink/5 transition-all"
            >
              <p className="font-bold text-blue-ink">Outbound Sailing</p>
              <p className="text-sm text-blue-ink/60">
                Current: {booking.outbound.departureTime.toDate().toLocaleDateString()}
              </p>
            </button>
            {booking.return && (
              <button
                onClick={() => setChangeType("return")}
                className="w-full p-4 text-left border-2 border-blue-ink/20 rounded-xl hover:border-blue-ink/40 hover:bg-blue-ink/5 transition-all"
              >
                <p className="font-bold text-blue-ink">Return Sailing</p>
                <p className="text-sm text-blue-ink/60">
                  Current: {booking.return.departureTime.toDate().toLocaleDateString()}
                </p>
              </button>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onPress={onBack}>
            Back
          </Button>
        </Modal.Footer>
      </>
    );
  }

  // Step 2: Show sailing options
  return (
    <>
      <Modal.Header>
        <Modal.Heading className="text-2xl font-bold text-blue-ink">
          Select New Sailing{changeType === "both" ? "s" : ""}
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body className="p-6 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <p className="text-blue-ink text-center">Loading sailings...</p>
        ) : (
          <div className="space-y-6">
            {sailings.length === 0 ? (
              <p className="text-blue-ink/60 text-center">No sailings available for this date</p>
            ) : (
              sailings.map(sailing => (
                <SailingCard
                  key={sailing.id}
                  sailing={sailing}
                  vessel={vessels.find(v => v.callsign === sailing.vesselCallsign)}
                  isSelected={selectedOutbound?.sailing?.id === sailing.id}
                  selectedClass={selectedOutbound?.sailing?.id === sailing.id ? selectedOutbound.ticketClass : null}
                  onSelect={(ticketClass: any) => {
                    setSelectedOutbound({ sailing, ticketClass });
                  }}
                  seatsNeeded={seatsNeeded}
                />
              ))
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onPress={() => setChangeType(null)}>
          Back
        </Button>
        <Button slot="close" onPress={() => console.log("Save sailing changes")}>
          Confirm Changes
        </Button>
      </Modal.Footer>
    </>
  );
}
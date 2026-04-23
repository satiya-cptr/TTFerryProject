"use client";

// Edit booking modal, so users can edit certain aspects of their booking deets 

import { useEffect, useState } from "react";
import { Modal, Button } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserEdit01Icon, Bone01Icon, Car02Icon, FerryBoatIcon, MapsEditingIcon, Day, ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import SailingCard from "@/components/booking/sailingCard";
import { db } from "@/lib/firebase";
import { PASSENGER_TYPES } from "@/lib/types/passengerTypes";
import { VEHICLE_TYPES } from "@/lib/types/vehicleTypes";
import { getDocs, collection, query, where, Timestamp } from "firebase/firestore";

function ChangeSailingsView({ booking, onBack, onSave }: any) {
  const [changeType, setChangeType] = useState<"both" | "outbound" | "return" | null>(null);
  const [currentDate, setCurrentDate] = useState(booking.outbound.departureTime.toDate());
  const [sailings, setSailings] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedOutbound, setSelectedOutbound] = useState<any>(null);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  // calculate seats needed
  const seatsNeeded = booking.passengers.reduce((total: number, p: any) => {
    const passengerType = PASSENGER_TYPES.find(t => t.id === p.type);
    return total + (passengerType?.requiresSeat ? 1 : 0);
  }, 0);

  // calculate lane meters needed
  const laneMetersNeeded = booking.vehicles.reduce((total: number, v: any) => {
    const vehicleType = VEHICLE_TYPES.find(t => t.id === v.type);
    return total + (vehicleType?.laneMeters || 0);
  }, 0);

  // date navigation
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    
    // Don't allow going to today or past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate >= today) {
      setCurrentDate(newDate);
    }
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Calculate price difference
  const calculatePriceDifference = () => {
    if (!selectedOutbound) return 0;

    const originalClass = booking.outbound.ticketClass;
    const newClass = selectedOutbound.ticketClass;
    
    let priceDiff = 0;

    // Calculate passenger price difference
    booking.passengers.forEach((passenger: any) => {
      const passengerType = PASSENGER_TYPES.find(t => t.id === passenger.type);
      if (passengerType?.prices) {
        const originalPrice = passengerType.prices[originalClass as "economy" | "premium"];
        const newPrice = passengerType.prices[newClass as "economy" | "premium"];
        priceDiff += (newPrice - originalPrice);
      }
    });

    // Multiply by 2 if round trip (affects both sailings)
    if (booking.tripType === "round") {
      priceDiff *= 2;
    }

    return priceDiff;
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!selectedOutbound) return;

    try {
      const priceDiff = calculatePriceDifference();
      
      // Update booking in Firestore
      const updates = {
        outbound: {
          sailingId: selectedOutbound.sailing.id,
          vesselCallsign: selectedOutbound.sailing.vesselCallsign,
          ticketClass: selectedOutbound.ticketClass,
          departurePort: selectedOutbound.sailing.departurePort,
          arrivalPort: selectedOutbound.sailing.arrivalPort,
          departureTime: selectedOutbound.sailing.departureTime,
          arrivalTime: selectedOutbound.sailing.arrivalTime,
          hasBeenEdited: true,
        },
        pricing: {
          ...booking.pricing,
          total: booking.pricing.total + priceDiff,
        }
      };

      await onSave(updates);
      
      // Reload page to show updated booking
      window.location.reload();
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

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
      let sailingsData = sailingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

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
        <Modal.Header className="mt-2 mb-6">
          <Modal.Heading className="text-4xl font-bold text-blue-ink text-left">
            Which sailings would you like to change?
          </Modal.Heading>
        </Modal.Header>
        <Modal.Body className="space-y-4 max-w-4xl">
          <div className="space-y-3">
            <button
              onClick={() => setChangeType("outbound")}
              disabled={booking.outbound.hasBeenEdited}
              className="w-full p-4 text-left border border-blue-ink/20 rounded-2xl hover:border-blue-ink/40 hover:bg-blue-ink/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-bold text-blue-ink mb-[2px]">
                Outbound Sailing
                {booking.outbound.hasBeenEdited && <span className="ml-2 text-sm text-gray-500">(Already edited)</span>}
              </p>
              <p className="text-sm text-blue-ink/60">
                Current: {booking.outbound.departureTime.toDate().toLocaleDateString()}
              </p>
            </button>
            {booking.return && (
              <button
                onClick={() => setChangeType("return")}
                disabled={booking.return.hasBeenEdited}
                className="w-full p-4 text-left border border-blue-ink/20 rounded-2xl hover:border-blue-ink/40 hover:bg-blue-ink/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="font-bold text-blue-ink mb-[2px]">
                  Return Sailing
                  {booking.return.hasBeenEdited && <span className="ml-2 text-sm text-gray-500">(Already edited)</span>}
                </p>
                <p className="text-sm text-blue-ink/60">
                  Current: {booking.return.departureTime.toDate().toLocaleDateString()}
                </p>
              </button>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onPress={onBack}>
            Back
          </Button>
        </Modal.Footer>
      </>
    );
  }

  // Step 2: Show sailing options
  return (
    <>
      <Modal.Header className="mt-2 mb-4">
        <Modal.Heading className="text-4xl font-bold text-blue-ink text-left">
          Select New Sailing{changeType === "both" ? "s" : ""}
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body className="px-1 py-6 overflow-y-auto">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-ink/10">
          <p className="text-xl font-bold text-blue-ink">
            {currentDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
  
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousDay}
              className="p-2 text-blue-ink rounded-full hover:bg-blue-ink/5 transition-colors"
              aria-label="Previous Day"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={2.5} />
            </button>
    
            <button
              onClick={goToNextDay}
              className="p-2 text-blue-ink rounded-full hover:bg-blue-ink/5 transition-colors"
              aria-label="Next Day"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Current Sailing Reference */}
        <div className="bg-blue-ink/5 rounded-2xl p-4 mb-6">
          <p className="text-xs font-bold text-blue-ink uppercase mb-2">Current Sailing</p>
          <div className="flex items-center gap-3 text-sm text-blue-ink">
            <span className="font-bold">
              {booking.outbound.departureTime.toDate().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
            <span className="text-blue-ink/40">→</span>
            <span>
              {booking.outbound.arrivalTime.toDate().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
            <span className="ml-auto px-2 py-1 bg-blue-ink/10 rounded-full text-xs font-bold uppercase">
              {booking.outbound.ticketClass}
            </span>
          </div>
        </div>

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
                  vessel={vessels.find((v: any) => v.callsign === sailing.vesselCallsign)}
                  isSelected={selectedOutbound?.sailing?.id === sailing.id}
                  selectedClass={selectedOutbound?.sailing?.id === sailing.id ? selectedOutbound.ticketClass : null}
                  onSelect={(ticketClass: "economy" | "premium") => {
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
        <Button variant="outline" onPress={() => setChangeType(null)}>
          Back
        </Button>
        <Button 
          slot="close" 
          onPress={handleSaveChanges}
          isDisabled={!selectedOutbound}
        >
          {(() => {
            const priceDiff = calculatePriceDifference();
            if (priceDiff > 0) {
              return `Confirm & Pay $${priceDiff.toFixed(2)} TTD`;
            } else if (priceDiff < 0) {
              return `Confirm Changes (Refund: $${Math.abs(priceDiff).toFixed(2)} TTD)`;
            }
            return "Confirm Changes";
          })()}
        </Button>
      </Modal.Footer>
    </>
  );
}

interface EditBookingModalProps {
  booking: any;
  onSave: (updates: any) => Promise<void>;
}

type EditOption = "sailings" | "passengers" | "pets" | "vehicles" | null;

export default function EditBookingModal({ booking, onSave }: EditBookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedOption, setSelectedOption] = useState<EditOption>(null);

  // Check if 24hr cutoff has passed
  const canEdit = () => {
    if (booking.status === "cancelled") {
      return false;
    }

    const firstDeparture = booking.outbound.departureTime.toDate();
    const cutoffTime = new Date(firstDeparture.getTime() - 24 * 60 * 60 * 1000);
    return new Date() < cutoffTime;
  };

  // Check what has been edited
  const sailingsEdited = booking.outbound.hasBeenEdited || booking.return?.hasBeenEdited;
  const passengersEdited = booking.passengers.some((p: any) => p.hasBeenEdited);
  const petsEdited = booking.pets?.some((p: any) => p.hasBeenEdited);
  const vehiclesEdited = booking.vehicles?.some((v: any) => v.hasBeenEdited);

  if (!canEdit()) {
    return null; // Don't show button if past cutoff
  }

  const handleOptionSelect = (option: EditOption) => {
    setSelectedOption(option);
  };

  const handleBack = () => {
    setSelectedOption(null);
  };

  return (
    <Modal>
      {/* Trigger Button */}
      <Modal.Trigger >
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors">
          <HugeiconsIcon icon={MapsEditingIcon} size={20} strokeWidth={2} className="text-light-surface"/>
          Edit Booking
        </button>
      </Modal.Trigger>

      <Modal.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <Modal.Container size="cover"  className="max-h-[96vh] bg-light-surface rounded-3xl p-2 md:p-4">
          <Modal.Dialog className="outline-none flex flex-col w-full max-w-4xl mx-auto shadow-none justify-center">
            <Modal.CloseTrigger />

            {/* Step 1: Select Edit Option */}
            {selectedOption === null && (
              <>
                <Modal.Header className="mt-4 md:mt-2 mb-6">
                  <Modal.Heading className="text-3xl md:text-4xl font-bold text-blue-ink text-left">
                    What would you like to edit?
                  </Modal.Heading>
                </Modal.Header>

                <Modal.Body className="md:p-2 overflow-y-auto">
                  <div className="space-y-4 max-w-4xl">
                    
                    {/* Change Sailings Option */}
                    <button
                      onClick={() => handleOptionSelect("sailings")}
                      disabled={sailingsEdited}
                      className={`w-full flex items-center gap-6 p-4 rounded-3xl border transition-all text-left ${
                        sailingsEdited
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                          : "border-blue-ink/20 hover:border-blue-ink/40 hover:bg-blue-ink/5"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-[52px] h-[52px] md:w-[72px] md:h-[72px] rounded-full bg-blue-ink flex items-center justify-center">
                          <HugeiconsIcon icon={FerryBoatIcon} strokeWidth={1.5} className="text-light-surface w-6 h-6 md:w-[30px] md:h-[30px]"/>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-blue-ink mb-1 leading-snug">
                          Change Sailings
                          {sailingsEdited && <span className="ml-2 text-sm text-gray-500">(Already edited)</span>}
                        </h3>
                        <p className="text-xs md:text-sm text-blue-ink/60">
                          Select different departure times for your journey
                        </p>
                      </div>
                    </button>

                    {/* Update Passenger Info Option */}
                    <button
                      onClick={() => handleOptionSelect("passengers")}
                      disabled={passengersEdited}
                      className={`w-full flex items-center gap-6 p-4 rounded-3xl border transition-all text-left ${
                        passengersEdited
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                          : "border-blue-ink/20 hover:border-blue-ink/40 hover:bg-blue-ink/5"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-[52px] h-[52px] md:w-[72px] md:h-[72px] rounded-full bg-blue-ink flex items-center justify-center">
                          <HugeiconsIcon icon={UserEdit01Icon} strokeWidth={1.5} className="text-light-surface w-6 h-6 md:w-[30px] md:h-[30px]"/>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-blue-ink mb-1 leading-snug">
                          Update Passenger Information
                          {passengersEdited && <span className="ml-2 text-sm text-gray-500">(Already edited)</span>}
                        </h3>
                        <p className="text-xs md:text-sm text-blue-ink/60">
                          Modify passenger names and contact details
                        </p>
                      </div>
                    </button>

                    {/* Update Pet Info Option */}
                    {booking.pets && booking.pets.length > 0 && (
                      <button
                        onClick={() => handleOptionSelect("pets")}
                        disabled={petsEdited}
                        className={`w-full flex items-center gap-6 p-4 rounded-3xl border transition-all text-left ${
                          petsEdited
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                            : "border-blue-ink/20 hover:border-blue-ink/40 hover:bg-blue-ink/5"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-[52px] h-[52px] md:w-[72px] md:h-[72px] rounded-full bg-blue-ink flex items-center justify-center">
                            <HugeiconsIcon icon={Bone01Icon} strokeWidth={1.5} className="text-light-surface w-6 h-6 md:w-[30px] md:h-[30px]"/>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-blue-ink mb-1 leading-snug">
                            Update Pet Information
                            {petsEdited && <span className="ml-2 text-sm text-gray-500">(Already edited)</span>}
                          </h3>
                          <p className="text-xs md:text-sm text-blue-ink/60">
                            Adjust pet weight details
                          </p>
                        </div>
                      </button>
                    )}

                    {/* Update Vehicle Info Option */}
                    {booking.vehicles && booking.vehicles.length > 0 && (
                      <button
                        onClick={() => handleOptionSelect("vehicles")}
                        disabled={vehiclesEdited}
                        className={`w-full flex items-center gap-6 p-4 rounded-3xl border transition-all text-left ${
                          vehiclesEdited
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                            : "border-blue-ink/20 hover:border-blue-ink/40 hover:bg-blue-ink/5"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-[52px] h-[52px] md:w-[72px] md:h-[72px] rounded-full bg-blue-ink flex items-center justify-center">
                            <HugeiconsIcon icon={Car02Icon} strokeWidth={1.5} className="text-light-surface w-6 h-6 md:w-[30px] md:h-[30px]"/>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-blue-ink mb-1 leading-snug">
                            Update Vehicle Information
                            {vehiclesEdited && <span className="ml-2 text-sm text-gray-500">(Already edited)</span>}
                          </h3>
                          <p className="text-xs md:text-sm text-blue-ink/60">
                            Change registration number or assigned driver
                          </p>
                        </div>
                      </button>
                    )}

                  </div>
                </Modal.Body>
              </>
            )}

            {/* Step 2: change views */}
            {selectedOption === "sailings" && <ChangeSailingsView booking={booking} onBack={handleBack} onSave={onSave} />}

            {selectedOption === "passengers" && (
              <>
                <Modal.Header className="mt-2 mb-6">
                  <Modal.Heading className="text-4xl font-bold text-blue-ink text-left">
                    Update Passenger Information
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body className="p-2 overflow-y-auto">
                  <p className="text-blue-ink">This option is not available right now, check back later.</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="outline" onPress={handleBack}>
                    Back
                  </Button>
                  <Button slot="close">Save Changes</Button>
                </Modal.Footer>
              </>
            )}

            {selectedOption === "pets" && (
              <>
                <Modal.Header className="mt-2 mb-6">
                  <Modal.Heading className="text-4xl font-bold text-blue-ink text-left">
                    Update Pet Information
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body className="p-2 overflow-y-auto">
                  <p className="text-blue-ink">Pet edit forms will go here...</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="outline" onPress={handleBack}>
                    Back
                  </Button>
                  <Button slot="close">Save Changes</Button>
                </Modal.Footer>
              </>
            )}

            {selectedOption === "vehicles" && (
              <>
                <Modal.Header className="mt-2 mb-6">
                  <Modal.Heading className="text-4xl font-bold text-blue-ink text-left">
                    Update Vehicle Information
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body className="p-2 overflow-y-auto">
                  <p className="text-blue-ink">Vehicle edit forms will go here...</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="outline" onPress={handleBack}>
                    Back
                  </Button>
                  <Button slot="close">Save Changes</Button>
                </Modal.Footer>
              </>
            )}

          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
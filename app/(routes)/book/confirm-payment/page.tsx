"use client";

// Confirm and pay page, where users complete their booking

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc,getDocs, query, where, Timestamp, increment, doc, updateDoc } from "firebase/firestore";
import { Input, Label, Button, FieldError, TextField, toast } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, DiscountTag02Icon } from "@hugeicons/core-free-icons";
import { PASSENGER_TYPES } from "@/lib/types/passengerTypes";
import { VEHICLE_TYPES } from "@/lib/types/vehicleTypes";
import { parseDate } from "@internationalized/date";

interface DiscountCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  description: string;
  validFrom: Timestamp;
  validUntil: Timestamp;
  usageLimit?: number;
  usageCount?: number;
  isActive: boolean;
}

export default function ConfirmPaymentPage() {
  const router = useRouter();
  
  const [searchCriteria, setSearchCriteria] = useState<any>(null);
  const [selectedSailings, setSelectedSailings] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Discount code state
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const HOLD_DURATION = 3000; // 3 seconds

  const startHold = () => {
    setIsHolding(true);
    holdTimer.current = setTimeout(() => {
      handleConfirmPayment(); 
      setIsHolding(false);
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setIsHolding(false);
  };

  useEffect(() => {
    loadBookingData();
  }, [router]);

  const loadBookingData = () => {
  const search = sessionStorage.getItem("bookingSearch");
  const sailings = sessionStorage.getItem("selectedSailings");
  const details = sessionStorage.getItem("bookingDetails");

  if (!search || !sailings || !details) {
    router.push("/");
    return;
  }

  const sailingsData = JSON.parse(sailings);
  
  // Reconstruct Timestamps for outbound sailing
  if (sailingsData.outbound?.sailing?.departureTime) {
    sailingsData.outbound.sailing.departureTime = new Timestamp(
      sailingsData.outbound.sailing.departureTime.seconds,
      sailingsData.outbound.sailing.departureTime.nanoseconds
    );
    sailingsData.outbound.sailing.arrivalTime = new Timestamp(
      sailingsData.outbound.sailing.arrivalTime.seconds,
      sailingsData.outbound.sailing.arrivalTime.nanoseconds
    );
  }
  
  // reconstruct timestamps for return sailing (if round trip)
  if (sailingsData.return?.sailing?.departureTime) {
    sailingsData.return.sailing.departureTime = new Timestamp(
      sailingsData.return.sailing.departureTime.seconds,
      sailingsData.return.sailing.departureTime.nanoseconds
    );
    sailingsData.return.sailing.arrivalTime = new Timestamp(
      sailingsData.return.sailing.arrivalTime.seconds,
      sailingsData.return.sailing.arrivalTime.nanoseconds
    );
  }

  setSearchCriteria(JSON.parse(search));
  setSelectedSailings(sailingsData);
  setBookingDetails(JSON.parse(details));
  setLoading(false);
};

  // Generate unique booking reference
  const generateBookingReference = (): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let random = '';
    for (let i = 0; i < 4; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `TT-${year}${month}${day}-${random}`;
  };

  // Ensure unique booking reference
  const ensureUniqueReference = async (): Promise<string> => {
    let reference = generateBookingReference();
    let exists = true;
    
    while (exists) {
      const snapshot = await getDocs(
        query(collection(db, 'bookings'), where('bookingReference', '==', reference))
      );
      
      if (snapshot.empty) {
        exists = false;
      } else {
        reference = generateBookingReference();
      }
    }
    
    return reference;
  };

  // Validate and apply discount code
  const applyDiscountCode = async () => {
    if (!discountCodeInput.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    setCheckingCode(true);
    setDiscountError("");

    try {
      const codesQuery = query(
        collection(db, 'discountCodes'),
        where('code', '==', discountCodeInput.toUpperCase()),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(codesQuery);

      if (snapshot.empty) {
        setDiscountError("Invalid discount code");
        setAppliedDiscount(null);
        setCheckingCode(false);
        return;
      }

      const codeData = snapshot.docs[0].data() as DiscountCode;

      // Check validity period
      const now = Timestamp.now();
      if (codeData.validFrom.toMillis() > now.toMillis()) {
        setDiscountError("This code is not yet valid");
        setAppliedDiscount(null);
        setCheckingCode(false);
        return;
      }

      if (codeData.validUntil.toMillis() < now.toMillis()) {
        setDiscountError("This code has expired");
        setAppliedDiscount(null);
        setCheckingCode(false);
        return;
      }

      // Check usage limit
      if (codeData.usageLimit && codeData.usageCount && 
          codeData.usageCount >= codeData.usageLimit) {
        setDiscountError("This code has reached its usage limit");
        setAppliedDiscount(null);
        setCheckingCode(false);
        return;
      }

      // Apply discount
      setAppliedDiscount(codeData);
      setDiscountError("");
      setCheckingCode(false);
    } catch (error) {
      console.error("Error validating discount code:", error);
      setDiscountError("Error validating code. Please try again.");
      setCheckingCode(false);
    }
  };

  const removeDiscountCode = () => {
    setAppliedDiscount(null);
    setDiscountCodeInput("");
    setDiscountError("");
  };

  // Calculate final price with discount code
  const calculateFinalPrice = () => {
    if (!bookingDetails) return null;

    const basePrice = bookingDetails.pricing;
    let discountAmount = 0;

    if (appliedDiscount) {
      if (appliedDiscount.type === "percentage") {
        discountAmount = basePrice.total * (appliedDiscount.value / 100);
      } else {
        discountAmount = appliedDiscount.value;
      }
    }

    return {
      ...basePrice,
      codeDiscount: discountAmount,
      finalTotal: Math.max(0, basePrice.total - discountAmount),
    };
  };

  // Save booking to Firestore
  const handleConfirmPayment = async () => {
    if (!searchCriteria || !selectedSailings || !bookingDetails) return;

    setProcessing(true);

    try {
      // Generate unique reference
      const bookingReference = await ensureUniqueReference();
      
      // Get sailing details
      const outboundSailing = selectedSailings.outbound.sailing;
      const returnSailing = selectedSailings.return?.sailing;

      // Prepare booking data
      const finalPrice = calculateFinalPrice();
      
      const bookingData = {
        bookingReference,
        
        // Trip details
        tripType: searchCriteria.tripType,
        route: searchCriteria.route,
        
        // Sailings
        outbound: {
          sailingId: outboundSailing.id,
          vesselCallsign: outboundSailing.vesselCallsign,
          ticketClass: selectedSailings.outbound.ticketClass,
          departurePort: outboundSailing.departurePort,
          arrivalPort: outboundSailing.arrivalPort,
          departureTime: outboundSailing.departureTime,
          arrivalTime: outboundSailing.arrivalTime,
        },
        
        ...(searchCriteria.tripType === "round" && returnSailing && {
          return: {
            sailingId: returnSailing.id,
            vesselCallsign: returnSailing.vesselCallsign,
            ticketClass: selectedSailings.return.ticketClass,
            departurePort: returnSailing.departurePort,
            arrivalPort: returnSailing.arrivalPort,
            departureTime: returnSailing.departureTime,
            arrivalTime: returnSailing.arrivalTime,
          }
        }),
        
        // Passengers
        passengers: bookingDetails.passengers,
        
        // Reservation holder
        reservationHolder: {
          passengerIndex: bookingDetails.reservationHolderIndex,
          phone: bookingDetails.passengers[bookingDetails.reservationHolderIndex].phone,
          email: bookingDetails.passengers[bookingDetails.reservationHolderIndex].email,
          address: bookingDetails.passengers[bookingDetails.reservationHolderIndex].address,
        },
        
        // Pets
        pets: bookingDetails.pets || [],
        
        // Vehicles
        vehicles: bookingDetails.vehicles || [],
        
        // Pricing
        pricing: {
          passengerTotal: finalPrice.passengerTotal,
          vehicleTotal: finalPrice.vehicleTotal,
          groupDiscount: finalPrice.groupDiscount,
          ...(appliedDiscount && {
            discountCode: {
              code: appliedDiscount.code,
              type: appliedDiscount.type,
              value: appliedDiscount.value,
              amount: finalPrice.codeDiscount,
            }
          }),
          subtotal: finalPrice.subtotal,
          total: finalPrice.finalTotal,
          currency: "TTD",
        },
        
        // Metadata
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: Timestamp.now(),
        bookedAt: Timestamp.now(),
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      // UPDATE SAILING AVAILABILITY
      try {
        // Calculate seats needed per class
        let economySeatsNeeded = 0;
        let premiumSeatsNeeded = 0;
        let laneMetersNeeded = 0;

        // Count seats needed based on ticket class
        bookingDetails.passengers.forEach((passenger: any) => {
          const passengerType = PASSENGER_TYPES.find(t => t.id === passenger.type);
          if (passengerType && passengerType.requiresSeat) {
            if (selectedSailings.outbound.ticketClass === 'economy') {
              economySeatsNeeded++;
            } else {
              premiumSeatsNeeded++;
            }
          }
        });

        // Calculate lane meters needed for vehicles
        bookingDetails.vehicles.forEach((vehicle: any) => {
          const vehicleType = VEHICLE_TYPES.find(t => t.id === vehicle.type);
          if (vehicleType) {
            laneMetersNeeded += vehicleType.laneMeters;
          }
        });

        // Update outbound sailing
        const outboundSailingRef = doc(db, 'sailings', outboundSailing.id);
        await updateDoc(outboundSailingRef, {
          'availableCapacity.economy': increment(-economySeatsNeeded),
          'availableCapacity.premium': increment(-premiumSeatsNeeded),
          'availableCapacity.laneMeters': increment(-laneMetersNeeded),
        });

        // Update return sailing if round trip
        if (searchCriteria.tripType === "round" && returnSailing) {
          // Recalculate for return trip class
          let returnEconomySeats = 0;
          let returnPremiumSeats = 0;

          bookingDetails.passengers.forEach((passenger: any) => {
            const passengerType = PASSENGER_TYPES.find(t => t.id === passenger.type);
            if (passengerType && passengerType.requiresSeat) {
              if (selectedSailings.return.ticketClass === 'economy') {
              returnEconomySeats++;
            } else {
              returnPremiumSeats++;
            }
          }
        });

        const returnSailingRef = doc(db, 'sailings', returnSailing.id);
        await updateDoc(returnSailingRef, {
          'availableCapacity.economy': increment(-returnEconomySeats),
          'availableCapacity.premium': increment(-returnPremiumSeats),
          'availableCapacity.laneMeters': increment(-laneMetersNeeded),
        });
      }

        console.log('Sailing availability updated successfully');
      } catch (error) {
        console.error('Error updating sailing availability:', error);
      // booking won't fail if availability update fails, but log the error for later investigation
      }

      // Clear session storage
      sessionStorage.removeItem('bookingSearch');
      sessionStorage.removeItem('selectedSailings');
      sessionStorage.removeItem('bookingDetails');

      toast.success("Booking confirmed!", {
        description: "Your payment was successful and your tickets are ready.",
      })

      // Navigate to tickets page with booking ID
      router.push(`/book/booking/${docRef.id}`);
      
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Error processing payment. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-lg text-blue-ink font-medium">Loading...</p>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice();
  if (!finalPrice) return null;

  const outboundDate = selectedSailings.outbound.sailing.departureTime.toDate();
  const returnDate = selectedSailings.return?.sailing.departureTime.toDate();

  return (
    <div className="min-h-screen bg-light-surface md:py-12 mt-22 md:mt-16 mb-8">
      <div className="max-w-2xl mx-auto px-3 md:px-6">
        
        {/* Header */}
        <div className="text-left mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-ink">Confirm & Pay</h1>
        </div>

        {/* Bill */}
        <div className="bg-light-surface rounded-3xl shadow-md border border-blue-ink/10 p-8 mb-6">
          
          {/* Sailing dtails */}
          <div className="mb-8 pb-8 border-b border-blue-ink/10">
            <h2 className="text-lg font-bold text-blue-ink mb-4 uppercase">Your Sailings</h2>
            
            {/* Outbound */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-ink uppercase">
                  Outbound • {selectedSailings.outbound.ticketClass}
                </span>
                <span className="text-xs text-blue-ink/60">
                  {outboundDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-blue-ink">
                <span className="font-bold">
                  {outboundDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </span>
                <span className="text-blue-ink/40">→</span>
                <span className="font-bold">
                  {selectedSailings.outbound.sailing.arrivalTime.toDate().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-xs text-blue-ink/60 mt-1">
                {searchCriteria.route.from === "POS" ? "Port of Spain" : "Scarborough"} → {searchCriteria.route.to === "TBG" ? "Scarborough" : "Port of Spain"}
              </p>
            </div>

            {/* Return */}
            {searchCriteria.tripType === "round" && returnDate && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-ink uppercase">
                    Return • {selectedSailings.return.ticketClass}
                  </span>
                  <span className="text-xs text-blue-ink/60">
                    {returnDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-blue-ink">
                  <span className="font-bold">
                    {returnDate.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="text-blue-ink/40">→</span>
                  <span className="font-bold">
                    {selectedSailings.return.sailing.arrivalTime.toDate().toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="text-xs text-blue-ink/60 mt-1">
                  {searchCriteria.route.to === "TBG" ? "Scarborough" : "Port of Spain"} → {searchCriteria.route.from === "POS" ? "Port of Spain" : "Scarborough"}
                </p>
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="space-y-6">
            
            {/* Passengers */}
            <div>
              <h3 className="text-sm font-bold text-blue-ink uppercase mb-3">Passengers</h3>
              <div className="space-y-2">
                {bookingDetails.passengers.map((passenger: any, index: number) => {
                  const passengerType = PASSENGER_TYPES.find(t => t.id === passenger.type);
                  const ticketClass = selectedSailings.outbound.ticketClass as "economy" | "premium";
                  const price = passengerType?.prices?.[ticketClass] || 0;
                  const tripMultiplier = searchCriteria.tripType === "round" ? 2 : 1;
                  
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-blue-ink/80">
                        {passenger.firstName} {passenger.lastName} ({passengerType?.displayName})
                      </span>
                      <span className="font-medium text-blue-ink">
                        ${(price * tripMultiplier).toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {/* pets */}
                {bookingDetails.pets && bookingDetails.pets.length > 0 && (
                  <>
                    {bookingDetails.pets.map((pet: any, index: number) => {
                      const petType = PASSENGER_TYPES.find(t => t.id === 'pet');
                      const price = petType?.prices?.economy || 0;
                      const tripMultiplier = searchCriteria.tripType === "round" ? 2 : 1;
                      
                      return (
                        <div key={`pet-${index}`} className="flex items-center justify-between text-sm">
                          <span className="text-blue-ink/80">
                            Pet #{index + 1} ({pet.petType})
                          </span>
                          <span className="font-medium text-blue-ink">
                            ${(price * tripMultiplier).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* vehicles */}
            {bookingDetails.vehicles && bookingDetails.vehicles.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-blue-ink uppercase mb-3">Vehicles</h3>
                <div className="space-y-2">
                  {bookingDetails.vehicles.map((vehicle: any, index: number) => {
                    const vehicleType = VEHICLE_TYPES.find(t => t.id === vehicle.type);
                    const price = vehicleType?.price || 0;
                    const tripMultiplier = searchCriteria.tripType === "round" ? 2 : 1;
                    
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-blue-ink/80">
                          {vehicleType?.displayName} ({vehicle.registration})
                        </span>
                        <span className="font-medium text-blue-ink">
                          ${(price * tripMultiplier).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Discounts & totals */}
            <div className="pt-6 border-t border-blue-ink/10 space-y-2">
              {finalPrice.groupDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">Group Discount (10%)</span>
                  <span className="text-green-600 font-bold">
                    -${finalPrice.groupDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {appliedDiscount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">
                    {appliedDiscount.description}
                  </span>
                  <span className="text-green-600 font-bold">
                    -${finalPrice.codeDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-lg pt-4 border-t border-blue-ink/10">
                <span className="font-bold text-blue-ink">Total</span>
                <span className="font-bold text-blue-ink text-2xl">
                  ${finalPrice.finalTotal.toFixed(2)} <span className="text-sm font-normal">TTD</span>
                </span>
              </div>

              <p className="text-xs text-blue-ink/60 text-center">
                Prices include VAT
              </p>
            </div>
          </div>
        </div>

        {/* Discount code */}
        <div className="bg-light-surface rounded-3xl shadow-md border border-blue-ink/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <HugeiconsIcon icon={DiscountTag02Icon} size={20} strokeWidth={2} className="text-blue-ink" />
            <h3 className="text-sm font-bold text-blue-ink uppercase">Discount Code</h3>
          </div>

          {appliedDiscount ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} className="text-green-600" />
                <div>
                  <p className="font-bold text-green-800">{appliedDiscount.code}</p>
                  <p className="text-xs text-green-600">{appliedDiscount.description}</p>
                </div>
              </div>
              <button
                onClick={removeDiscountCode}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <TextField 
                  isInvalid={!!discountError}
                  className="flex-1"
                  onChange={(val) => setDiscountCodeInput(val.toUpperCase())}
                >
                  <Input 
                    placeholder="Enter code" 
                    value={discountCodeInput}
                    className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:normal-case uppercase"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyDiscountCode();
                      }
                    }}
                  />
  
                  <FieldError className="text-xs text-red-600 mt-1">
                    {discountError}
                  </FieldError>
                </TextField>
                <Button
                  onPress={applyDiscountCode}
                  isDisabled={checkingCode || !discountCodeInput.trim()}
                  className="px-6 py-6 bg-blue-ink text-white rounded-xl font-medium hover:bg-blue-ink/90"
                >
                  {checkingCode ? 'Checking...' : 'Apply'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <button
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold} 
          onTouchEnd={cancelHold}
          disabled={processing}
          className="relative w-full py-5 bg-blue-ink text-light-surface rounded-full font-bold text-lg overflow-hidden transition-all shadow-xl active:scale-95 disabled:opacity-50 mb-2 md:mb-0"
        >
           {/* progress overlay */}
            <div 
              className={`absolute inset-0 bg-white/20 origin-left transition-transform duration-[3000ms] ease-linear pointer-events-none ${
                isHolding ? 'scale-x-100' : 'scale-x-0 transition-none'
              }`}
            />

           {/* text */}
          <span className="relative z-10">
            {processing ? 'Processing...' : isHolding ? 'Hold to Pay...' : `Hold to Pay $${finalPrice.finalTotal.toFixed(2)} TTD`}
          </span>
        </button>

        <p className="text-center text-xs text-blue-ink/60 mt-4">
          This is a student project, no actual payment processing will occur.
        </p>
      </div>
    </div>
  );
}
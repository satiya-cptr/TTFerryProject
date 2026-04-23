"use client";

// Booking page, displays all the booking details, utilities and tickets for a specific booking 
// TODO: display the contact and billing information at the bottom

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Accordion } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import { PASSENGER_TYPES } from "@/lib/types/passengerTypes";
import { VEHICLE_TYPES } from "@/lib/types/vehicleTypes";
import FerryTicket from "@/components/tickets/ferryTickets";
import EditBookingModal from "./components/editBookingModal";
import CancelBookingModal from "./components/cancelBookingModal";

export default function TicketsPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const router = useRouter();
  const { bookingId } = use(params);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  // get the booking
  const loadBooking = async () => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        alert("Booking not found");
        router.push("/");
        return;
      }

      setBooking({ id: bookingSnap.id, ...bookingSnap.data() });
      setLoading(false);
    } catch (error) {
      console.error("Error loading booking:", error);
      alert("Error loading tickets");
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-lg text-blue-ink font-medium">Loading your tickets...</p>
      </div>
    );
  }

  if (!booking) return null;

  const bookedDate = booking.bookedAt.toDate().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // group vehicles by passenger 
  const vehiclesByPassenger: Record<number, any[]> = {};
  booking.vehicles?.forEach((vehicle: any) => {
    const passengerIndex = parseInt(vehicle.assignedToPassengerIndex || vehicle.assignedTo);
    if (!vehiclesByPassenger[passengerIndex]) {
      vehiclesByPassenger[passengerIndex] = [];
    }
    vehiclesByPassenger[passengerIndex].push(vehicle);
  });

  return (
    <div className="min-h-screen bg-light-surface pb-12 pt-28 font-inter-tight">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-left mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-ink mb-2">
            Booking: {booking.bookingReference}
          </h1>
          <p className="text-blue-ink/60 mb-1">Booked on {bookedDate}</p>
          <p className="text-blue-ink/60 mb-4">Status: {booking.status}</p>

          <div className="flex flex-col md:flex-row md:items-center justify-start gap-3">
            {booking.status === "cancelled" ? (
            // cancelled banner
              <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-3">
                <p className="text-sm font-bold text-danger">
                  This booking has been cancelled
                </p>
                <p className="text-xs text-danger/80 mt-1">
                  Refund of ${booking.refundAmount?.toFixed(2) || "0.00"} TTD will be processed within 7 business days.
                </p>
              </div>
            ) : (
              // action buttons if not cancelled
              <>
                <EditBookingModal 
                  booking={booking} 
                  onSave={async (updates) => {
                    try {
                      const bookingRef = doc(db, "bookings", bookingId);
                      await updateDoc(bookingRef, updates);
                    } catch (error) {
                      console.error("Error updating booking:", error);
                      throw error;
                    }
                  }}
                />

                <CancelBookingModal booking={booking} bookingId={bookingId} />
              </>
            )}
          </div>
        </div>

        {/* Tickets */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-ink mb-6">Your Tickets</h2>

          <Accordion allowsMultipleExpanded hideSeparator defaultExpandedKeys={['passenger-0']} className="space-y-4">
            {booking.passengers.map((passenger: any, index: number) => {
              const passengerType = PASSENGER_TYPES.find(t => t.id === passenger.type);
              const isReservationHolder = index === booking.reservationHolder.passengerIndex;
              const assignedVehicles = vehiclesByPassenger[index] || [];

              return (
                <Accordion.Item 
                  key={`passenger-${index}`} 
                  className="bg-light-surface border border-blue-ink/10 rounded-3xl overflow-hidden shadow-md"
                >
                  <Accordion.Heading>
                    <Accordion.Trigger className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={UserIcon} size={20} strokeWidth={2.25} className="text-blue-ink"/>
                        <span className="font-bold text-base text-blue-ink">
                          {passenger.firstName} {passenger.lastName}
                          {isReservationHolder && " (Reservation Holder)"}
                        </span>
                      </div>
                      <Accordion.Indicator  />
                    </Accordion.Trigger>
                  </Accordion.Heading>

                  <Accordion.Panel>
                    <Accordion.Body className="px-6 pb-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 ">
                        <div className="w-full">
                          <FerryTicket
                            passenger={passenger}
                            sailing={booking.outbound}
                            tripType="Outbound"
                            bookingRef={booking.bookingReference}
                            passengerIndex={index}
                          />
                        </div>
                        {booking.return && (
                          <div className="w-full">
                            <FerryTicket
                              passenger={passenger}
                              sailing={booking.return}
                              tripType="Return"
                              bookingRef={booking.bookingReference}
                              passengerIndex={index}
                            />
                          </div>
                        )}
                      </div>

                      {/* Pet tickets, shown with reservation holder */}
                      {isReservationHolder && booking.pets && booking.pets.length > 0 && (
                        <>
                          {booking.pets.map((pet: any, petIndex: number) => (
                            <div key={`pet-${petIndex}`} className="grid grid-cols-1 md:grid-cols-2 mb-6">
                              <FerryTicket
                                pet={pet}
                                sailing={booking.outbound}
                                tripType="Outbound"
                                bookingRef={booking.bookingReference}
                                petIndex={petIndex}
                              />
                              {booking.return && (
                                <FerryTicket
                                  pet={pet}
                                  sailing={booking.return}
                                  tripType="Return"
                                  bookingRef={booking.bookingReference}
                                  petIndex={petIndex}
                                />
                              )}
                            </div>
                          ))}
                        </>
                      )}

                      {/* Vehicle tickets, shown with driver */}
                      {assignedVehicles.length > 0 && (
                        <>
                          {assignedVehicles.map((vehicle: any, vIndex: number) => (
                            <div key={`vehicle-${vIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                              <FerryTicket
                                vehicle={vehicle}
                                driver={passenger}
                                sailing={booking.outbound}
                                tripType="Outbound"
                                bookingRef={booking.bookingReference}
                              />
                              {booking.return && (
                                <FerryTicket
                                  vehicle={vehicle}
                                  driver={passenger}
                                  sailing={booking.return}
                                  tripType="Return"
                                  bookingRef={booking.bookingReference}
                                />
                              )}
                            </div>
                          ))}
                        </>
                      )}

                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors"
          >
            Print All Tickets
          </button>
        </div>
      </div>
    </div>
  );
}


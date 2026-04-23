"use client";

// Cancel booking modal, only available >24hrs before departure time 
// TODO: actually trigger an email when they've cancelled + maybe add 'hold to cancel' to the cancel button 

import { useState } from "react";
import { Modal, Button, toast } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface CancelBookingModalProps {
  booking: any;
  bookingId: string;
}

export default function CancelBookingModal({ booking, bookingId }: CancelBookingModalProps) {
  const [cancelling, setCancelling] = useState(false);

  // check if passed 24hr cutoff
  const canCancel = () => {
    const firstDeparture = booking.outbound.departureTime.toDate();
    const cutoffTime = new Date(firstDeparture.getTime() - 24 * 60 * 60 * 1000);
    return new Date() < cutoffTime && booking.status === "confirmed";
  };

  // calculate refund (total - 25% service fee)
  const refundAmount = booking.pricing.total * 0.75;
  const serviceFee = booking.pricing.total * 0.25;

  const handleCancelBooking = async () => {
    setCancelling(true);
    
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "cancelled",
        cancelledAt: new Date(),
        refundAmount: refundAmount,
      });

      toast.success("Booking cancelled successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.danger("We ran into an issue cancelling your booking. Please try again.")
      setCancelling(false);
    }
  };

  if (!canCancel()) {
    return null; // Don't show button if can't cancel
  }

  return (
    <Modal>
      <Modal.Trigger>
        <button className="flex items-center gap-2 px-6 py-3 border border-blue-ink/20 bg-blue-ink/5 text-blue-ink rounded-full font-medium hover:bg-danger/70 transition-colors">
          <HugeiconsIcon icon={Delete02Icon} size={20} strokeWidth={2} className="text-blue-ink"/>
          Cancel Booking
        </button>
      </Modal.Trigger>

      <Modal.Backdrop variant="blur" className="bg-black/60">
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-lg">
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Icon className="bg-red-100 text-red-600">
                <HugeiconsIcon icon={AlertCircleIcon} size={24} />
              </Modal.Icon>
              <Modal.Heading className="text-2xl font-bold text-blue-ink">
                Cancel Booking?
              </Modal.Heading>
              <p className="text-sm text-blue-ink/60">
                This action will permanently cancel your booking and cannot be undone. Are you sure you want to cancel your booking?
              </p>
            </Modal.Header>

            <Modal.Body className="p-2 md:p-4">
              {/* Ref */}
              <div className="bg-blue-ink/5 rounded-xl  p-2 md:p-4 mb-6">
                <p className="text-xs font-bold text-blue-ink uppercase mb-2">Booking Reference</p>
                <p className="text-2xl font-bold text-blue-ink">{booking.bookingReference}</p>
              </div>

              {/* Refund breakdown */}
              <div className="bg-light-surface rounded-xl p-4 border border-blue-ink/10">
                <p className="text-sm font-bold text-blue-ink mb-4">Refund Breakdown</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-ink/60">Original Total</span>
                    <span className="font-medium text-blue-ink">
                      ${booking.pricing.total.toFixed(2)} TTD
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-ink/60">Cancellation Service Fee (25%)</span>
                    <span className="font-medium text-danger">
                      -${serviceFee.toFixed(2)} TTD
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-blue-ink/10 flex items-center justify-between">
                    <span className="font-bold text-blue-ink">Refund Amount</span>
                    <span className="text-xl font-bold text-green-600">
                      ${refundAmount.toFixed(2)} TTD
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-ink/10">
                  <p className="text-xs text-blue-ink/60 leading-relaxed">
                    Your refund will be processed within <span className="font-semibold">7 business days</span> of cancellation. 
                    You will receive a confirmation email once the refund has been initiated. Please allow 5-10 business days 
                    for the refund to appear in your account depending on your financial institution.
                  </p>
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button 
                slot="close" 
                variant="outline"
                isDisabled={cancelling}
                className=" text-blue-ink/60"
              >
                Keep Booking
              </Button>
              <Button 
                onPress={handleCancelBooking}
                className="bg-danger text-light-surface hover:bg-danger/80"
                isDisabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
"use client";

// User account page, can't access if not logged in

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, LogoutSquare01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { DoubleStackButton } from "@/components/ui/doubleStackButton";
import RollingText from "@/components/ui/rollingText";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // If not signed in, redirect to auth
        router.push("/auth?tab=account");
        return;
      }

      setUser(firebaseUser);

      // Get user data from db
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      setUserData(userDoc.data());

      // Get bookings with this email
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("reservationHolder.email", "==", firebaseUser.email)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by booking date
      bookingsData.sort((a: any, b: any) => 
        b.bookedAt.toMillis() - a.bookedAt.toMillis()
      );

      setBookings(bookingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // logging out
  const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-ink">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen light-surface pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        <h1 className="text-4xl font-bold text-blue-ink mb-8">
          Hi, {userData?.firstName}
        </h1>

        {/* user info */}
        <div className="bg-light-surface rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            {/* TODO: replace with Avatar component, with conditional badge for admins */}
            <div className="w-12 h-12 bg-blue-ink/10 rounded-full flex items-center justify-center">
              <HugeiconsIcon icon={UserIcon} size={24} className="text-blue-ink" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-ink">Your Profile</h2>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-blue-ink/70">
              <span className="font-semibold">Name:</span> {userData?.firstName} {userData?.lastName}
            </p>
            <p className="text-sm text-blue-ink/70">
              <span className="font-semibold">Email:</span> {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mt-4 text-blue-ink text-xs rounded-lg font-medium hover:text-blue-ink/60 transition-colors"
          >
            <HugeiconsIcon icon={LogoutSquare01Icon} size={18} />
            Log Out
          </button>
        </div>

        {/* bookings list */}
        <div>
          <h2 className="text-2xl font-bold text-blue-ink mb-4">Your Bookings</h2>
          
          {bookings.length === 0 ? (
            <div className="bg-light-surface p-12 text-center">
              <p className=" text-base text-blue-ink/60">No bookings found.</p>
              
              <DoubleStackButton 
                variant="dark" 
                onClick={() => router.push("/")}
                className="mx-auto mt-4"
                endContent={<HugeiconsIcon icon={ArrowRight02Icon} size={20} strokeWidth={2} />}
              >
                <RollingText primary="Book a Trip" secondary="Book a Trip" />
              </DoubleStackButton>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="bg-light-surface rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* reference */}
                      <p className="text-2xl font-bold text-blue-ink mb-2">
                        {booking.bookingReference}
                      </p>

                      {/* route and date */}
                      <div className="flex items-center gap-2 text-sm text-blue-ink/70 mb-2">
                        <span className="font-semibold">{booking.route.from}</span>
                        <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
                        <span className="font-semibold">{booking.route.to}</span>
                        {booking.tripType === "round" && (
                          <>
                            <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
                            <span className="font-semibold">{booking.route.from}</span>
                          </>
                        )}
                      </div>

                      {/* departure */}
                      <p className="text-sm text-blue-ink/70 mb-2">
                        Departure: {booking.outbound.departureTime.toDate().toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>

                      {/* status and seets */}
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          booking.status === "confirmed" 
                            ? "bg-green-100 text-green-800" 
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    {/* View btn */}
                    <button
                      onClick={() => router.push(`/book/booking/${booking.id}`)}
                      className="px-6 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors flex items-center gap-2"
                    >
                      View
                      <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
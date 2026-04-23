"use client";

// Admin Controls page, protected route to prevent unauthorised users from tampering with controls 
// redirects if you're not logged in or not an admin

// TODO: update to use heroUI components, will need to update the forms themselves for that as well

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AddVesselForm from '@/components/forms/addVesselForm';
import AddSailingForm from '@/components/forms/addSailingForm';
import UpdateVesselForm from '@/components/forms/updateVesselForm';
import UpdateSailingForm from '@/components/forms/updateSailingForm';
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout03Icon, LogoutSquare01Icon } from "@hugeicons/core-free-icons";
import AddUpdateForm from "@/components/forms/addUpdateForm";
import ManageUpdatesForm from "@/components/forms/manageUpdatesForm";


export default function AdminPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form visibility states
  const [showAddVessel, setShowAddVessel] = useState(false);
  const [showAddSailing, setShowAddSailing] = useState(false);
  const [showUpdateSailing, setShowUpdateSailing] = useState(false);
  const [showUpdateVessel, setShowUpdateVessel] = useState(false);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [showManageUpdates, setShowManageUpdates] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // If not signed in, redirect to auth 
        router.push("/auth?tab=account");
        return;
      }

      // Get user data and check if admin
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const data = userDoc.data();

      if (data?.role !== "admin") {
        // Not an admin, redirect to account
        router.push("/account");
        return;
      }

      setUserData(data);
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

  const handleVesselAdded = () => {
    setShowAddVessel(false);
  };

  const handleVesselUpdated = () => {
    setShowUpdateVessel(false);
  };

  const handleSailingAdded = () => {
    setShowAddSailing(false);
  };

  const handleSailingUpdated = () => {
    setShowUpdateSailing(false);
  };

  const handleUpdateAdded = () => {
    setShowAddUpdate(false);
  };

  const handleUpdateManaged = () => {
    setShowManageUpdates(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-ink">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-surface pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-blue-ink">
            Hi, {userData?.firstName}!
          </h1>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mt-4 text-blue-ink text-xs rounded-lg font-medium hover:text-blue-ink/60 transition-colors"
          >
            <HugeiconsIcon icon={LogoutSquare01Icon} size={18} />
            Log Out
          </button>
        </div>

        {/* controls */}
        <div className="bg-light-surface rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-ink mb-6">Admin Controls</h2>

          {/* Vessel management btns */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-ink mb-3">Vessel Management</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddVessel(true)}
                className="px-6 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors"
              >
                Add Vessel
              </button>
              <button
                onClick={() => setShowUpdateVessel(true)}
                className="px-6 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors"
              >
                Update Vessel
              </button>
            </div>
          </div>

          {/* Sailing management btns */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-ink mb-3">Sailing Management</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddSailing(true)}
                className="px-6 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors"
              >
                Add Sailing
              </button>
              <button
                onClick={() => setShowUpdateSailing(true)}
                className="px-6 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors"
              >
                Update Sailing
              </button>
            </div>
          </div>

          {/* update management btns */}
          <div>
            <h3 className="text-lg font-semibold text-blue-ink mb-3">Update Management</h3>
            <div className="flex gap-4">
              <button
                onClick={() =>setShowAddUpdate(true)}
                className="px-6 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors"
              >
                Post Update
              </button>
              <button
                onClick={() => setShowManageUpdates(true)}
                className="px-6 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors"
              >
                Edit Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* to conditionally render the forms, will be replaced eventually (not anytime soon though) */}
      {showAddVessel && (
        <AddVesselForm
          onClose={() => setShowAddVessel(false)}
          onSuccess={handleVesselAdded}
        />
      )}

      {showAddSailing && (
        <AddSailingForm
          onClose={() => setShowAddSailing(false)}
          onSuccess={handleSailingAdded}
        />
      )}

      {showUpdateVessel && (
        <UpdateVesselForm
          onClose={() => setShowUpdateVessel(false)}
          onSuccess={handleVesselUpdated}
        />
      )}

      {showUpdateSailing && (
        <UpdateSailingForm
          onClose={() => setShowUpdateSailing(false)}
          onSuccess={handleSailingUpdated}
        />
      )}

      {showAddUpdate && (
        <AddUpdateForm
          onClose={() => setShowAddUpdate(false)}
          onSuccess={handleUpdateAdded}
        />
      )}

      {showManageUpdates && (
        <ManageUpdatesForm
          onClose={() => setShowManageUpdates(false)}
          onSuccess={handleUpdateManaged}
        />
      )}
    </div>
  );
}
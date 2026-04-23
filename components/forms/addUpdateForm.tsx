"use client";

import { useState, useEffect } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { collection, addDoc, Timestamp, getDocs, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TextField, Label, Input, TextArea } from "@heroui/react";

interface AddUpdateFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUpdateForm({ onClose, onSuccess }: AddUpdateFormProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<"general" | "sailing">("general");
  const [sailingId, setSailingId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [sailings, setSailings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load sailings for dropdown
    const loadSailings = async () => {
      const sailingsSnapshot = await getDocs(collection(db, "sailings"));
      const sailingsData = sailingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSailings(sailingsData);
    };
    loadSailings();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user info
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      let imageUrl = undefined;

      // Upload image if provided
      if (image) {
        const imageRef = ref(storage, `updates/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Create update document
      const updateData: any = {
        title,
        subtitle,
        body,
        type,
        createdAt: Timestamp.now(),
        createdBy: {
          uid: user.uid,
          firstName: userData?.firstName || "Unknown",
          lastName: userData?.lastName || "User",
        },
        editHistory: [],
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      if (type === "sailing" && sailingId) {
        updateData.sailingId = sailingId;
      }

      await addDoc(collection(db, "updates"), updateData);

      alert("Update created successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating update:", error);
      alert("Failed to create update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-light-surface rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-ink mb-6">Create Update</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <TextField isRequired value={title} onChange={setTitle}>
            <Label className="text-sm font-semibold text-blue-ink mb-2">Title</Label>
            <Input 
              placeholder="Update title" 
              className="w-full px-4 py-3 rounded-lg border border-blue-ink/20"
            />
          </TextField>

          <TextField isRequired value={subtitle} onChange={setSubtitle}>
            <Label className="text-sm font-semibold text-blue-ink mb-2">Subtitle</Label>
            <Input 
              placeholder="Brief subtitle" 
              className="w-full px-4 py-3 rounded-lg border border-blue-ink/20"
            />
          </TextField>

          <TextField isRequired value={body} onChange={setBody}>
            <Label className="text-sm font-semibold text-blue-ink mb-2">Body</Label>
            <TextArea 
              placeholder="Update content" 
              className="w-full px-4 py-3 rounded-lg border border-blue-ink/20 min-h-32"
            />
          </TextField>

          <div>
            <Label className="text-sm font-semibold text-blue-ink mb-2">Type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "general" | "sailing")}
              className="w-full px-4 py-3 rounded-lg border text-blue-ink border-blue-ink/20"
            >
              <option value="general">General Update</option>
              <option value="sailing">Sailing-Specific</option>
            </select>
          </div>

          {type === "sailing" && (
            <div>
              <Label className="text-sm font-semibold text-blue-ink mb-2">Sailing</Label>
              <select
                value={sailingId}
                onChange={(e) => setSailingId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-blue-ink border border-blue-ink/20"
              >
                <option value="">Select a sailing...</option>
                {sailings.map(sailing => (
                  <option key={sailing.id} value={sailing.id}>
                    {sailing.sailingId} - {sailing.departurePort} to {sailing.arrivalPort}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label className="text-sm font-semibold text-blue-ink mb-2">Image (Optional)</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 rounded-lg border border-blue-ink/20"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-ink text-light-surface rounded-lg font-medium hover:bg-blue-ink/90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
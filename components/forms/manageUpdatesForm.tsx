"use client";

import { useState, useEffect } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, Timestamp, getDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TextField, Label, Input, TextArea } from "@heroui/react";

interface ManageUpdatesFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManageUpdatesForm({ onClose, onSuccess }: ManageUpdatesFormProps) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  
  // Edit form fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    const updatesSnapshot = await getDocs(collection(db, "updates"));
    const updatesData = updatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by creation date (newest first)
    updatesData.sort((a: any, b: any) => b.createdAt.toMillis() - a.createdAt.toMillis());
    setUpdates(updatesData);
  };

  const handleEdit = (update: any) => {
    setSelectedUpdate(update);
    setTitle(update.title);
    setSubtitle(update.subtitle);
    setBody(update.body);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUpdate) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      let imageUrl = selectedUpdate.imageUrl;

      // Upload new image if provided
      if (image) {
        const imageRef = ref(storage, `updates/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Track what changed
      const changes: any = {};
      if (title !== selectedUpdate.title) changes.title = title;
      if (subtitle !== selectedUpdate.subtitle) changes.subtitle = subtitle;
      if (body !== selectedUpdate.body) changes.body = body;
      if (imageUrl !== selectedUpdate.imageUrl) changes.imageUrl = imageUrl;

      // Create edit history entry
      const editEntry = {
        editedAt: Timestamp.now(),
        editedBy: {
          uid: user.uid,
          firstName: userData?.firstName || "Unknown",
          lastName: userData?.lastName || "User",
        },
        changes,
      };

      // Update the document
      const updateRef = doc(db, "updates", selectedUpdate.id);
      await updateDoc(updateRef, {
        title,
        subtitle,
        body,
        imageUrl,
        editHistory: arrayUnion(editEntry),
        lastEditedAt: Timestamp.now(),
        lastEditedBy: {
          uid: user.uid,
          firstName: userData?.firstName || "Unknown",
          lastName: userData?.lastName || "User",
        },
      });

      alert("Update saved successfully!");
      setEditing(false);
      setSelectedUpdate(null);
      loadUpdates();
    } catch (error) {
      console.error("Error saving update:", error);
      alert("Failed to save update");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return;

    try {
      await deleteDoc(doc(db, "updates", updateId));
      alert("Update deleted successfully!");
      loadUpdates();
    } catch (error) {
      console.error("Error deleting update:", error);
      alert("Failed to delete update");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-light-surface rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-ink mb-6">Manage Updates</h2>

        {!editing ? (
          // List view
          <div className="space-y-4">
            {updates.map(update => (
              <div key={update.id} className="border border-blue-ink/20 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-ink">{update.title}</h3>
                    <p className="text-sm text-blue-ink/60">{update.subtitle}</p>
                    <p className="text-xs text-blue-ink/40 mt-2">
                      Created by {update.createdBy.firstName} {update.createdBy.lastName} on{" "}
                      {update.createdAt.toDate().toLocaleDateString()}
                    </p>
                    {update.lastEditedAt && (
                      <p className="text-xs text-blue-ink/40">
                        Last edited by {update.lastEditedBy.firstName} {update.lastEditedBy.lastName} on{" "}
                        {update.lastEditedAt.toDate().toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(update)}
                      className="px-4 py-2 bg-blue-ink text-light-surface rounded-lg text-sm hover:bg-blue-ink/90"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Edit view
          <form className="space-y-4">
            <TextField isRequired value={title} onChange={setTitle}>
              <Label className="text-sm font-semibold text-blue-ink mb-2">Title</Label>
              <Input className="w-full px-4 py-3 rounded-lg border border-blue-ink/20" />
            </TextField>

            <TextField isRequired value={subtitle} onChange={setSubtitle}>
              <Label className="text-sm font-semibold text-blue-ink mb-2">Subtitle</Label>
              <Input className="w-full px-4 py-3 rounded-lg border border-blue-ink/20" />
            </TextField>

            <TextField isRequired value={body} onChange={setBody}>
              <Label className="text-sm font-semibold text-blue-ink mb-2">Body</Label>
              <TextArea className="w-full px-4 py-3 rounded-lg border border-blue-ink/20 min-h-32" />
            </TextField>

            <div>
              <Label className="text-sm font-semibold text-blue-ink mb-2">Change Image (Optional)</Label>
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
                onClick={() => {
                  setEditing(false);
                  setSelectedUpdate(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-ink text-light-surface rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {!editing && (
          <button
            onClick={onClose}
            className="mt-6 w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
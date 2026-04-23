'use client';

//form to update an existing sailing

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Sailing, SailingStatus, PortName } from '@/lib/types/sailingTypes';
import { Vessel } from '@/lib/types/vesselTypes';

interface UpdateSailingFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateSailingForm({ onClose, onSuccess }: UpdateSailingFormProps) {
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedSailing, setSelectedSailing] = useState<Sailing | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
// form data initializes empty, populates when vessel is selected
  const [formData, setFormData] = useState({
    vesselCallsign: '',
    departurePort: '' as PortName | '',
    arrivalPort: '' as PortName | '',
    departureDate: '',
    departureTime: '',
    status: 'scheduled' as SailingStatus,
    notes: '',
  });

  // load sailings and vessels
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sailingsSnapshot, vesselsSnapshot] = await Promise.all([
          getDocs(collection(db, 'sailings')),
          getDocs(collection(db, 'vessels')),
        ]);

        const sailingsData = sailingsSnapshot.docs.map(doc => doc.data() as Sailing);
        const vesselsData = vesselsSnapshot.docs.map(doc => doc.data() as Vessel);

        // sort sailings by departure time (most recent first)
        sailingsData.sort((a, b) => b.departureTime.toMillis() - a.departureTime.toMillis());

        setSailings(sailingsData);
        setVessels(vesselsData);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadData();
  }, []);

  // update selected vessel when vessel callsign changes
  useEffect(() => {
    const vessel = vessels.find(v => v.callsign === formData.vesselCallsign);
    setSelectedVessel(vessel || null);
  }, [formData.vesselCallsign, vessels]);

  const handleSailingSelect = (sailingId: string) => {
    const sailing = sailings.find(s => s.id === sailingId);
    if (sailing) {
      setSelectedSailing(sailing);

      const departureDate = sailing.departureTime.toDate();
      const dateStr = departureDate.toISOString().split('T')[0];
      const timeStr = departureDate.toTimeString().slice(0, 5);

      setFormData({
        vesselCallsign: sailing.vesselCallsign,
        departurePort: sailing.departurePort,
        arrivalPort: sailing.arrivalPort,
        departureDate: dateStr,
        departureTime: timeStr,
        status: sailing.status,
        notes: sailing.notes || '',
      });
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedSailing || !selectedVessel) {
      setError('Please select a sailing to update');
      setLoading(false);
      return;
    }

    try {
      const departureDateTimeString = `${formData.departureDate}T${formData.departureTime}`;
      const departureDate = new Date(departureDateTimeString);
      const arrivalDate = new Date(departureDate.getTime() + selectedVessel.approximateDuration * 60000);

      const updatedSailing = {
        vesselCallsign: formData.vesselCallsign,
        departurePort: formData.departurePort as PortName,
        arrivalPort: formData.arrivalPort as PortName,
        departureTime: Timestamp.fromDate(departureDate),
        arrivalTime: Timestamp.fromDate(arrivalDate),
        status: formData.status,
        ...(formData.notes && { notes: formData.notes }),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'sailings', selectedSailing.id), updatedSailing);

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating sailing:', err);
      setError('Failed to update sailing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-gray-900">
        <h2 className="text-2xl font-bold mb-6">Update Sailing</h2>

        {/* sailing selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-900">
            Select Sailing to Update *
          </label>
          <select
            value={selectedSailing?.id || ''}
            onChange={(e) => handleSailingSelect(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
          >
            <option value="">Choose a sailing...</option>
            {sailings.map(sailing => {
              const vessel = vessels.find(v => v.callsign === sailing.vesselCallsign);
              const depTime = sailing.departureTime.toDate();
              return (
                <option key={sailing.id} value={sailing.id}>
                  {sailing.id} - {vessel?.name} - {depTime.toLocaleDateString()} {depTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </option>
              );
            })}
          </select>
        </div>

        {selectedSailing && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* sailing ID (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Sailing ID (Cannot be changed)
              </label>
              <input
                type="text"
                value={selectedSailing.id}
                disabled
                className="w-full border border-gray-400 rounded px-3 py-2 bg-gray-100 text-gray-900"
              />
            </div>

            {/* vessel */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Vessel *</label>
              <select
                name="vesselCallsign"
                value={formData.vesselCallsign}
                onChange={handleChange}
                required
                className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              >
                {vessels.filter(v => v.vesselType === 'passenger' && v.isActive).map(vessel => (
                  <option key={vessel.callsign} value={vessel.callsign}>
                    {vessel.name} ({vessel.callsign})
                  </option>
                ))}
              </select>
            </div>

            {/* ports */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Departure Port *</label>
                <select
                  name="departurePort"
                  value={formData.departurePort}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
                >
                  <option value="">Select port</option>
                  <option value="POS">Port of Spain</option>
                  <option value="TBG">Scarborough</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Arrival Port *</label>
                <select
                  name="arrivalPort"
                  value={formData.arrivalPort}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
                >
                  <option value="">Select port</option>
                  <option value="POS">Port of Spain</option>
                  <option value="TBG">Scarborough</option>
                </select>
              </div>
            </div>

            {/* departure date/time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Departure Date *</label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Departure Time *</label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
                />
              </div>
            </div>

            {/* status */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              >
                <option value="scheduled">Scheduled</option>
                <option value="departed">Departed</option>
                <option value="arrived">Arrived</option>
                <option value="cancelled">Cancelled</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>

            {/* notes */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-400 rounded bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border-red-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-gray-900"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Sailing'}
              </button>
            </div>
          </form>
        )}

        {!selectedSailing && (
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-400 rounded bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border-red-500"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
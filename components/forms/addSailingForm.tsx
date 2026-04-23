'use client';

// form to add a new sailing

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, Timestamp } from 'firebase/firestore';
import { Sailing, SailingStatus, PortName } from '@/lib/types/sailingTypes';
import { Vessel } from '@/lib/types/vesselTypes';

interface AddSailingFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSailingForm({ onClose, onSuccess }: AddSailingFormProps) {
  // load available vessels from Firestore
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  // form data
  const [formData, setFormData] = useState({
    vesselCallsign: '',
    departurePort: '' as PortName | '',
    arrivalPort: '' as PortName | '',
    departureDate: '', 
    departureTime: '',  
    status: 'scheduled' as SailingStatus,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // load vessels when component mounts
  useEffect(() => {
    const loadVessels = async () => {
      try {
        const vesselsSnapshot = await getDocs(collection(db, 'vessels'));
        const vesselsData = vesselsSnapshot.docs.map(doc => doc.data() as Vessel);
        // only show active passenger vessels
        const passengerVessels = vesselsData.filter(
          v => v.vesselType === 'passenger' && v.isActive
        );
        setVessels(passengerVessels);
      } catch (err) {
        console.error('Error loading vessels:', err);
      }
    };

    loadVessels();
  }, []);

  // update selected vessel when callsign changes
  useEffect(() => {
    const vessel = vessels.find(v => v.callsign === formData.vesselCallsign);
    setSelectedVessel(vessel || null);
  }, [formData.vesselCallsign, vessels]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedVessel) {
      setError('Please select a vessel');
      setLoading(false);
      return;
    }

    if (!formData.departurePort || !formData.arrivalPort) {
      setError('Please select departure and arrival ports');
      setLoading(false);
      return;
    }

    try {
      // combine date and time into a single Date object
      const departureDateTimeString = `${formData.departureDate}T${formData.departureTime}`;
      const departureDate = new Date(departureDateTimeString);

      // calculate arrival time by adding vessel's duration value to the departure time
      const arrivalDate = new Date(departureDate.getTime() + selectedVessel.approximateDuration * 60000);

      // generate a readable sailing ID based on vessel callsign and departure date+time to make CALLSIGN-YYMMDD-HHMM
      const year = departureDate.getFullYear().toString().slice(-2);
      const month = (departureDate.getMonth() + 1).toString().padStart(2, '0');
      const day = departureDate.getDate().toString().padStart(2, '0');
      const hours = departureDate.getHours().toString().padStart(2, '0');
      const minutes = departureDate.getMinutes().toString().padStart(2, '0');

      const sailingId = `${formData.vesselCallsign}-${year}${month}${day}-${hours}${minutes}`;

      // create sailing object
      const sailing: Sailing = {
        id: sailingId,
        vesselCallsign: formData.vesselCallsign,
        departurePort: formData.departurePort as PortName,
        arrivalPort: formData.arrivalPort as PortName,
        departureTime: Timestamp.fromDate(departureDate),
        arrivalTime: Timestamp.fromDate(arrivalDate),
        status: formData.status,
        ...(formData.notes && { notes: formData.notes }), // prevents undefined value errors from firebase
        availableCapacity: {
          premium: selectedVessel.passengerCapacity.premium,
          economy: selectedVessel.passengerCapacity.economy,
          laneMeters: selectedVessel.vehicleCapacity.laneMeters,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // save sailig obj to firestore using sailingId as doc ID
      await setDoc(doc(db, 'sailings', sailingId), sailing);

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding sailing:', err);
      setError('Failed to add sailing. Please try again.');
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
        <h2 className="text-2xl font-bold mb-6">Add New Sailing</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* vessel selection */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Vessel *
            </label>
            <select
              name="vesselCallsign"
              value={formData.vesselCallsign}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
            >
              <option value="">Select a vessel</option>
              {vessels.map(vessel => (
                <option key={vessel.callsign} value={vessel.callsign}>
                  {vessel.name} ({vessel.callsign})
                </option>
              ))}
            </select>
            {selectedVessel && (
              <p className="text-xs text-gray-900 mt-1">
                Trip duration: {Math.floor(selectedVessel.approximateDuration / 60)}h {selectedVessel.approximateDuration % 60}m
              </p>
            )}
          </div>

          {/* ports */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Departure Port *
              </label>
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
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Arrival Port *
              </label>
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

          {/* departure date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Departure Date *
            </label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
            />
          </div>

          {/* departure time */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Departure Time *
            </label>
            <input
              type="time"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
            />
            {selectedVessel && formData.departureDate && formData.departureTime && (
              <p className="text-xs text-gray-500 mt-1">
                Estimated arrival: {new Date(
                  new Date(`${formData.departureDate}T${formData.departureTime}`).getTime() + 
                  selectedVessel.approximateDuration * 60000
                ).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </p>
            )}
          </div>

          {/* status */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Status *
            </label>
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

          {/* notes (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              placeholder="Add any special notes about this sailing (delays, cancellations, etc.)"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {/* action buttons */}
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
              {loading ? 'Saving...' : 'Add Sailing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
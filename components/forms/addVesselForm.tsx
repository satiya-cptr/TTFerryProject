'use client';

// form to add a new vessel

import { useState} from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { Vessel, VesselStatus, VesselType } from '@/lib/types/vesselTypes';

// props for what the parent provides
interface AddVesselFormProps {
  onClose: () => void; // close the form
  onSuccess: () => void;  // success callback
}

export default function AddVesselForm({ onClose, onSuccess }: AddVesselFormProps) {
  // form data state
  const [formData, setFormData] = useState({
    callsign: '',
    imo: '',
    name: '',
    vesselType: 'passenger' as VesselType, // default value
    status: 'active' as VesselStatus, // default value
    isActive: true,
    isAccessible: false,
    approximateDuration: '',
    premiumCapacity: '',
    economyCapacity: '',
    laneMeters: '',
  });

  // saving state 
  const [loading, setLoading] = useState(false);
  
  // state for errors
  const [error, setError] = useState('');

  // submission handler
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent page from rerefreshing
    setLoading(true);
    setError('');

    try {
      // create new vessel object
      const vessel: Vessel = {
        callsign: formData.callsign.toUpperCase(), // Force uppercase
        imo: formData.imo,
        name: formData.name,
        vesselType: formData.vesselType,
        status: formData.status,
        isActive: formData.isActive,
        isAccessible: formData.isAccessible,
        approximateDuration: parseInt(formData.approximateDuration),
        passengerCapacity: {
          premium: parseInt(formData.premiumCapacity),
          economy: parseInt(formData.economyCapacity),
        },
        vehicleCapacity: {
          laneMeters: parseFloat(formData.laneMeters),
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // save vessel obj to vessel collection with the callsign as the doc ID
      await setDoc(doc(db, 'vessels', vessel.callsign), vessel);

      // if successful, close the form and tell parent
      onSuccess();
      onClose();
    } catch (err) { // catch any errors
      console.error('Error adding vessel:', err);
      setError('Failed to add vessel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // function to handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // handle checkbox differently
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // the form
  return (
    // the overlay to dim background
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      {/* white form container */}
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Vessel</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* callsign */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Callsign *
            </label>
            <input
              type="text"
              name="callsign"
              value={formData.callsign}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              placeholder="e.g., 9YTB"
            />
          </div>

          {/* IMO */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              IMO Number *
            </label>
            <input
              type="text"
              name="imo"
              value={formData.imo}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              placeholder="e.g., 1234567"
            />
          </div>

          {/* name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Vessel Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              placeholder="e.g., T&T Spirit"
            />
          </div>

          {/* vessel type dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Vessel Type *
            </label>
            <select
              name="vesselType"
              value={formData.vesselType}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
            >
              <option value="passenger">Passenger (Ro-Ro)</option>
              <option value="cargo">Cargo</option>
            </select>
          </div>

          {/* status dropdown */}
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
              <option value="active">Active</option>
              <option value="moored">Moored</option>
              <option value="out_of_service">Out of Service</option>
            </select>
          </div>

          {/* approx duration */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Approximate Trip Duration (minutes) *
            </label>
            <input
              type="number"
              name="approximateDuration"
              value={formData.approximateDuration}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              placeholder="e.g., 150 (for 2.5 hours)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter duration in minutes (e.g., 150 for 2 hours 30 minutes)
            </p>
          </div>

          {/* Checkboxes in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2 text-gray-900"
                id="isActive"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                Vessel is currently active
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAccessible"
                checked={formData.isAccessible}
                onChange={handleChange}
                className="mr-2"
                id="isAccessible"
              />
              <label htmlFor="isAccessible" className="text-sm font-medium text-gray-900">
                Wheelchair accessible
              </label>
            </div>
          </div>

          {/* passenger capacities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Premium Capacity *
              </label>
              <input
                type="number"
                name="premiumCapacity"
                value={formData.premiumCapacity}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Economy Capacity *
              </label>
              <input
                type="number"
                name="economyCapacity"
                value={formData.economyCapacity}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              />
            </div>
          </div>

          {/* lane meters or vehicle capacity */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Vehicle Capacity (Lane Meters) *
            </label>
            <input
              type="number"
              name="laneMeters"
              value={formData.laneMeters}
              onChange={handleChange}
              required
              min="0"
              step="0.1"
              className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
            />
          </div>

          {/* error message */}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-gray-900"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Add Vessel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
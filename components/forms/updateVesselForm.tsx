'use client';

// form to update an existing vessel

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Vessel, VesselStatus, VesselType } from '@/lib/types/vesselTypes';

interface UpdateVesselFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateVesselForm({ onClose, onSuccess }: UpdateVesselFormProps) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // form data initializes empty, populates when vessel is selected
  const [formData, setFormData] = useState({
    callsign: '',
    imo: '',
    name: '',
    vesselType: 'passenger' as VesselType,
    status: 'active' as VesselStatus,
    isActive: true,
    isAccessible: false,
    approximateDuration: '',
    premiumCapacity: '',
    economyCapacity: '',
    laneMeters: '',
  });

  // load all vessels
  useEffect(() => {
    const loadVessels = async () => {
      try {
        const vesselsSnapshot = await getDocs(collection(db, 'vessels'));
        const vesselsData = vesselsSnapshot.docs.map(doc => doc.data() as Vessel);
        setVessels(vesselsData);
      } catch (err) {
        console.error('Error loading vessels:', err);
      }
    };

    loadVessels();
  }, []);

  // populate form when vessel is selected
  const handleVesselSelect = (callsign: string) => {
    const vessel = vessels.find(v => v.callsign === callsign);
    if (vessel) {
      setSelectedVessel(vessel);
      setFormData({
        callsign: vessel.callsign,
        imo: vessel.imo,
        name: vessel.name,
        vesselType: vessel.vesselType,
        status: vessel.status,
        isActive: vessel.isActive,
        isAccessible: vessel.isAccessible,
        approximateDuration: vessel.approximateDuration.toString(),
        premiumCapacity: vessel.passengerCapacity.premium.toString(),
        economyCapacity: vessel.passengerCapacity.economy.toString(),
        laneMeters: vessel.vehicleCapacity.laneMeters.toString(),
      });
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedVessel) {
      setError('Please select a vessel to update');
      setLoading(false);
      return;
    }

    try {
      const updatedVessel = {
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
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'vessels', selectedVessel.callsign), updatedVessel);

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating vessel:', err);
      setError('Failed to update vessel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-gray-900">
        <h2 className="text-2xl font-bold mb-6">Update Vessel</h2>

        {/* vessel selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Select Vessel to Update *
          </label>
          <select
            value={selectedVessel?.callsign || ''}
            onChange={(e) => handleVesselSelect(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
          >
            <option value="">Choose a vessel...</option>
            {vessels.map(vessel => (
              <option key={vessel.callsign} value={vessel.callsign}>
                {vessel.name} ({vessel.callsign})
              </option>
            ))}
          </select>
        </div>

        {selectedVessel && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* callsign (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Callsign (Cannot be changed)
              </label>
              <input
                type="text"
                value={formData.callsign}
                disabled
                className="w-full border border-gray-400 rounded px-3 py-2 bg-gray-100 text-gray-900"
              />
            </div>

            {/* IMO */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">IMO Number *</label>
              <input
                type="text"
                name="imo"
                value={formData.imo}
                onChange={handleChange}
                required
                className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              />
            </div>

            {/* name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Vessel Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900"
              />
            </div>

            {/* vessel type */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Vessel Type *</label>
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

            {/* status */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Status *</label>
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

            {/* duration */}
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
              />
            </div>

            {/* checkboxes */}
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
                  className="mr-2 text-gray-900"
                  id="isAccessible"
                />
                <label htmlFor="isAccessible" className="text-sm font-medium text-gray-900">
                  Wheelchair accessible
                </label>
              </div>
            </div>

            {/* capacities */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Premium Capacity *</label>
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
                <label className="block text-sm font-medium mb-1 text-gray-900">Economy Capacity *</label>
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

            {/* lane meters */}
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-gray-900"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Vessel'}
              </button>
            </div>
          </form>
        )}

        {!selectedVessel && (
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
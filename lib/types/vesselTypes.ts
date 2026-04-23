// Model for vessel docs in Firestore
// Vehicle capacity is measured in lane meters, and the values are approx 90% of the actual manufacturer specs
// to account for maneuvering and safety margins and various cofigurations

// values obtained via manufacturer datasheets and official websites

import { Timestamp } from 'firebase/firestore';

// type options
export type VesselType = 'passenger' | 'cargo';

// status options
export type VesselStatus = 'active' | 'moored' | 'out_of_service';

// What a vessel document looks like in Firestore
export interface Vessel {
  callsign: string; // Also the doc ID
  imo: string; // International Maritime Organization number
  name: string; // vessel name
  vesselType: VesselType; // either 'passenger' or 'cargo'
  status: VesselStatus; // current status, either active, moored, or out of service
  isActive: boolean;  // for quick opterations check
  isAccessible: boolean;  // whether it can accommodate disabled passengers
  approximateDuration: number; // How long a crossing takes
  passengerCapacity: {
    premium: number; // premium class capacity
    economy: number; // economy class capacity
  };
  vehicleCapacity: {
    laneMeters: number;  // total available lane meters (for vehicles)
  };
  createdAt: Timestamp; // when it was created
  updatedAt: Timestamp; // last updated
}
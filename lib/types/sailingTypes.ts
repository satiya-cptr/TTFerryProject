// Model for sailing docs in Firestore

import { Timestamp } from 'firebase/firestore';

// sailing status
export type SailingStatus = 'scheduled' | 'departed' | 'arrived' | 'cancelled' | 'delayed';

// Port names
export type PortName = 'POS' | 'TBG';

// What a sailing document looks like in Firestore
export interface Sailing {
  id: string; // sailing ID, combination of vessel callsign + departure date & time
  vesselCallsign: string; // reference to vessel
  departurePort: PortName; // port of departure
  arrivalPort: PortName;  // port of arrival
  departureTime: Timestamp; // when it's scheduled to depart (date + time)
  arrivalTime: Timestamp; // estimated arrival time
  status: SailingStatus;  // sailing status from up there 
  notes?: string; // optional notes
  availableCapacity: { // remaining capacity (decreases with bookings)
    premium: number;
    economy: number;
    laneMeters: number;
  };
  createdAt: Timestamp;// when it was created
  updatedAt: Timestamp; // last updated
}
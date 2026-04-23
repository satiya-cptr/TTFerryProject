// This file defines all the vehicle types that can be accomodated on each vessel 
// prices have been adjusted from the real ferry service's prices to be a bit more realistic 

export interface VehicleType {
  id: string; // idtentifier
  displayName: string; // for the UI
  laneMeters: number; // amount of space it occupies
  sortOrder: number; // display order in UI
  description: string; // description for tooltips and stuff 
  price: number; // standard price for this vehicle type
}

export const VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'motorcycle',
    displayName: 'Motorcycle / Scooter',
    laneMeters: 2.5,
    sortOrder: 1,
    description: 'Standard 2-wheel vehicles, including mopeds.',
    price: 75,
  },
  {
    id: 'sedan',
    displayName: 'Standard Car',
    laneMeters: 4.5,
    sortOrder: 2,
    description: 'Sedans, hatchbacks, and coupes under 4.5m.',
    price: 150,
  },
  {
    id: 'suv', 
    displayName: 'SUV / 4x4',
    laneMeters: 5.5,
    sortOrder: 3,
    description: 'Crossovers, Jeeps, and larger 4x4 vehicles.',
    price: 175
  },
  {
    id: 'van',
    displayName: 'Passenger Van',
    laneMeters: 6.5,
    sortOrder: 4,
    description: 'Minivans and minibuses (max 12 seats).',
    price: 215
  },
  {
    id: 'truck',
    displayName: 'Pickup Truck',
    laneMeters: 7,
    sortOrder: 5,
    description: 'Standard pickups and light utility trucks.',
    price: 250
  },
];

export const getVehicleType = (id: string): VehicleType | undefined => {
  return VEHICLE_TYPES.find(type => type.id === id);
};
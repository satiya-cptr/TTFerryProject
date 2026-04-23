// This file defines all the passenger types that can be accomodated on each vessel
// Lead passengrs are any passenger type that can be the primary booker, so seniors and adults

// I've made some changes to the passenger types and pricing strcuture that the real ferry service uses

export interface PassengerType {
  id: string; // identifier
  displayName: string; // for the UI
  description: string; // description for tooltips and stuff 
  minAge: number; // minimum age for this passenger type
  maxAge: number; // maximum age for this passenger type
  requiresSeat: boolean; // whether this passenger type requires a seat (for capacity calculations)
  canBeLead: boolean; // whether this passenger type can be a lead passenger
  prices: {
    economy: number; // economy ticket price
    premium: number; // premium class ticket price
  };
  sortOrder?: number; // to specify display orde in UI
}

export const PASSENGER_TYPES: PassengerType[] = [
  {
    id: 'senior',
    displayName: 'Seniors',
    description: '60+ years of age',
    minAge: 60,
    maxAge: 150,
    requiresSeat: true,
    canBeLead: true,
    prices: {
      economy: 25,
      premium: 150,
    },
    sortOrder: 1,
  },
  {
    id: 'adult',
    displayName: 'Adults',
    description: '18-59 years of age',
    minAge: 18,
    maxAge: 59,
    requiresSeat: true,
    canBeLead: true,
    prices: {
      economy: 75,
      premium: 150,
    },
    sortOrder: 2,
  },
  {// new passenger type, 
    id: 'teen',
    displayName: 'Teens',
    description: '12-17 years of age',
    minAge: 12,
    maxAge: 17,
    requiresSeat: true,
    canBeLead: false,
    prices: {
      economy: 60,
      premium: 120,
    },
    sortOrder: 3,
  },
  {
    id: 'child',
    displayName: 'Children',
    description: '2-11 years of age',
    minAge: 3,
    maxAge: 11,
    requiresSeat: true,
    canBeLead: false,
    prices: {
      economy: 25,
      premium: 100,
    },
    sortOrder: 4,
  },
  {
    id: 'infant',
    displayName: 'Infants',
    description: '0-2 years of age',
    minAge: 0,
    maxAge: 2,
    requiresSeat: false,
    canBeLead: false,
    prices: {
      economy: 0,
      premium: 0,
    },
    sortOrder: 5,
  },
  {
    id: 'pet',
    displayName: 'Pets',
    // I don't actually know their pet policy, but this is what most other ferry services use
    description: 'Dogs, cats & birds (under 50lbs)', 
    minAge: 0,
    maxAge: 0,
    requiresSeat: false,
    canBeLead: false,
    // also don't know their pet pricing, but this seems like a reasonable handling fee 
    prices: {
      economy: 20,
      premium: 20,
    },
    sortOrder: 6,
  },
];

export const getPassengerType = (id: string): PassengerType | undefined => {
  return PASSENGER_TYPES.find(type => type.id === id);
}
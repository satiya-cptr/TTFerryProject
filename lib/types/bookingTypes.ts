import type { DateValue } from "@internationalized/date";

export interface BookingSearchCriteria {
  tripType: "oneway" | "round"; 
  
  route: {        
    from: string;
    to: string;
  };
  
  passengers: Record<string, number>; 
  vehicles: Record<string, number>; 
  
  outboundDate: DateValue;  
  returnDate: DateValue | null; 
}
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import TTWordmarkShort from "@/components/logos/ttWordMarkShort";

// Ticket component 
// Used for all ticket types (passenger, pet, vehicle), classes (economy, premium), and states

interface FerryTicketProps {
  passenger?: {
    firstName: string;
    lastName: string;
    type: string;
  };
  
  pet?: {
    petType: string;
    weight: number;
  };
  
  vehicle?: {
    type: string;
    registration: string;
  };
  driver?: {
    firstName: string;
    lastName: string;
  };
  
  sailing: {
    departurePort: string;
    arrivalPort: string;
    departureTime: any;
    arrivalTime: any;
    sailingId: string;
    ticketClass: "economy" | "premium";
  };
  
  tripType: string;
  bookingRef: string;
  
  passengerIndex?: number;
  petIndex?: number;
}

export default function FerryTicket({
  passenger,
  pet,
  vehicle,
  driver,
  sailing,
  tripType,
  bookingRef,
}: FerryTicketProps) {
  
  // determine ticket type
  let ticketType: "passenger" | "pet" | "vehicle" = "passenger";
  if (pet) ticketType = "pet";
  if (vehicle) ticketType = "vehicle";
  
  // get stripe color
  const getStripeColor = () => {
    if (ticketType === "passenger") return "#4BAFBE";
    if (ticketType === "pet") return "#FFF200";
    if (ticketType === "vehicle") return "#DC308F";
    return "#4BAFBE";
  };
  
  const stripeColor = getStripeColor();
  const ticketClass = sailing.ticketClass;
  
  const departureTime = sailing.departureTime.toDate();
  const arrivalTime = sailing.arrivalTime.toDate();
  
  const departureTimeStr = departureTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  
  const arrivalTimeStr = arrivalTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  
  const dateStr = departureTime.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  }).toUpperCase();
  
  // Port names
  const getPortName = (code: string) => {
    return code === "POS" ? "PORT-OF-SPAIN" : "SCARBOROUGH";
  };
  
  const fromPort = sailing.departurePort;
  const toPort = sailing.arrivalPort;
  
  // Ticket holder info
  let holderHeader = "";
  let holderValue = "";
  
  if (passenger) {
    holderHeader = "PASSENGER";
    holderValue = `${passenger.firstName} ${passenger.lastName}`.toUpperCase();
  } else if (pet) {
    holderHeader = "PET TYPE";
    holderValue = `${pet.petType.toUpperCase()}, ${pet.weight}KG`;
  } else if (vehicle) {
    holderHeader = "VEHICLE";
    const vehicleTypeName = vehicle.type.replace(/-/g, " ").toUpperCase();
    holderValue = `${vehicleTypeName}, ${vehicle.registration}`;
  }

  return (
  <div className="relative w-full max-w-[296px] mx-auto">
    
    {/* base w/ cutouts on the top, bottom, and sides */}
    <div 
      className="relative bg-light-teal/80 rounded-[20px] p-[22px]"
      style={{
        WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cmask id='ticket-cutouts'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3Ccircle cx='50%25' cy='0' r='16' fill='black'/%3E%3Ccircle cx='50%25' cy='100%25' r='16' fill='black'/%3E%3Ccircle cx='0' cy='270' r='10' fill='black'/%3E%3Ccircle cx='100%25' cy='270' r='10' fill='black'/%3E%3C/mask%3E%3Crect width='100%25' height='100%25' fill='black' mask='url(%23ticket-cutouts)'/%3E%3C/svg%3E")`,
        maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cmask id='ticket-cutouts'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3Ccircle cx='50%25' cy='0' r='16' fill='black'/%3E%3Ccircle cx='50%25' cy='100%25' r='16' fill='black'/%3E%3Ccircle cx='0' cy='270' r='10' fill='black'/%3E%3Ccircle cx='100%25' cy='270' r='10' fill='black'/%3E%3C/mask%3E%3Crect width='100%25' height='100%25' fill='black' mask='url(%23ticket-cutouts)'/%3E%3C/svg%3E")`,
      }}
    >
      <div 
        className="absolute inset-0 opacity-[0.7] pointer-events-none"
        style={{
          backgroundImage: "url('/images/tamper-wave.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* side stripes */}
      {ticketClass === "economy" ? (
        <>
          <div 
            className="absolute left-0 top-[60px] bottom-[88px] w-[12px]"
            style={{ backgroundColor: stripeColor }}
          />
          <div 
            className="absolute right-0 top-[60px] bottom-[88px] w-[12px]"
            style={{ backgroundColor: stripeColor }}
          />
        </>
      ) : (
        <>
          <div 
            className="absolute left-0 top-[60px] bottom-[88px] w-[8px]"
            style={{ backgroundColor: stripeColor }}
          />
          <div 
            className="absolute left-[12px] top-[60px] bottom-[88px] w-[2px]"
            style={{ backgroundColor: stripeColor }}
          />
          <div 
            className="absolute right-0 top-[60px] bottom-[88px] w-[8px]"
            style={{ backgroundColor: stripeColor }}
          />
          <div 
            className="absolute right-[12px] top-[60px] bottom-[88px] w-[2px]"
            style={{ backgroundColor: stripeColor }}
          />
        </>
      )}
      
      {/* content */}
      <div className="relative">
        
        <TTWordmarkShort className="w-[40px] h-auto text-blue-ink" />
        
        {/* sailing data */}
        <div className="mt-[30px]">
          
          {/* route */}
          <div className="flex items-center justify-between mb-[18px]">
            <div>
              <div className="text-2xs font-extrabold text-blue-ink uppercase">
                {getPortName(fromPort)}
              </div>
              <div className="text-[42px] font-bold text-blue-ink leading-none mt-[2px]">
                {fromPort}
              </div>
            </div>
            
            <div className="flex-shrink-0 mx-2">
              <HugeiconsIcon icon={ArrowRight02Icon} size={30} strokeWidth={2} className="text-blue-ink" />
            </div>
            
            <div className="text-right">
              <div className="text-2xs font-extrabold text-blue-ink uppercase">
                {getPortName(toPort)}
              </div>
              <div className="text-[42px] font-bold text-blue-ink leading-none mt-[2px]">
                {toPort}
              </div>
            </div>
          </div>
          
          {/* departure, arrival, and date */}
          <div className="flex justify-between mb-[12px]">
            <div>
              <div className="text-2xs font-extrabold text-blue-ink uppercase">DEPARTURE</div>
              <div className="text-xl font-medium text-blue-ink mt-[2px]">{departureTimeStr}</div>
            </div>
            <div>
              <div className="text-2xs font-extrabold text-blue-ink uppercase">ARRIVAL</div>
              <div className="text-xl font-medium text-blue-ink mt-[2px]">{arrivalTimeStr}</div>
            </div>
            <div>
              <div className="text-2xs font-extrabold text-blue-ink uppercase">DATE</div>
              <div className="text-xl font-medium text-blue-ink mt-[2px]">{dateStr}</div>
            </div>
          </div>
          
          {/* sailing id */}
          <div>
            <div className="text-2xs font-extrabold text-blue-ink uppercase">SAILING</div>
            <div className="text-xl font-medium text-blue-ink mt-[2px]">{sailing.sailingId}</div>
          </div>
        </div>
        
        {/* divider */}
        <div className="my-[18px]">
          <svg className="w-full" height="1">
            <line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" className="text-blue-ink"/>
          </svg>
        </div>
        
        {/* booking details */}
        <div>
          {/* ticket holder */}
          <div className="mb-[12px]">
            <div className="text-2xs font-extrabold text-blue-ink uppercase">{holderHeader}</div>
            <div className="text-xl font-bold text-blue-ink uppercase mt-[2px] line-clamp-2">
              {holderValue}
            </div>
          </div>
          
          {/* class & booking ref */}
          <div className="flex justify-between mb-[24px]">
            <div>
              <div className="text-2xs font-extrabold text-blue-ink uppercase">CLASS</div>
              <div className="text-xl font-medium text-blue-ink mt-[2px]">
                {ticketClass === "economy" ? "ECO" : "PRE"}
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xs font-extrabold text-blue-ink uppercase">BOOKING REF</div>
              <div className="text-xl font-medium text-blue-ink mt-[2px]">{bookingRef}</div>
            </div>
          </div>
          
          {/* QR code  */}
          <div className="flex justify-center mb-[28px]">
            <div className="w-[124px] h-[124px] bg-light-surface rounded-[12px] border border-blue-ink/20 flex items-center justify-center">
              <span className="text-xs text-blue-ink/40">QR CODE</span>
            </div>
          </div>
          
          {/* footer */}
          <div className="text-3xs text-blue-ink/60 leading-tight">
            <span className="font-bold uppercase">NOTE:</span> This ticket is valid only for the specified date and sailing. Boarding closes 15 minutes prior to departure. TT Ferry reserves the right to refuse passage or adjust schedules for any reason. Possession of this ticket constitutes acceptance of the full TTIT and TT Ferry Terms & Conditions.
          </div>
        </div>
        
      </div>
    </div>
  </div>
);
}
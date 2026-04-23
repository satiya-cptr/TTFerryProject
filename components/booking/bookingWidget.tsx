"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import RollingText from "../ui/rollingText";
import { motion } from "motion/react";
import RouteSwitcher from "./routeSwitcher";
import { VEHICLE_TYPES } from "@/lib/types/vehicleTypes";
import { PASSENGER_TYPES } from "@/lib/types/passengerTypes";
import type { DateValue } from "@internationalized/date";
import { getLocalTimeZone, today } from "@internationalized/date";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar04Icon, UserMultipleIcon, Car02Icon, Search01Icon, } from "@hugeicons/core-free-icons";
import {  Popover,  NumberField,  Label,  Description,  Button, Calendar, toast} from "@heroui/react";


export default function BookingWidget() {
  const router = useRouter();

  const [tripType, setTripType] = useState<"oneway" | "round">("oneway");

  const [route, setRoute] = useState({ from: "POS", to: "TBG" });

  // useCallback to prevent re-rendering the routeswitcher every time 
  // which caused issues aplenty 
  const handleRouteChange = useCallback((from: string, to: string) => {
    setRoute({ from, to });
  }, []);

  // State for passengers and vehicles
  const [passengers, setPassengers] = useState<Record<string, number>>({
    senior: 0,
    adult: 1, // always starts with 1 Adult
    teen: 0,
    child: 0,
    infant: 0,
    pet: 0,
  });

  const [vehicles, setVehicles] = useState<Record<string, number>>({
    motorcycle: 0,
    sedan: 0,
    suv: 0,
    van: 0,
    truck: 0,
  });

  const currentDate = today(getLocalTimeZone());
  const minDate =  today(getLocalTimeZone()).add({ days: 1 });
  const [outboundDate, setOutboundDate] = useState<DateValue | null>(minDate);
  const [returnDate, setReturnDate] = useState<DateValue | null>(null);

  // Logic for constraints
  const totalPassengers = Object.values(passengers).reduce((a, b) => a + b, 0);
  const leadPassengers = PASSENGER_TYPES
    .filter(t => t.canBeLead)
    .reduce((sum, type) => sum + (passengers[type.id] || 0), 0);

  // Calculate total vehicles across all types
  const totalVehicles = Object.values(vehicles).reduce((a, b) => a + b, 0);

  const updatePassengers = (id: string, val: number) => {
    setPassengers(prev => ({ ...prev, [id]: val }));
  };

  const updateVehicles = (id: string, val: number) => {
    setVehicles(prev => ({ ...prev, [id]: val }));
  };

  // validate the criteria
  const validateSearch = () => {
    const errors: string[] = [];

    // Must have at least one lead passenger (Adult or Senior)
    if (leadPassengers === 0) {
      errors.push("At least one Adult or Senior passenger is required");
    }

    // Can't exceed 8 passengers
    if (totalPassengers > 8) {
      errors.push("Maximum 8 passengers allowed");
    }

    // Must select departure date
    if (!outboundDate) {
      errors.push("Please select a departure date");
    }

    // Round trip needs return date
    if (tripType === "round" && !returnDate) {
      errors.push("Please select a return date for round trip");
    }

    // Vehicles can't exceed lead passengers
    if (totalVehicles > leadPassengers) {
      errors.push(`You can bring maximum ${leadPassengers} vehicle(s) based on lead passengers`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSearch = () => {
    // validate data
    const validation = validateSearch();
    // if not valid, show errors and stop
    if (!validation.isValid) {
      //toast.danger(validation.errors.join("\n"));
      alert(validation.errors.join("\n"));
      return; 
    }

    // bundle data together 
    const searchCriteria = {
      tripType,
      route,
      passengers,
      vehicles,
      outboundDate: outboundDate!.toString(), // Convert to string for storage
      returnDate: returnDate?.toString() || null, // Convert or null if not set
    };

    // save data to sessionStorage so it can be accessed on the next page (the sailing selection page)
    sessionStorage.setItem("bookingSearch", JSON.stringify(searchCriteria));

    // navigate to sailing selection page
    router.push("/book/select-sailing");
  };

  // hole dimensions to mask out the selector pill shape
  // so it kinda looks like the selector is cut out of the card 
  // downside is that it's static and if the selector changes size or position, the hole would have to be manually updated
  // but it works, so...yay
  const hole = {
    x: 15, // left position 
    y: -55, // top position 
    width: 205, 
    height: 72,
    radius: 36, 
  };


  return (
  <div className="relative w-full">
    
    {/* main card */}
    <div
      className="w-full bg-light-surface rounded-[20px] p-4 lg:px-6 lg:py-2 min-h-[103px] grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-center gap-4 lg:gap-3"
      style={{
        /* mask out the selector shape using the hole dimensions */
        WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cmask id='m'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3Crect x='${hole.x}' y='${hole.y}' width='${hole.width}' height='${hole.height}' rx='${hole.radius}' fill='black'/%3E%3C/mask%3E%3Crect width='100%25' height='100%25' fill='black' mask='url(%23m)'/%3E%3C/svg%3E")`,
        maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cmask id='m'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3Crect x='${hole.x}' y='${hole.y}' width='${hole.width}' height='${hole.height}' rx='${hole.radius}' fill='black'/%3E%3C/mask%3E%3Crect width='100%25' height='100%25' fill='black' mask='url(%23m)'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Content */}
      <div className="md:col-span-2 lg:col-span-1 lg:contents">
        <RouteSwitcher onRouteChange={handleRouteChange} />
      </div>

      <div className="hidden lg:block w-[1px] h-10 bg-blue-ink/10 mx-3 self-center" />

      {/* passengers */}
      <Popover>
        <Popover.Trigger>
          <Button variant="ghost" className="w-full lg:w-fit h-full flex flex-col items-start px-4 text-blue-ink hover:bg-transparent data-[pressed=true]:bg-transparent hover:opacity-70 active:scale-95 transition-all">
            <span className="text-xs uppercase font-bold text-blue-ink/60 mb-2">Passengers</span>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={UserMultipleIcon} size={18} className="text-blue-ink" strokeWidth={2.5} />
              <span className="font-bold text-base">{totalPassengers}</span>
            </div>
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-80 bg-light-surface shadow-xl rounded-3xl border border-blue-ink/5 overflow-y-auto">
          <Popover.Dialog className="p-6">
            <Popover.Heading className="text-xl font-extrabold text-blue-ink mb-6">Passengers</Popover.Heading>
    
            <div className="flex flex-col gap-6 max-h-[400px] pr-1">
              {PASSENGER_TYPES.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((type) => {
                const currentCount = passengers[type.id] || 0;
                const otherLeads = leadPassengers - currentCount;
                const finalMin = (type.canBeLead && otherLeads === 0) ? 1 : 0;

                return (
                  <CounterField 
                    key={type.id}
                    label={type.displayName} 
                    description={type.description}
                    value={currentCount}
                    minValue={finalMin}
                    maxValue={8 - (totalPassengers - currentCount)}
                    onChange={(v: number) => updatePassengers(type.id, v)}
                  />
                );
              })}
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>

      <div className="hidden lg:block w-[1px] h-10 bg-blue-ink/10 mx-3 self-center" />

      {/* vehicles */}
      <Popover>
        <Popover.Trigger>
          <Button variant="ghost" className="w-full lg:w-fit h-full flex flex-col items-start px-4 text-blue-ink hover:bg-transparent data-[pressed=true]:bg-transparent hover:opacity-70 active:scale-95 transition-all">
            <span className="text-xs uppercase font-bold text-blue-ink/60 mb-2">Vehicles</span>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Car02Icon} size={18} className="text-blue-ink" strokeWidth={2.5} />
              <span className="font-bold text-base">{totalVehicles}</span>
            </div>
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-80 bg-white shadow-xl rounded-3xl border border-blue-ink/5 overflow-y-auto">
          <Popover.Dialog className="p-6">
            <Popover.Heading className="text-xl font-extrabold text-blue-ink mb-2">Vehicles</Popover.Heading>
            <p className="text-[11px] text-blue-ink/40 mb-6 font-medium">Max {leadPassengers} based on Adults and Seniors</p>
            
            <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-1">
              {VEHICLE_TYPES.sort((a, b) => a.sortOrder - b.sortOrder).map((type) => {
                const currentCount = vehicles[type.id] || 0;
                return (
                  <CounterField 
                    key={type.id}
                    label={type.displayName} 
                    description={type.description}
                    value={currentCount}
                    minValue={0}
                    maxValue={leadPassengers - (totalVehicles - currentCount)}
                    onChange={(v: number) => updateVehicles(type.id, v)}
                  />
                );
              })}
            </div>
            
          </Popover.Dialog>
        </Popover.Content>
      </Popover>

      <div className="hidden lg:block w-[1px] h-10 bg-blue-ink/10 mx-3 self-center" />

      {/* outbound */}
      <CustomDatePicker 
        label="Departure"
        value={outboundDate}
        onChange={setOutboundDate}
        minValue={minDate}
        isDisabled={false}
      />

      <div className="hidden lg:block w-[1px] h-10 bg-blue-ink/10 mx-3 self-center" />

      {/* return date */}
      <CustomDatePicker 
        label="Return"
        value={returnDate}
        onChange={setReturnDate}
        minValue={outboundDate || minDate} 
        isDisabled={tripType === "oneway"}
      />

      {/* search btn */}
      <div className="flex items-center justify-center h-full md:col-span-2 lg:col-span-1 lg:ml-auto pt-4 lg:pt-0"> 
        <button 
          onClick={handleSearch} 
          className="group flex items-center justify-center transition-transform active:scale-95 w-full lg:w-fit h-fit"
        >
          <div className="p-2 rounded-full bg-blue-ink/5 border border-blue-ink/25 flex items-center justify-center shrink-0 w-full lg:w-fit">
            <div className="flex items-center justify-center px-5 py-3 bg-blue-ink bg-gradient-to-b from-blue-ink/20 36% via-[#0F2F4C] 77% to-light-surface/20 rounded-full hover:bg-blue-ink/90 transition-colors shrink-0 w-full lg:w-fit">
              <span className="text-light-surface font-medium text-lg whitespace-nowrap">
                Search Sailings
              </span>
              <div className="ml-2 flex items-center justify-center"> 
                <HugeiconsIcon icon={Search01Icon} size={20} className="text-light-surface" strokeWidth={2.5}/>
              </div>
            </div>
          </div>
        </button>
      </div>

    </div>

    {/* trip type selector */}
    <div className="absolute top-0 left-[24px] -translate-y-[45px] bg-light-surface rounded-full p-2 flex gap-2 shadow-sm">
      <motion.button
        onClick={() => setTripType("oneway")}
        className={` px-3 py-[13px] text-xs font-medium rounded-full transition-colors duration-200
          ${tripType === "oneway" ? "bg-blue-ink bg-gradient-to-b from-blue-ink/20 36% via-[#0F2F4C] 77% to-light-surface/20 text-light-surface" : "text-blue-ink"}
        `}
        initial="rest" whileHover="hover" animate="rest"
      >
        <RollingText primary="One Way" secondary="One Way" />
      </motion.button>

      <motion.button
        onClick={() => setTripType("round")}
        className={` px-3 py-[13px] text-xs font-medium rounded-full transition-colors duration-200
          ${tripType === "round" ? "bg-blue-ink bg-gradient-to-b from-blue-ink/20 36% via-[#0F2F4C] 77% to-light-surface/20 text-light-surface" : "text-blue-ink"}
        `}
        initial="rest" whileHover="hover" animate="rest"
      >
        <RollingText primary="Round Trip" secondary="Round Trip" />
      </motion.button>
    </div>
    
  </div>
);
}



//Custom counter field
function CounterField({ label, description, value, minValue, maxValue, onChange }: any) {
  return (
    <NumberField 
      onChange={onChange} 
      value={value} 
      minValue={minValue} 
      maxValue={maxValue}
      className="flex flex-row items-center justify-between w-full"
    >
      <div className="flex flex-col pr-2 flex-1 items-start">
        <Label className="text-sm font-extrabold text-blue-ink "> {label} </Label>
        <Description className="text-[11px] text-blue-ink/50 font-medium leading-normal m-0 p-0"> {description} </Description>
      </div>

      <NumberField.Group className="flex shrink-0 items-center  bg-blue-ink/5 p-1 rounded-xl border border-blue-ink/10">
        <NumberField.DecrementButton className="p-1 text-blue-ink/60 hover:text-blue-ink/80 transition-colors" />
        
        <NumberField.Input className="w-8 text-center bg-transparent border-none text-sm font-black text-blue-ink focus:outline-none p-0" />
        
        <NumberField.IncrementButton className="p-1 text-blue-ink/60 hover:text-blue-ink/80 transition-colors" />
      </NumberField.Group>
    </NumberField>
  );
}

// Custom Date Picker
// ran into some issues with the default date picker so I made my own
// those issues have since been resolved, but this works so I'm not changing it <3
function CustomDatePicker({ label, value, onChange, minValue, isDisabled }: any) {
  const [focusedDate, setFocusedDate] = useState(value || today(getLocalTimeZone()).add({ days: 1 }));

  const displayDate = value 
    ? value.toDate(getLocalTimeZone()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : "Select Date";

  return (
    <Popover >
      <Popover.Trigger>
        <Button 
          variant="ghost" 
          isDisabled={isDisabled}
          className={`h-full flex flex-col items-start px-4 text-blue-ink border-none transition-all active:scale-95 hover:bg-transparent data-[pressed=true]:bg-transparent hover:opacity-80 ${isDisabled ? 'opacity-25 grayscale cursor-not-allowed' : ''}`}
        >
          <span className="text-xs uppercase font-bold text-blue-ink/60 mb-2"> {label} </span>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Calendar04Icon} size={18} className="text-blue-ink" strokeWidth={2.5} />
            <span className="font-bold text-base">{displayDate}</span>
          </div>
        </Button>
      </Popover.Trigger>
      
      <Popover.Content className="p-2 bg-white shadow-2xl rounded-3xl border border-blue-ink/10 overflow-hidden">
        <Calendar 
          aria-label={label}
          focusedValue={focusedDate}
          value={value}
          onChange={onChange}
          onFocusChange={setFocusedDate}
          minValue={minValue}
          isDisabled={isDisabled}
          className="p-2"
        >
          <Calendar.Header className="flex items-center justify-between w-full">
            <Calendar.Heading className="text-sm font-extrabold text-blue-ink uppercase tracking-tight" />
            
            <Calendar.NavButton slot="previous" className="text-blue-ink" />
            <Calendar.NavButton slot="next" className="text-blue-ink" />
          </Calendar.Header>

          <Calendar.Grid className="mx-auto w-full border-collapse">
            <Calendar.GridHeader>
              {(day) => (
                <Calendar.HeaderCell className="text-[11px] font-black text-blue-ink/50">
                  {day}
                </Calendar.HeaderCell>
              )}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => (
                <Calendar.Cell 
                  date={date} 
                  className="font-bold text-sm text-blue-ink hover:bg-blue-ink/10 data-[selected=true]:bg-blue-ink data-[selected=true]:text-white data-[disabled=true]:opacity-20 data-[outside-month=true]:opacity-10 cursor-pointer transition-all"
                />
              )}
            </Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </Popover.Content>
    </Popover>
  );
}
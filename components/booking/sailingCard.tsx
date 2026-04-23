"use client";

// This is the sailing card used in the select-sailing page 

import { useState } from "react";
import { Popover, ListBox, Label, Description } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon, Ticket01Icon, TicketStarIcon } from "@hugeicons/core-free-icons";
import { motion } from "motion/react";
import { Sailing } from "@/lib/types/sailingTypes";
import { Vessel } from "@/lib/types/vesselTypes";

interface SailingCardProps {
  sailing: any;
  vessel?: any;
  isSelected: boolean;
  selectedClass: "economy" | "premium" | null;
  onSelect: (ticketClass: "economy" | "premium") => void;
  seatsNeeded: number;
}

export default function SailingCard({ 
  sailing, 
  vessel, 
  isSelected,
  selectedClass,
  onSelect,
  seatsNeeded
}: SailingCardProps) {
  const [tempClass, setTempClass] = useState<"economy" | "premium">("economy");
  const departureTime = sailing.departureTime.toDate();
  const arrivalTime = sailing.arrivalTime.toDate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-light-surface rounded-3xl shadow-md p-4 md:p-6 transition-all ${
      isSelected ? 'ring-1 md:ring-2 ring-blue-ink' : ''
    }`}>
      <div className="flex items-center justify-between">
        {/* sailing info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-lg md:text-2xl font-bold text-blue-ink">
              {departureTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </span>
            <span className="text-blue-ink/40">→</span>
            <span className="text-lg text-blue-ink/60">
              {arrivalTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          
          <p className="text-sm font-medium text-blue-ink mb-1">
            {vessel?.name || sailing.vesselCallsign}
          </p>
          
          <div className="hidden md:flex gap-4 text-xs text-blue-ink/60">
            <span>Premium: {sailing.availableCapacity.premium} seats</span>
            <span>Economy: {sailing.availableCapacity.economy} seats</span>
            <span>{sailing.availableCapacity.laneMeters.toFixed(0)}m vehicle space</span>
          </div>

          {isSelected && selectedClass && (
            <div className="mt-3 inline-block px-3 py-1 bg-blue-ink/10 rounded-full">
              <span className="text-xs font-bold text-blue-ink uppercase">
                {selectedClass} Selected
              </span>
            </div>
          )}
        </div>

        {/* select popover btn */}
        <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
          <Popover.Trigger>
            <button className="px-4 md:px-6 py-2 md:py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 transition-colors">
              {isSelected ? 'Change' : 'Select'}
            </button>
          </Popover.Trigger>
          
          <Popover.Content placement="top" className="mx-3 md:mx-0 w-full md:w-96 bg-light-surface shadow-2xl rounded-3xl border border-blue-ink/10 overflow-y-auto" >
            <Popover.Dialog className="p-6">
              <Popover.Heading className="text-lg md:text-xl font-bold text-blue-ink mb-4">
                Select Ticket Class
              </Popover.Heading>
              
              <ListBox 
                aria-label="Select Ticket Class"
                selectionMode="single"
                selectedKeys={new Set([tempClass])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as "economy" | "premium";
                  if (selected) setTempClass(selected);
                }}
                className="p-0 gap-2"
              >
                {/* economy */}
                <ListBox.Item 
                  id="economy" 
                  textValue="Economy"
                  className={`p-3 rounded-full transition-all ${
                    tempClass === 'economy' ? 'border-blue-ink bg-blue-ink/5' : 'border-transparent hover:bg-blue-ink/5'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`p-2 rounded-full ${tempClass === 'economy' ? 'bg-blue-ink text-white' : 'bg-blue-ink/10 text-blue-ink'}`}>
                      <HugeiconsIcon icon={Ticket01Icon} size={22} className="text-light-surface" />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <Label className="text-base font-bold text-blue-ink">Economy</Label>
                      <Description className="text-sm text-blue-ink/60">
                        {sailing.availableCapacity.economy} seats available
                      </Description>
                    </div>
                    <div className="ml-auto w-6 h-6 flex items-center justify-center mr-2">
                      {tempClass === 'economy' && ( 
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <HugeiconsIcon icon={Tick01Icon} size={20} className="text-blue-ink" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </ListBox.Item>

                {/* premium */}
                <ListBox.Item 
                  id="premium" 
                  textValue="Premium"
                  isDisabled={sailing.availableCapacity.premium < seatsNeeded}
                  className={`mt-2 p-3 rounded-full transition-all ${
                    tempClass === 'premium' ? 'border-blue-ink bg-blue-ink/5' : 'border-transparent hover:bg-blue-ink/5'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`p-2 rounded-full ${tempClass === 'premium' ? 'bg-blue-ink text-white' : 'bg-blue-ink/10 text-blue-ink'}`}>
                      <HugeiconsIcon icon={TicketStarIcon} size={22} className="text-light-surface" />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <Label className="text-base font-bold text-blue-ink">Premium</Label>
                      <Description className={`text-sm ${sailing.availableCapacity.premium < seatsNeeded ? 'text-red-500 font-medium' : 'text-blue-ink/60'}`}>
                        {sailing.availableCapacity.premium} seats available
                        {sailing.availableCapacity.premium < seatsNeeded && " — Not enough space"}
                      </Description>
                    </div>
                    <div className="ml-auto w-6 h-6 flex items-center justify-center mr-2">
                      {tempClass === 'premium' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <HugeiconsIcon icon={Tick01Icon} size={20} className="text-blue-ink" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </ListBox.Item>
              </ListBox>

              <button
                onClick={() => {
                  onSelect(tempClass);
                  setIsOpen(false);
                }}
                className="w-full mt-6 px-4 py-3 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90"
              >
                Confirm Selection
              </button>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </div>
    </div>
  );
}
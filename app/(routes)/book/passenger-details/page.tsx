"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {  Accordion,  Input,  Select, Label, ListBox, Button, Description, TextField, FieldError 
} from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {  Tick01Icon, UserIcon, Car02Icon, AlertCircleIcon, Bone01Icon, UserEdit01Icon } from "@hugeicons/core-free-icons";
import { PASSENGER_TYPES } from "@/lib/types/passengerTypes";
import { VEHICLE_TYPES } from "@/lib/types/vehicleTypes";
import { parseDate } from "@internationalized/date";
import { motion } from "motion/react";

interface PassengerFormData {
  type: string;
  gender: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isReservationHolder?: boolean;
  phone?: string;
  email?: string;
  address?: string;
}

interface PetFormData {
  type: string;
  petType: string;
  weight: string;
}

interface VehicleFormData {
  type: string;
  assignedTo: string;
  registration: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function PassengerDetailsPage() {
  const router = useRouter();
  
  const [searchCriteria, setSearchCriteria] = useState<any>(null);
  const [selectedSailings, setSelectedSailings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form data
  const [passengerForms, setPassengerForms] = useState<PassengerFormData[]>([]);
  const [petForms, setPetForms] = useState<PetFormData[]>([]);
  const [vehicleForms, setVehicleForms] = useState<VehicleFormData[]>([]);
  
  // Validation
  const [passengerErrors, setPassengerErrors] = useState<FormErrors[]>([]);
  const [petErrors, setPetErrors] = useState<FormErrors[]>([]);
  const [vehicleErrors, setVehicleErrors] = useState<FormErrors[]>([]);
  
  // Completion tracking
  const [completedPassengers, setCompletedPassengers] = useState<Set<number>>(new Set());
  const [completedPets, setCompletedPets] = useState<Set<number>>(new Set());
  const [completedVehicles, setCompletedVehicles] = useState<Set<number>>(new Set());

  const [reservationHolderIndex, setReservationHolderIndex] = useState(0);

  useEffect(() => {
    loadBookingData();
  }, [router]);

  const loadBookingData = () => {
    const search = sessionStorage.getItem("bookingSearch");
    const sailings = sessionStorage.getItem("selectedSailings");

    if (!search || !sailings) {
      router.push("/");
      return;
    }

    const searchData = JSON.parse(search);
    const sailingsData = JSON.parse(sailings);

    setSearchCriteria(searchData);
    setSelectedSailings(sailingsData);

    // Initialize forms
    initializeForms(searchData);
    setLoading(false);
  };

  const initializeForms = (criteria: any) => {
    // Create passenger forms
    const passengers: PassengerFormData[] = [];
    const passengerErrs: FormErrors[] = [];
    
    // Sort passenger types: adults first, then seniors, then rest
    const sortedEntries = Object.entries(criteria.passengers as Record<string, number>)
      .sort(([typeA], [typeB]) => {
        const typeAInfo = PASSENGER_TYPES.find(t => t.id === typeA);
        const typeBInfo = PASSENGER_TYPES.find(t => t.id === typeB);
        
        // Adults first
        if (typeA === 'adult') return -1;
        if (typeB === 'adult') return 1;
        
        // Then seniors
        if (typeA === 'senior') return -1;
        if (typeB === 'senior') return 1;
        
        // Then by sort order
        return (typeAInfo?.sortOrder ?? 0) - (typeBInfo?.sortOrder ?? 0);
      });

    let firstLeadPassengerIndex = -1;

    sortedEntries.forEach(([typeId, count]) => {
      const passengerType = PASSENGER_TYPES.find(t => t.id === typeId);
      if (!passengerType) return;
      if (typeId === 'pet') return;

      for (let i = 0; i < count; i++) {
        const isFirstLead = firstLeadPassengerIndex === -1 && passengerType.canBeLead;
        if (isFirstLead) {
          firstLeadPassengerIndex = passengers.length;
        }

        passengers.push({
          type: typeId,
          gender: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          isReservationHolder: isFirstLead,
          phone: isFirstLead ? '' : undefined,
          email: isFirstLead ? '' : undefined,
          address: isFirstLead ? '' : undefined,
        });
        passengerErrs.push({});
      }
    });

    setPassengerForms(passengers);
    setPassengerErrors(passengerErrs);
    setReservationHolderIndex(firstLeadPassengerIndex);

    // Create pet forms
    const pets: PetFormData[] = [];
    const petErrs: FormErrors[] = [];
    
    Object.entries(criteria.passengers as Record<string, number>).forEach(([typeId, count]) => {
      if (typeId === 'pet') {
        for (let i = 0; i < count; i++) {
          pets.push({
            type: 'pet',
            petType: '',
            weight: '',
          });
          petErrs.push({});
        }
      }
    });

    setPetForms(pets);
    setPetErrors(petErrs);

    // Create vehicle forms
    const vehicles: VehicleFormData[] = [];
    const vehicleErrs: FormErrors[] = [];
    
    Object.entries(criteria.vehicles as Record<string, number>).forEach(([typeId, count]) => {
      for (let i = 0; i < count; i++) {
        vehicles.push({
          type: typeId,
          assignedTo: '',
          registration: '',
        });
        vehicleErrs.push({});
      }
    });

    setVehicleForms(vehicles);
    setVehicleErrors(vehicleErrs);
  };

  // Validation functions
  const validatePassengerField = (index: number, field: string, value: string): string => {
    const passenger = passengerForms[index];
    const passengerType = PASSENGER_TYPES.find(t => t.id === passenger.type);

    switch (field) {
      case 'firstName':
      case 'lastName':
        return value.trim() ? '' : 'This field is required';
      
      case 'gender':
        return value ? '' : 'Please select a gender';
      
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required';
        
        // Calculate age
        const dob = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }

        if (passengerType?.minAge !== undefined && age < passengerType.minAge) {
          return `Must be at least ${passengerType.minAge} years old`;
        }
        if (passengerType?.maxAge !== undefined && age > passengerType.maxAge) {
          return `Must be ${passengerType.maxAge} years old or younger`;
        }
        return '';
      
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        // Basic phone validation - at least 10 digits
        const digits = value.replace(/\D/g, '');
        return digits.length >= 10 ? '' : 'Please enter a valid phone number';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Please enter a valid email';
      
      case 'address':
        return value.trim() ? '' : 'Address is required';
      
      default:
        return '';
    }
  };

  const validateVehicleField = (index: number, field: string, value: string): string => {
    switch (field) {
      case 'assignedTo':
        return value ? '' : 'Please assign a driver';
      
      case 'registration':
        if (!value.trim()) return 'Registration number is required';
        
        const regexValid = /^[PTRH][A-Z]{2}\s?\d{1,4}$/i;
        const firstChar = value.toUpperCase()[0];
        
        if (firstChar === 'V') {
          return 'Registrations beginning with V require special documentation, contact support for assistance.';
        }
        if (firstChar === 'D') {
          return 'Registrations beginning with D require special documentation, contact support for assistance.';
        }
        if (firstChar === 'X') {
          return 'Vehicles with X registration are too large for passenger ferries, contact support for cargo ferry options.';
        }
        if (!regexValid.test(value.toUpperCase())) {
          return 'Please enter a valid Trinidad & Tobago registration number';
        }
        return '';
      
      default:
        return '';
    }
  };

  const validatePetField = (index: number, field: string, value: string): string => {
    switch (field) {
      case 'petType':
        return value ? '' : 'Please select pet type';
      
      case 'weight':
        if (!value) return 'Weight is required';
        const weight = parseFloat(value);
        if (isNaN(weight) || weight <= 0) return 'Please enter a valid weight';
        return '';
      
      default:
        return '';
    }
  };

  // Update handlers
  const updatePassengerField = (index: number, field: string, value: string) => {
    const updated = [...passengerForms];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerForms(updated);

    // Validate on blur
    const error = validatePassengerField(index, field, value);
    const errors = [...passengerErrors];
    errors[index] = { ...errors[index], [field]: error };
    setPassengerErrors(errors);

    // Check completion
    checkPassengerCompletion(index, updated[index], errors[index]);
  };

  const updatePetField = (index: number, field: string, value: string) => {
    const updated = [...petForms];
    updated[index] = { ...updated[index], [field]: value };
    setPetForms(updated);

    const error = validatePetField(index, field, value);
    const errors = [...petErrors];
    errors[index] = { ...errors[index], [field]: error };
    setPetErrors(errors);

    checkPetCompletion(index, updated[index], errors[index]);
  };

  const updateVehicleField = (index: number, field: string, value: string) => {
    const updated = [...vehicleForms];
    updated[index] = { ...updated[index], [field]: value };
    setVehicleForms(updated);

    const error = validateVehicleField(index, field, value);
    const errors = [...vehicleErrors];
    errors[index] = { ...errors[index], [field]: error };
    setVehicleErrors(errors);

    checkVehicleCompletion(index, updated[index], errors[index]);
  };

  // Completion checking
  const checkPassengerCompletion = (index: number, data: PassengerFormData, errors: FormErrors) => {
    const isComplete = 
      data.gender &&
      data.firstName &&
      data.lastName &&
      data.dateOfBirth &&
      (!data.phone || data.phone) && // If phone field exists, must be filled
      (!data.email || data.email) &&
      (!data.address || data.address) &&
      Object.values(errors).every(e => !e);

    const completed = new Set(completedPassengers);
    if (isComplete) {
      completed.add(index);
    } else {
      completed.delete(index);
    }
    setCompletedPassengers(completed);
  };

  const checkPetCompletion = (index: number, data: PetFormData, errors: FormErrors) => {
    const isComplete = 
      data.petType &&
      data.weight &&
      Object.values(errors).every(e => !e);

    const completed = new Set(completedPets);
    if (isComplete) {
      completed.add(index);
    } else {
      completed.delete(index);
    }
    setCompletedPets(completed);
  };

  const checkVehicleCompletion = (index: number, data: VehicleFormData, errors: FormErrors) => {
    const isComplete = 
      data.assignedTo &&
      data.registration &&
      Object.values(errors).every(e => !e);

    const completed = new Set(completedVehicles);
    if (isComplete) {
      completed.add(index);
    } else {
      completed.delete(index);
    }
    setCompletedVehicles(completed);
  };

  // Change reservation holder
  const changeReservationHolder = (newIndex: number) => {
    const updated = passengerForms.map((p, i) => ({
      ...p,
      isReservationHolder: i === newIndex,
      phone: i === newIndex ? (p.phone || '') : undefined,
      email: i === newIndex ? (p.email || '') : undefined,
      address: i === newIndex ? (p.address || '') : undefined,
    }));
    
    setPassengerForms(updated);
    setReservationHolderIndex(newIndex);
  };

  // Calculate price
  const calculatePrice = () => {
    let passengerTotal = 0;
    let vehicleTotal = 0;
    let humanPassengerCount = 0;

    // Calculate passenger costs
    passengerForms.forEach(p => {
      const passengerType = PASSENGER_TYPES.find(t => t.id === p.type);
      if (passengerType) {
        const ticketClass = selectedSailings.outbound.ticketClass as keyof typeof passengerType.prices;
        const price = passengerType.prices?.[ticketClass] || 0;
        passengerTotal += price;
        
        if (p.type !== 'pet') {
          humanPassengerCount++;
        }
      }
    });

    // Add pet costs (pets use economy price)
    petForms.forEach(p => {
      const petType = PASSENGER_TYPES.find(t => t.id === 'pet');
      if (petType) {
        passengerTotal += petType.prices?.economy || 0;
      }
    });

    // Apply group discount (5+ human passengers, 10% off passenger total)
    const groupDiscount = humanPassengerCount >= 5 ? passengerTotal * 0.1 : 0;
    passengerTotal -= groupDiscount;

    // Calculate vehicle costs
    vehicleForms.forEach(v => {
      const vehicleType = VEHICLE_TYPES.find(t => t.id === v.type);
      if (vehicleType) {
        vehicleTotal += vehicleType.price || 0;
      }
    });

    const subtotal = passengerTotal + vehicleTotal;
    const isRoundTrip = searchCriteria?.tripType === 'round';
    const total = isRoundTrip ? subtotal * 2 : subtotal;

    return {
      passengerTotal,
      vehicleTotal,
      groupDiscount,
      subtotal,
      isRoundTrip,
      total,
      humanPassengerCount,
    };
  };

  const handleContinue = () => {
    // Validate all forms
    let hasErrors = false;

    // Validate passengers
    passengerForms.forEach((p, i) => {
      const errors: FormErrors = {};
      errors.gender = validatePassengerField(i, 'gender', p.gender);
      errors.firstName = validatePassengerField(i, 'firstName', p.firstName);
      errors.lastName = validatePassengerField(i, 'lastName', p.lastName);
      errors.dateOfBirth = validatePassengerField(i, 'dateOfBirth', p.dateOfBirth);
      
      if (p.phone !== undefined) {
        errors.phone = validatePassengerField(i, 'phone', p.phone);
      }
      if (p.email !== undefined) {
        errors.email = validatePassengerField(i, 'email', p.email);
      }
      if (p.address !== undefined) {
        errors.address = validatePassengerField(i, 'address', p.address);
      }

      if (Object.values(errors).some(e => e)) {
        hasErrors = true;
      }
    });

    // Validate pets
    petForms.forEach((p, i) => {
      const errors: FormErrors = {};
      errors.petType = validatePetField(i, 'petType', p.petType);
      errors.weight = validatePetField(i, 'weight', p.weight);

      if (Object.values(errors).some(e => e)) {
        hasErrors = true;
      }
    });

    // Validate vehicles
    vehicleForms.forEach((v, i) => {
      const errors: FormErrors = {};
      errors.assignedTo = validateVehicleField(i, 'assignedTo', v.assignedTo);
      errors.registration = validateVehicleField(i, 'registration', v.registration);

      if (Object.values(errors).some(e => e)) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      alert('Please complete all required fields correctly before continuing.');
      return;
    }

    // Save data and continue
    const bookingDetails = {
      passengers: passengerForms,
      pets: petForms,
      vehicles: vehicleForms,
      reservationHolderIndex,
      pricing: calculatePrice(),
    };

    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    router.push('/book/confirm-payment');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-lg text-blue-ink font-medium">Loading...</p>
      </div>
    );
  }

  const price = calculatePrice();
  const leadPassengers = passengerForms
    .map((p, i) => ({ ...p, index: i }))
    .filter(p => PASSENGER_TYPES.find(t => t.id === p.type)?.canBeLead);

  return (
    <div className="min-h-screen bg-light-surface mt-20 md:mt-16 md:pb-32">
      <div className="max-w-4xl mx-auto p-3 md:p-8">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-blue-ink mb-8">Passenger Details</h1>

        {/* ID Reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <HugeiconsIcon icon={AlertCircleIcon} size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Important: Travel Documents Required</p>
            <p>All passengers aged 15+ must present either a valid Trinidad & Tobago National ID or a valid passport in order to board</p>
          </div>
        </div>

        {/* Reservation Holder Selection */}
        {leadPassengers.length > 1 && (
          <div className="bg-light-surface p-6 mb-8 max-w-max mx-auto">
            <div className="flex flex-row items-center gap-4"> 
              <Label className="text-sm font-bold uppercase text-blue-ink flex-shrink-0"> Reservation Holder </Label>

                <Select 
                  className="w-[200px]" 
                  value={reservationHolderIndex.toString()}
                  onChange={(key) => changeReservationHolder(parseInt(key as string))}
                >
                  <Select.Trigger className="w-full h-10 px-4 flex items-center justify-between bg-blue-ink/5 border-none rounded-xl text-blue-ink outline-none">
                    <Select.Value className="text-sm truncate inline-flex items-center h-full leading-none" />
                    <Select.Indicator className="ml-2 w-4 h-4 flex-shrink-0 opacity-60 [&>svg]:w-full [&>svg]:h-full" />
                  </Select.Trigger>

                  <Select.Popover className="min-w-[var(--trigger-width)] bg-white shadow-2xl rounded-xl border border-blue-ink/10 z-50 overflow-hidden">
                    <ListBox className="p-1">
                      {leadPassengers.map((p) => {
                        const type = PASSENGER_TYPES.find(t => t.id === p.type);
                        return (
                          <ListBox.Item 
                            key={p.index.toString()} 
                            id={p.index.toString()}
                            textValue={`${type?.displayName} ${p.index + 1}`}
                            className="p-2 rounded-lg hover:bg-blue-ink/5 cursor-pointer flex justify-between items-center text-sm text-blue-ink"
                          >
                            {type?.displayName} #{p.index + 1}
                            <ListBox.ItemIndicator className="w-4 h-4" />
                          </ListBox.Item>
                        );
                      })}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <Description className="text-xs text-blue-ink/60 mt-2 block">
                The reservation holder will receive booking confirmation and updates
              </Description>
            </div>
          )}

        {/* Passenger Forms */}
        <Accordion allowsMultipleExpanded defaultExpandedKeys={['passenger-0']} className="space-y-3">
          {passengerForms.map((passenger, index) => {
            const passengerType = PASSENGER_TYPES.find(t => t.id === passenger.type);
            const isComplete = completedPassengers.has(index);
            const isReservationHolder = index === reservationHolderIndex;

            return (
              <Accordion.Item key={`passenger-${index}`} className="bg-light-surface border border-blue-ink/10 rounded-3xl overflow-hidden shadow-md">
                <Accordion.Heading>
                  <Accordion.Trigger className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon icon={UserEdit01Icon} size={20} strokeWidth={2} className="text-blue-ink" />
                      <span className="font-bold text-base text-blue-ink">
                        {passengerType?.displayName} #{index + 1}
                        {isReservationHolder && ' (Reservation Holder)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isComplete && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <HugeiconsIcon icon={Tick01Icon} size={20} className="text-green-600" strokeWidth={3} />
                        </motion.div>
                      )}
                      <Accordion.Indicator />
                    </div>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="px-6 pb-6 space-y-4">
                    {/* gender */}
                    <div>
                      <Select 
                        className="w-full flex flex-col gap-2" 
                        placeholder="Select Gender"
                        isRequired
                        isInvalid={!!passengerErrors[index]?.gender}
                        value={passenger.gender}
                        onChange={(key) => updatePassengerField(index, 'gender', key as string)}
                      >
                        <Label className="text-xs font-semibold uppercase text-blue-ink"> Gender </Label>

                        <Select.Trigger className="w-full h-12 px-4 flex items-center justify-between bg-blue-ink/5 border-none rounded-xl text-blue-ink outline-none">
                          <Select.Value className="text-sm truncate inline-flex items-center h-full leading-none" />
                          <Select.Indicator className="ml-2 flex-shrink-0 w-4 h-4 text-blue-ink/50 [&>svg]:w-full [&>svg]:h-full" />
                        </Select.Trigger>

                        <Select.Popover className="min-w-[var(--trigger-width)] bg-white shadow-2xl rounded-xl border border-blue-ink/10 z-50 overflow-hidden">
                          <ListBox className="p-1">
                            <ListBox.Item id="male" textValue="Male" className="p-2 rounded-lg hover:bg-blue-ink/5 cursor-pointer flex justify-between items-center text-sm text-blue-ink">
                              Male
                            <ListBox.ItemIndicator className="w-4 h-4" />
                            </ListBox.Item>
                            <ListBox.Item id="female" textValue="Female" className="p-2 rounded-lg hover:bg-blue-ink/5 cursor-pointer flex justify-between items-center text-sm text-blue-ink">
                              Female
                              <ListBox.ItemIndicator className="w-4 h-4" />
                            </ListBox.Item>
                            <ListBox.Item id="prefer-not-to-say" textValue="Prefer not to say" className="p-2 rounded-lg hover:bg-blue-ink/5 cursor-pointer flex justify-between items-center text-sm text-blue-ink">
                              Prefer not to say
                              <ListBox.ItemIndicator className="w-4 h-4" />
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>

                        {passengerErrors[index]?.gender && (
                          <FieldError className="text-xs text-red-600">
                            {passengerErrors[index].gender}
                          </FieldError>
                        )}
                      </Select>
                    </div>

                    {/* First name */}
                    <div>
                      <TextField 
                        isRequired 
                        className="flex flex-col w-full"
                        isInvalid={!!passengerErrors[index]?.firstName}
                        onChange={(val) => updatePassengerField(index, 'firstName', val)}
                      >
                        <Label className="text-xs font-semibold uppercase text-blue-ink mb-2"> First Name </Label>
                        <Input placeholder="Enter first name" value={passenger.firstName} className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:text-blue-ink/30" />
                        <FieldError className="text-xs text-red-600 mt-1"> {passengerErrors[index]?.firstName} </FieldError>
                      </TextField>
                    </div>

                    {/* Last name */}
                    <div>
                      <TextField 
                        isRequired 
                        className="flex flex-col w-full"
                        isInvalid={!!passengerErrors[index]?.lastName}
                        onChange={(val) => updatePassengerField(index, 'lastName', val)}
                      >
                        <Label className="text-xs font-semibold uppercase text-blue-ink mb-2"> Last Name </Label>
                        <Input placeholder="Enter last name" value={passenger.lastName} className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:text-blue-ink/30" />
                        <FieldError className="text-xs text-red-600 mt-1"> {passengerErrors[index]?.lastName} </FieldError>
                      </TextField>
                    </div>

                    {/* date of birth */}
                    <div>
                      <TextField 
                        isRequired 
                        className="flex flex-col w-full"
                        isInvalid={!!passengerErrors[index]?.dateOfBirth}
                        name={`dob-${index}`}
                        onChange={(val) => updatePassengerField(index, 'dateOfBirth', val)}
                      >
                        <Label className="text-xs font-semibold uppercase text-blue-ink mb-2"> Date of Birth </Label>
                        <Input type="date" value={passenger.dateOfBirth} className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:text-blue-ink/30"/>
                        <FieldError className="text-xs text-red-600 mt-1"> {passengerErrors[index]?.dateOfBirth} </FieldError>
                      </TextField>
                    </div>

                    {/* Fields for the reservation hodler */}
                    {isReservationHolder && (
                      <>
                        <div>
                          <TextField 
                            isRequired 
                            type="tel"
                            className="flex flex-col w-full"
                            isInvalid={!!passengerErrors[index]?.phone}
                            onChange={(val) => updatePassengerField(index, 'phone', val)}
                          >
                            <Label className="text-xs font-semibold uppercase text-blue-ink mb-2"> Phone Number </Label>
                            <Input placeholder="+1 868 XXX XXXX" value={passenger.phone} className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:text-blue-ink/30"/>
                            <FieldError className="text-xs text-red-600 mt-1"> {passengerErrors[index]?.phone} </FieldError>
                          </TextField>
                        </div>

                        <div>
                          <TextField 
                            isRequired 
                            type="email"
                            className="flex flex-col w-full"
                            isInvalid={!!passengerErrors[index]?.email}
                            onChange={(val) => updatePassengerField(index, 'email', val)}
                          >
                            <Label className="text-xs font-semibold uppercase text-blue-ink mb-2"> Email </Label>
                            <Input placeholder="example@email.com" value={passenger.email} className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:text-blue-ink/30"/>
                            <FieldError className="text-xs text-red-600 mt-1"> {passengerErrors[index]?.email} </FieldError>
                          </TextField>
                        </div>

                        <div>
                          <TextField 
                            isRequired 
                            className="flex flex-col w-full"
                            isInvalid={!!passengerErrors[index]?.address}
                            onChange={(val) => updatePassengerField(index, 'address', val)}
                          >
                            <Label className="text-xs font-semibold uppercase text-blue-ink mb-2"> Full Address </Label>
                            <Input placeholder="Street, City, Country" value={passenger.address} className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:text-blue-ink/30"/>
                            <FieldError className="text-xs text-red-600 mt-1"> {passengerErrors[index]?.address} </FieldError>
                          </TextField>
                        </div>
                      </>
                    )}
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>

        {/* pet forms */}
        {petForms.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-ink mb-4">Pets</h2>
            <Accordion allowsMultipleExpanded className="space-y-3">
              {petForms.map((pet, index) => {
                const isComplete = completedPets.has(index);

                return (
                  <Accordion.Item key={`pet-${index}`} className="bg-light-surface shadow-md border border-blue-ink/10 rounded-3xl overflow-hidden">
                    <Accordion.Heading>
                      <Accordion.Trigger className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <HugeiconsIcon icon={Bone01Icon} size={20} strokeWidth={2} className="text-blue-ink" />
                          <span className="font-bold text-base text-blue-ink">Pet #{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isComplete && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <HugeiconsIcon icon={Tick01Icon} size={20} className="text-green-600" strokeWidth={3} />
                            </motion.div>
                          )}
                          <Accordion.Indicator />
                        </div>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body className="px-6 pb-6 space-y-4">
                        {/* Pet Type */}
                        <div>
                          <Select
                            className="w-full flex flex-col gap-2"
                            placeholder="Select Pet Type"
                            isRequired
                            value={pet.petType}
                            onChange={(key) => updatePetField(index, 'petType', key as string)}
                            isInvalid={!!petErrors[index]?.petType}
                          >
                            <Label className="text-xs font-semibold uppercase text-blue-ink"> Type </Label>

                            <Select.Trigger className="w-full h-12 px-4 flex items-center justify-between bg-blue-ink/5 border-none rounded-xl text-blue-ink outline-none">
                              <Select.Value className="text-sm truncate inline-flex items-center h-full leading-none" />
                              <Select.Indicator className="ml-2 flex-shrink-0 w-4 h-4 text-blue-ink/50 [&>svg]:w-full [&>svg]:h-full" />
                            </Select.Trigger>

                            <Select.Popover className="min-w-[var(--trigger-width)] bg-white shadow-2xl rounded-xl border border-blue-ink/10 z-50 overflow-hidden">
                              <ListBox className="p-1">
                                <ListBox.Item id="dog" textValue="Dog" className="p-2 rounded-lg hover:bg-blue-ink/5 cursor-pointer flex justify-between items-center text-sm text-blue-ink">
                                  Dog
                                  <ListBox.ItemIndicator className="w-4 h-4" />
                                </ListBox.Item>
                                <ListBox.Item id="cat" textValue="Cat" className="p-2 rounded-lg hover:bg-blue-ink/5 cursor-pointer flex justify-between items-center text-sm text-blue-ink">
                                  Cat
                                  <ListBox.ItemIndicator className="w-4 h-4" />
                                </ListBox.Item>
                                <ListBox.Item id="bird" textValue="Bird" className="p-2 rounded-lg hover:bg-blue-ink/5 cursor-pointer flex justify-between items-center text-sm text-blue-ink">
                                  Bird
                                  <ListBox.ItemIndicator className="w-4 h-4" />
                                </ListBox.Item>
                              </ListBox>
                            </Select.Popover>

                            <FieldError className="text-xs text-red-600 mt-1">
                              {petErrors[index]?.petType}
                            </FieldError>
                          </Select>
                        </div>

                        {/* Weight */}
                        <div>
                          <TextField 
                            isRequired 
                            className="flex flex-col w-full"
                            type="number"
                            isInvalid={!!petErrors[index]?.weight}
                            onChange={(val) => updatePetField(index, 'weight', val)}
                          >
                            <Label className="text-xs font-semibold uppercase text-blue-ink mb-2"> Estimated Weight (kg) </Label>
                            <Input placeholder="Enter weight in kg" value={pet.weight} className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:text-blue-ink/30" />
                            <FieldError className="text-xs text-red-600 mt-1"> {petErrors[index]?.weight} </FieldError>
                          </TextField>
                        </div>
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </div>
        )}

        {/* vehicle forms */}
        {vehicleForms.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-ink mb-4">Vehicles</h2>
            <Accordion allowsMultipleExpanded className="space-y-3">
              {vehicleForms.map((vehicle, index) => {
                const isComplete = completedVehicles.has(index);
                const vehicleType = VEHICLE_TYPES.find(t => t.id === vehicle.type);

                return (
                  <Accordion.Item key={`vehicle-${index}`} className="bg-light-surface rounded-3xl shadow-md border border-blue-ink/10 overflow-hidden">
                    <Accordion.Heading>
                      <Accordion.Trigger className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <HugeiconsIcon icon={Car02Icon} size={20} strokeWidth={2} className="text-blue-ink" />
                          <span className="font-bold text-base text-blue-ink">
                            {vehicleType?.displayName} #{index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isComplete && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <HugeiconsIcon icon={Tick01Icon} size={20} className="text-green-600" strokeWidth={3} />
                            </motion.div>
                          )}
                          <Accordion.Indicator />
                        </div>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body className="px-6 pb-6 space-y-4">
                        {/* Assigned driver, can be any lead passenger */}
                        <div>
                          <Select
                            className="w-full flex flex-col gap-2"
                            placeholder="Select a driver"
                            isRequired
                            value={vehicle.assignedTo}
                            onChange={(key) => updateVehicleField(index, 'assignedTo', key as string)}
                            isInvalid={!!vehicleErrors[index]?.assignedTo}
                          >
                            <Label className="text-xs font-semibold uppercase text-blue-ink"> Assigned Driver </Label>

                            <Select.Trigger className="w-full h-12 px-4 flex items-center justify-between bg-blue-ink/5 border-none rounded-xl text-blue-ink outline-none">
                              <Select.Value className="text-sm truncate inline-flex items-center h-full leading-none" />
                              <Select.Indicator className="ml-2 w-4 h-4 flex-shrink-0 opacity-50 [&>svg]:w-full [&>svg]:h-full" />
                            </Select.Trigger>

                            <Select.Popover className="min-w-[var(--trigger-width)] bg-white shadow-2xl rounded-xl border border-blue-ink/10 z-50 overflow-hidden">
                              <ListBox className="p-1">
                                {leadPassengers.map((p) => {
                                  const type = PASSENGER_TYPES.find(t => t.id === p.type);
                                  const name = p.firstName && p.lastName 
                                    ? `${p.firstName} ${p.lastName}` 
                                    : `${type?.displayName} #${p.index + 1}`;
        
                                  return (
                                    <ListBox.Item 
                                      key={p.index.toString()} 
                                      id={p.index.toString()}
                                      textValue={name}
                                      className="p-2 rounded-lg hover:bg-blue-ink/5 cursor-pointer flex justify-between items-center text-sm text-blue-ink"
                                    >
                                      {name}
                                      <ListBox.ItemIndicator className="w-4 h-4" />
                                    </ListBox.Item>
                                  );
                                })}
                              </ListBox>
                            </Select.Popover>

                            <FieldError className="text-xs text-red-600 mt-1">
                              {vehicleErrors[index]?.assignedTo}
                            </FieldError>
                          </Select>
                        </div>

                        {/* Registration */}
                        <div>
                          <TextField 
                            isRequired 
                            className="flex flex-col w-full"
                            isInvalid={!!vehicleErrors[index]?.registration}
                            onChange={(val) => updateVehicleField(index, 'registration', val.toUpperCase())}
                          >
                            <Label className="text-xs font-semibold uppercase text-blue-ink mb-2">  Registration Number </Label>
                            <Input placeholder="e.g., PDT 123" value={vehicle.registration} className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:text-blue-ink/30 uppercase" />
                            <FieldError className="text-xs text-red-600 mt-1"> {vehicleErrors[index]?.registration} </FieldError>
                          </TextField>
                        </div>
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-light-surface border-t border-blue-ink/10 shadow-2xl z-10">
        <div className="max-w-4xl mx-auto p-6">
          
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-0 relative">
            <div className="flex-1 order-1">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8 text-sm">
                <div className="hidden md:flex gap-8 items-start">
                  <div>
                    <p className="text-blue-ink/60 text-xs uppercase font-semibold mb-1">Passengers</p>
                    <div className="text-blue-ink font-bold">
                      <span>${price.passengerTotal.toFixed(2)}</span>
                      {price.groupDiscount > 0 && (
                        <span className="text-green-600 text-[10px] block mt-1 md:inline md:text-xs md:ml-2">
                          (10% group discount applied)
                        </span>
                      )}
                    </div>
                  </div>
        
                  {vehicleForms.length > 0 && (
                    <div>
                      <p className="text-blue-ink/60 text-xs uppercase font-semibold mb-1">Vehicles</p>
                      <p className="text-blue-ink font-bold">${price.vehicleTotal.toFixed(2)}</p>
                    </div>
                  )}
                </div>
      
                <div>
                  <p className="text-blue-ink/60 text-xs uppercase font-semibold mb-1">
                    {price.isRoundTrip ? 'Round Trip Total' : 'One Way Total'}
                  </p>
                  <p className="text-2xl text-blue-ink font-bold">
                    ${price.total.toFixed(2)} <span className="text-sm font-normal">TTD</span>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={
                completedPassengers.size !== passengerForms.length ||
                completedPets.size !== petForms.length ||
                completedVehicles.size !== vehicleForms.length
              }
              className="w-full md:w-auto order-2 md:order-3 px-6 md:px-8 py-3 md:py-4 bg-blue-ink text-light-surface rounded-full font-bold text-lg hover:bg-blue-ink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all md:ml-8"
            >
              Continue to Payment
            </button>

            <p className="text-xs text-blue-ink/60 text-center md:text-left w-full mt-4 md:mt-2 order-3 md:absolute md:top-full md:left-0">
              Prices include VAT • {price.humanPassengerCount} passenger{price.humanPassengerCount !== 1 ? 's' : ''}
              {petForms.length > 0 && `, ${petForms.length} pet${petForms.length !== 1 ? 's' : ''}`}
              {vehicleForms.length > 0 && `, ${vehicleForms.length} vehicle${vehicleForms.length !== 1 ? 's' : ''}`}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
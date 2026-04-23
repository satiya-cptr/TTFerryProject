"use client";

// All of the data for the FAQ page

import { ReactNode } from "react";

export interface FAQQuestion {
  id: string;
  question: string;
  answer: ReactNode;
}

export interface FAQSection {
  id: string;
  sectionTitle: string;
  questions: FAQQuestion[];
}

export interface FAQTab {
  id: string;
  tabTitle: string;
  sections: FAQSection[];
}

// the actual faqs
export const FAQ_CONTENT: FAQTab[] = [
  {
    id: "tab-plan",
    tabTitle: "Plan & Book",
    sections: [
      {
        id: "sec-plan-get-started", 
        sectionTitle: "Getting Started",
        questions: [
          {
            id: "q-how-to-ticket",
            question: "How do I book a ticket?",
            answer: (
              <>
                Making a booking is a simple four step process on TT Ferry:
                <ol className="list-decimal ml-5 mt-3 text-blue-ink">
                  <li>
                    <b>Search:</b> Use the booking widget on the{" "} 
                    <a href="/" aria-label="link to the home page" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">Home</a>
                    {" "}or{" "} <a href="/book" aria-label="link to the booking page" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">Booking</a>
                    {" "}page to select your route, travel dates, and the number of passengers, vehicles, or pets.
                  </li>
                  <li>
                    <b>Select:</b>  Choose your preferred sailing time and ticket class (Economy or Premium) from the search results.
                  </li>
                  <li>
                    <b>Details:</b> Enter the required information for <i>all</i> passengers, vehicles, and pets included in your trip.
                  </li>
                  <li>
                    <b>Confirm</b>: Review you billing summary, then press and hold to confirm your booking.
                  </li>
                </ol>
              </>
            ),
          },
          {
            id: "q-need-account",
            question: "Can I make a booking without an account?",
            answer: (
              <>
                Yes, you can book without an account. 
                If you create one later using the same email address, your previous bookings will be automatically linked.
              </>
            ),
          },
          {
            id: "q-book-someone-else",
            question: "Can I book for someone else?",
            answer: (
              <>
                Yes. Bookings may be made on behalf of another passenger, provided their identification details, such as their full name and date of birth, are entered accurately.
              </>
            ),
          },
          {
            id: "q-book-many",
            question: "How many people can I book for at a time?",
            answer: (
              <>
                You can book for up to eight (8) passengers at a time, including infants and pets.
              </>
            ),
          },
          {
            id: "q-info-before-book",
            question: "What information do I need before I book?",
            answer: (
              <>
                You will need the following details before booking:
                <ul className="list-disc ml-8 mt-2 space-y-1">
                  <li>Each passenger’s full name (as shown on their government-issued photo ID or passport)</li>
                  <li>Each passenger’s date of birth</li>
                  <li>Vehicle registration number (if travelling with a vehicle)</li>
                </ul>
                <br />
                After April 30th, 2026, senior citizens (60+) must present a valid Trinidad and Tobago national ID or passport. 
              </>
            ),
          },
          {
            id: "q-if-success",
            question: "How do I know if my booking was successful?",
            answer: (
              <>
                You will know your booking is successful once you have been directed to your booking confirmation page. 
                From there you can view, print, or manage your tickets.
              </>
            ),
          },
          {
            id: "q-no-booking",
            question: "Can I travel without a booking?",
            answer: (
              <>
                While making a booking is reccommended, you can travel without one on standby, subject to availability. 
              </>
            ),
          }
        ],
      },
      {
        id: "sec-plan-schedule", 
        sectionTitle: "Schedule & Availability",
        questions: [
          {
            id: "q-see-schedule",
            question: "Where can I view the full schedule?",
            answer: (
              <>
                The full schedule is available on the schedule page here: {" "}
                <a href="/schedule" aria-label="link to the schedule" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttferry.vercel.app/schedule</a>
              </>
            ),
          },
          {
            id: "q-book-advance",
            question: "How far in advance can I make a booking?",
            answer: (
              <>
                You can book up to three (3) months in advance, subject to schedule availability.
              </>
            ),
          },
          {
            id: "q-sail-frequency",
            question: "How often do the ferries sail?",
            answer: (
              <>
                Weekdays: at least two (2) sailings from each terminal, except Wednesdays with one. 
                <br />
                Weekends: at least one (1) sailing from each terminal. 
                <br /><br />
                Check out the full schedule to see specific availability here: {" "}
                <a href="/schedule" aria-label="link to the schedule" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttferry.vercel.app/schedule</a>
              </>
            ),
          },
          {
            id: "q-delays",
            question: "How will I know if there are changes or delays to the schedule?",
            answer: (
              <>
                Any changes or delays are shown on the {" "}
                <a href="/schedule" aria-label="link to the schedule" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">schedule</a>
                {" "}beneath the affected sailing, or on the {" "}
                <a href="/updates" aria-label="link to the schedule" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">updates page</a>
                .
              </>
            ),
          },
          {
            id: "q-sold-out",
            question: "How do I know if a sailing is sold out?",
            answer: (
              <>
                Sold out or unavailable sailings are shown in <span className="text-danger/80 font-medium">red</span> on the schedule. 
              </>
            ),
          }
        ],
      },
      {
        id: "sec-plan-price", 
        sectionTitle: "Prices & Discounts",
        questions: [
          {
            id: "q-prices",
            question: "What are the current ticket prices for passengers and vehicles?",
            answer: (
              <>
                Current ticket prices per way are as follows:
                <ul className="list-disc ml-8 mt-2 space-y-1">
                  <li><b>Adults:</b> $75TTD (Economy), $150TTD (Premium) </li>
                  <li><b>Seniors:</b> $25TTD (Economy), $150TTD (Premium) </li>
                  <li><b>Teens:</b> $60TTD (Economy), $120TTD (Premium) </li>
                  <li><b>Children:</b> $25TTD (Economy), $100TTD (Premium) </li>
                  <li><b>Infants:</b> Free</li>
                  <li><b>Pets:</b> $20TTD </li>
                  <li><b>Vehicles:</b> starting at $75TTD</li>
                </ul>
              </>
            ),
          },
          {
            id: "q-senior-discount",
            question: "Who is eligible for the senior citizen discount?",
            answer: (
              <>
                All passengers aged sixty (60) and over are currently eligible for the senior citizen discount. <br />
                Effective April 30, 2026, eligibility will be limited to Trinidad and Tobago citizens aged sixty (60) and over.
              </>
            ),
          },
          {
            id: "q-final-price",
            question: "Are ticket prices final?",
            answer: (
              <>
                Yes. All ticket prices are inclusive of VAT and applicable taxes.
              </>
            ),
          }
        ],
      },
      {
        id: "sec-plan-vehicles-bags-pets", 
        sectionTitle: "Vehicles, Baggage & Pets",
        questions: [
          {
            id: "q-vehicle-type",
            question: "What types of vehicles are allowed on the ferries?",
            answer: (
              <>
                Passenger ferries accommodate motorcycles, standard cars, 4x4 vehicles, vans, and trucks. <br /><br /> 
                Larger vehicles are only transported on the cargo vessel, Blue Wave Harmony. 
                For more information, visit the official Trinidad and Tobago Inter-Island Transportation website here:{" "}
                <a href="https://www.ttitferry.com" target="_blank" rel="noopener noreferrer" aria-label="link to the official ttit website, this will open on a new page" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttitferry.com</a>
              </>
            ),
          },
          {
            id: "q-vehicle-alone",
            question: "Can my vehicle travel without me?",
            answer: (
              <>
                No. Vehicles must travel with their driver, as passengers are not permitted to disembark after boarding. <br /><br />
                Driverless vehicle transport is available on the cargo vessel, Blue Wave Harmony. 
                For more information or to book this service, visit the official Trinidad and Tobago Inter-Island Transportation Company website here:{" "}

                <a href="https://www.ttitferry.com" target="_blank" rel="noopener noreferrer" aria-label="link to the official ttit website, will open on a new page" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttitferry.com</a>
              </>
            ),
          },
          {
            id: "q-book-vehicle-and-passenger",
            question: "Do I need to book my vehicle and passengers at the same time?",
            answer: (
              <>
                Yes. Vehicle bookings must be made at the same time as the driver’s booking.
              </>
            ),
          },
          {
            id: "q-baggage-allowance",
            question: "How much baggage is allowed per passenger?",
            answer: (
              <>
                There is no set limit on the number of bags per passenger. <br />
                For full details on baggage guidelines, see our guide here: {" "}
                <a href="/info/info-hub" aria-label="link to our baggage guidelines article" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttferry.vercel.app/info/info-hub</a>
              </>
            ),
          },
          {
            id: "q-not-allowed",
            question: "Are there any items I am not allowed to bring?",
            answer: (
              <>
                Yes. Certain items are restricted for safety reasons, including LPG cylinders and other hazardous materials. 
                For a full list of prohibited items, refer to the official guidelines here:
              </>
            ),
          },
          {
            id: "q-firearm",
            question: "Can I travel with my registered firearm?",
            answer: (
              <>
                Yes. Firearms must be declared at the security checkpoint for processing by the Port Police. 
                A receipt will be issued and must be presented on arrival for retrieval. <br /><br />
                <b>Passengers are not permitted to retain possession of firearms while on board. Doing so is a contravention of the International Ship and Port Facility Security (ISPS) Code of the International Maritime Organization.</b>
              </>
            ),
          },
          {
            id: "q-bring-pet",
            question: "Can I travel with my pet?",
            answer: (
              <>
                Yes. Pet tickets must be purchased with their owner's and a 'Cargo Shipment Form' must be obtained on the day of travel from the Freight Cashier.
              </>
            ),
          }
        ],
      },
    ],
  },
  {
    id: "tab-manage",
    tabTitle: "Your Booking",
    sections: [
      {
        id: "sec-manage-access", 
        sectionTitle: "Access Your Booking",
        questions: [
          {
            id: "q-find-ref-code",
            question: "Where can I find my booking reference code?",
            answer: (
              <>
                Your booking reference code is shown at the top of your booking confirmation page and on the lower section of your tickets.
              </>
            ),
          },
          {
            id: "q-access-no-account",
            question: "Can I access my booking without an account?",
            answer: (
              <>
                Yes. Use the ‘Manage Booking’ form and enter your booking reference code and the email used to make the booking.
              </>
            ),
          },
          {
            id: "q-wrong-email",
            question: "What if I used the wrong email address while booking?",
            answer: (
              <>
                You can still access your booking using the incorrect email via the ‘Manage Booking’ form, then update it using the ‘Edit Booking’ option. 
                If you do not remember the email used, contact us for assistance here: {" "}
                <a href="/contact" aria-label="link to our contact form" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttferry.vercel.app/contact</a>
              </>
            ),
          },
          {
            id: "q-no-confirm-email",
            question: "What should I do if I haven’t received a confirmation email?",
            answer: (
              <>
                Confirmation emails are currently unavailable. If your booking was made on or after April 1, you will not receive one. For bookings made before April 1, please check your spam or junk folder.
              </>
            ),
          },
          {
            id: "q-account-after-booking",
            question: "Can I create an account after booking?",
            answer: (
              <>
                Yes. Any bookings made using the same email address will be automatically linked to your new account.
              </>
            ),
          },
          {
            id: "q-reset-password",
            question: "How do I reset my password?",
            answer: (
              <>
                Use the ‘Forgot Password?’ option on the sign-in form to receive a password reset email, then follow the instructions provided.
              </>
            ),
          }
        ],
      },
      {
        id: "sec-manage-change", 
        sectionTitle: "Changes & Cancellations",
        questions: [
          {
            id: "q-change-date",
            question: "Can I change my travel date or time after I make my booking?",
            answer: (
              <>
                Yes. Changes can be made using the ‘Edit Booking’ option up to 24 hours before your first sailing. Each type of change can only be made once.
              </>
            ),
          },
          {
            id: "q-add-passenger",
            question: "Can I add another passenger or vehicle to my booking?",
            answer: (
              <>
                No. Additional passengers or vehicles require a new booking.
              </>
            ),
          },
          {
            id: "q-correct-errors",
            question: "Can I correct errors made while booking?",
            answer: (
              <>
                Yes. Booking details can be corrected up to 24 hours before your sailing.
              </>
            ),
          },
          {
            id: "q-cancel-booking",
            question: "How do I cancel my booking?",
            answer: (
              <>
                Use the ‘Cancel Booking’ option on your booking confirmation page to cancel your booking and begin the refund process. Refunds are processed within seven (7) business days.
              </>
            ),
          },
          {
            id: "q-refund",
            question: "Will I get a refund if I cancel my booking?",
            answer: (
              <>
                Yes. You will receive a full refund, minus a 25% service fee.
              </>
            ),
          },
          {
            id: "q-edit-deadline",
            question: "Is there a deadline for making changes or cancelling?",
            answer: (
              <>
                Yes. All changes and cancellations must be made at least 24 hours before your sailing.
              </>
            ),
          }
        ],
      },
      {
        id: "sec-manage-issues", 
        sectionTitle: "Issues & Support",
        questions: [
          {
            id: "q-find-ticket",
            question: "Where can I find my ticket after booking?",
            answer: (
              <>
                Your ticket is available on your booking confirmation page.
              </>
            ),
          },
          {
            id: "q-booking-not-shown",
            question: "What should I do if my booking doesn’t show up on my account?",
            answer: (
              <>
                Please allow a few moments for your booking to appear. If it does not, ensure you are signed in with the correct email address. 
                If the issue persists, contact us for assistance.
              </>
            ),
          },
          {
            id: "q-booking-help",
            question: "Who can I contact for help with my booking?",
            answer: (
              <>
                For booking assistance, use our contact form here:{" "}
                <a href="/contact" aria-label="link to our contact form" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttferry.vercel.app/contact</a>
              </>
            ),
          },
          {
            id: "q-contact-terminals",
            question: "Where can I find the contact information for the terminals?",
            answer: (
              <>
                Terminal contact details and opening hours are available on our contact page here: {" "}
                <a href="/contact" aria-label="link to our contact form" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttferry.vercel.app/contact</a>
              </>
            ),
          },
          {
            id: "q-report-website",
            question: "How do I report a problem with the website?",
            answer: (
              <>
                To report a problem, use our contact form here:{" "}
                <a href="/contact" aria-label="link to our contact form" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttferry.vercel.app/contact</a>
              </>
            ),
          }
        ],
      },
    ],
  },
  {
    id: "tab-travel",
    tabTitle: "Before You Travel",
    sections: [
      {
        id: "sec-travel-boarding", 
        sectionTitle: "Check-In & Boarding",
        questions: [
          {
            id: "q-how-early",
            question: "How early should I arrive at the terminal?",
            answer: (
              <>
                You are required to be present at the terminal two (2) hours before your sailing.
              </>
            ),
          },
          {
            id: "q-travel-documents",
            question: "What documents do I need to travel?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-where-to-go",
            question: "Where do I go when I arrive at the terminal?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-digital-tickets",
            question: "Are digital tickets accepted?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-check-in-close",
            question: "When does check-in close for a sailing?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-boarding-process",
            question: "What is the boarding process like?",
            answer: (
              <>
                isert answer here
              </>
            ),
          }
        ],
      },
      {
        id: "sec-travel-logistics", 
        sectionTitle: "Vehicle & Pet Logistics",
        questions: [
          {
            id: "q-vehicle-boarding",
            question: "Where do I take my vehicle for boarding?",
            answer: (
              <>
                insert answer here
              </>
            ),
          },
          {
            id: "q-stay-in-vehicle",
            question: "Can I stay in my vehicle while the ferry is sailing?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-access-vehicle",
            question: "Can I access my vehicle once the ferry is sailig?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-terminal-parking",
            question: "Is there long-term parking at the terminals if I’m not taking my vehicle?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-pet-sailing",
            question: "What is the procedure for sailing with a pet?",
            answer: (
              <>
                isert answer here
              </>
            ),
          }
        ],
      },
      {
        id: "sec-travel-onboard", 
        sectionTitle: "Onboard",
        questions: [
          {
            id: "q-onboard-seating",
            question: "Where do I sit once I’ve boarded the ferry?",
            answer: (
              <>
                insert answer here
              </>
            ),
          },
          {
            id: "q-onboard-refreshments",
            question: "Are there food and drink available on board?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-restrooms",
            question: "Are there restrooms and baby-changing facilities on board?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-entertainment",
            question: "Is Wi-Fi or entertainment available?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-outside-deck",
            question: "Can I go outside during the sailing?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-sailing-length",
            question: "How long is the typical sailing?",
            answer: (
              <>
                isert answer here
              </>
            ),
          }
        ],
      },
      {
        id: "sec-travel-accessibility", 
        sectionTitle: "Accessibility & Assistance",
        questions: [
          {
            id: "q-wheelchair-accessible",
            question: "Are the ferries wheelchair accessible?",
            answer: (
              <>
                insert answer here
              </>
            ),
          },
          {
            id: "q-boarding-assistance",
            question: "How can I request boarding assistance if I have limited mobility?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-seasick",
            question: "What do I do if I feel unwell or seasick while sailing?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-onboard-help",
            question: "Who can I talk to if I need help on board?",
            answer: (
              <>
                isert answer here
              </>
            ),
          },
          {
            id: "q-outside-deck",
            question: "Can I go outside during the sailing?",
            answer: (
              <>
                isert answer here
              </>
            ),
          }
        ],
      },
    ],
  },
];
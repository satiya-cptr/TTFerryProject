"use client";

// All of the data for the info hub articles
// quick map, bc she's long: 
// tickets start - line 34
// baggage start - line 114
// restrcited start - 214

// TODO: put all this in a real cms

import { ReactNode } from "react";

export type ArticleBlock = 
  | { type: 'header-body'; header: string; body: ReactNode }
  | { type: 'body-only'; body: ReactNode }
  | { type: 'media'; src: string; caption?: string; alt: string };

export interface Article {
  // card data 
  index: number;  
  badge?: string; 
  subtitle: string;           
  cardImage?: string;        
  
  // page data
  id: string;                 
  title: string;              
  subject: 'Tickets' | 'Baggage' | 'Restrictions' | 'General';
  priority: 'High' | 'Normal';
  updatedAt: string;
  readTime: string;
  headerImage: string;      
  
  // article itself
  content: ArticleBlock[];
}

export const ARTICLES: Article[] = [
  {
    index: 1,
    id: "tickets",
    title: "Choosing the right tickets for your journey",
    subtitle: "A simple guide to ticket types and fares",
    subject: "Tickets",
    priority: "High",
    updatedAt: "Mar 30, 2026",
    readTime: " 3 min",
    cardImage: "/images/tickets-duo.avif",
    headerImage: "/images/article/ticket-cover.webp",
    content: [
      {
        type: 'body-only',
        body: (
          <div className="space-y-6">
            <p>Whether you’re travelling for a quick getaway or a longer stay, the right ticket helps you make the most of your time on board. Both ticket options are designed to be comfortable and straightforward, with Premium offering a few added conveniences if you want a more relaxed experience.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Economy",
        body: (
          <div className="space-y-6">
            <p>Economy is the most popular option for a reason, It’s simple, comfortable, and flexible. Seating is unassigned and available on a first come-first served basis, so you can settle in where you prefer.</p>
            <p>You’ll still have access to onboard amenities, including café service and comfortable seating areas. For most journeys, Economy offers everything you need.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Premium",
        body: (
          <div className="space-y-6">
            <p>Premium builds on the same foundation with a few added benefits designed to make your journey smoother.</p>
            <p>You’ll board earlier and, for drive-on passengers, disembark ahead of others. Seating is more spacious, with reclinable seats, better access to charging points, and panoramic ocean views. The Premium lounge also includes its own café, offering a quieter, more relaxed environment.</p>
            <p>It’s not a completely different experience, but it does make the journey feel easier and more comfortable from start to finish.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Which Should You Choose?",
        body: (
          <div className="space-y-6">
            <p>If you’re looking for a reliable and cost-effective option, Economy has everything you need.</p>
            <p>If you’d prefer a quieter space, earlier boarding, or a quicker exit on arrival, Premium is a worthwhile upgrade.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Fares and Pricing",
        body: (
          <div className="space-y-6">
            <p>Prices vary by passenger type, including adults, children, seniors, and pets, with options available for both one-way and round-trip travel.</p>
            <p>The table below outlines all fares so you can choose the option that best fits your journey.</p>
          </div>
        )
      },
      // image or table here
      {
        type: 'header-body',
        header: "Important Things to Note",
        body: (
          <div className="space-y-6">
            <ul className="list-disc ml-8 space-y-1">
              <li>Tickets are valid for the selected sailing and must be presented before boarding.</li>
              <li>Passengers are allowed to update their ticket details or change sailings once.</li>
              <li>Only unused or unvalidated (unchanged) tickets are eligible for refunds after the date of travel.</li>
              <li>Sailings can sell out, especially during peak travel times. Booking in advance is strongly recommended.</li>
              <li>Standby sailing is subject to availability and does not guarantee passage.</li>
            </ul>
          </div>
        )
      },
    ]
  },
  {
    index: 2,
    id: "baggage",
    title: "Packing for your journey made simple",
    subtitle: "A simple guide to baggage allowances and limits",
    subject: "Baggage",
    priority: "High",
    updatedAt: "Mar 30, 2026",
    readTime: " 4 min",
    cardImage: "/images/luggage-trio.avif",
    headerImage: "/images/article/baggage-cover.webp",
    content:[
      {
        type: 'body-only',
        body: (
          <div className="space-y-6">
            <p>Packing for your journey is straightforward. While there are no strict baggage limits, it’s important to travel with items you can manage comfortably and store safely during the crossing.</p>
            <p>Understanding how baggage is handled on board will help you avoid delays and keep the journey smooth for everyone.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "What You Can Bring",
        body: (
          <div className="space-y-6">
            <p>There are no fixed limits on the number or size of bags for either Economy or Premium passengers, however, passengers are expected to bring only what they can handle without difficulty. Bags should be easy to carry, store, and keep under control throughout boarding and the journey.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Carry-On Baggage",
        body: (
          <div className="space-y-6">
            <p>You’re welcome to bring bags on board with you, but please note that space on the passenger deck is limited.</p>
            <div className="space-y-3">
              <p>There are no overhead storage areas, so all carry-on items must remain with you. To keep seating available for all passengers:</p>
              <ul className="list-disc ml-8 space-y-1">
                <li>Bags should not be placed on seats during boarding</li>
                <li>Aisles and walkways must remain clear at all times</li>
                <li>Items should be compact and easy to manage</li>
              </ul>
            </div>
            <p>Once the sailing is underway and seating has settled, smaller items may be placed on the seat beside you where appropriate.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Checked and Vehicle Deck Storage",
        body: (
          <div className="space-y-6">
            <p>If you’re travelling with larger or less manageable items, you can check your bags at the check-in counter before boarding at no extra cost. Checked bags are stored in the vessel’s baggage hold and are not accessible during the journey.</p>
          </div>
        )
      },
      {
        type: 'media',
        src: "/images/article/baggage-body-1.webp",
        alt: "port worker checking baggage",
      },
      {
        type: 'body-only',
        body: (
          <div className="space-y-6">
            <p>Passengers may also have the option to place large bags in the designated baggage area on the vehicle deck during boarding. While this self-service option is available, checking bags at the counter is recommended as space is limited.</p>
            <p>Passengers travelling with vehicles may choose to leave baggage inside their vehicle.</p>
            <p>Please note that neither the baggage hold nor the vehicle deck is accessible during the sailing, so anything you may need should be kept with you.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Security and Screening",
        body: (
          <div className="space-y-6">
            <p>All carry-on baggage must pass through security screening before boarding. Bags may be inspected further at the discretion of port security officers.</p>
            <p>Passengers must comply with all screening procedures. Failure to do so may result in denied boarding.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Claims and Lost or Damaged Items",
        body: (
          <div className="space-y-6">
            <p>If an issue occurs with your baggage during your journey, it’s important to report it as soon as possible.</p>
            <p>For damaged or missing bags, vehicles or items, notify the port staff on arrival for guidance. They will direct you to the HSE department to start your claim.</p>
            <p>Supporting documents must be included when submitting a claim. This includes your ticket and any relevant baggage stubs.</p>
            <p>All formal claims should be submitted in writing within ten (10) days of the occurrence. Claims submitted later than ten (10) days will not be processed.</p>
          </div>
        )
      },
    ]
  },
  {
    index: 3,
    id: "prohibited",
    title: "Understanding restricted and prohibited items",
    subtitle: "A guide to what you can and can’t bring aboard",
    subject: "Restrictions",
    priority: "High",
    updatedAt: "Mar 30, 2026",
    readTime: " 4 min",
    cardImage: "/images/article/restriction-card-img.avif",
    headerImage: "/images/article/restriction-cover.webp",
    content: [
      {
        type: 'body-only',
        body: (
          <div className="space-y-6">
            <p>For the safety and security of all passengers, certain items are not permitted on board or are subject to strict handling procedures.</p>
            <p>These restrictions are in place to ensure a safe journey for everyone and must be followed at all times. </p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "General Restrictions",
        body: (
          <div className="space-y-6">
            <p>Passengers are not permitted to travel with items that may pose a risk to safety, security, or the vessel.</p>
            <div className="space-y-3">
              <p>This includes, but is not limited to:</p>
              <ul className="list-disc ml-8 space-y-1">
                <li>Flammable or highly combustible materials</li>
                <li>Explosive or hazardous substances</li>
                <li>Weapons or items that may be used to cause harm</li>
                <li>Dangerous chemicals or unsealed substances</li>
              </ul>
            </div>
            <p>Items deemed unsafe or unsuitable for transport may be confiscated at the discretion of port security.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "LPG Cylinders",
        body: (
          <div className="space-y-6">
            <p>LPG cylinders are strictly prohibited on all inter-island vessels. This applies in all cases, with no exceptions.</p>
            <p>Passengers who need to transport LPG cylinders must do so through the the Sea Lots Compound or the Crown Point Facility. A valid form of photo identification is required to complete this process.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Registered Firearms",
        body: (
          <div className="space-y-6">
            <p>Passengers travelling with registered firearms are required to declare them at the security checkpoint before boarding.</p>
            <p>Firearms must be handed over to the Port Police for processing and secure storage. A receipt will be issued and must be presented to the designated personnel on board before disembarking in order to retrieve the item.</p>
            <p>Passengers are not permitted to retain possession of firearms while on board. Doing so is a contravention of the International Ship and Port Facility Security (ISPS) Code of the International Maritime Organization.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "Screening and Enforcement",
        body: (
          <div className="space-y-6">
            <p>All carry-on baggage must pass through security screening prior to boarding. Items may be inspected further at the discretion of port security.</p>
            <p>Passengers must comply with all security procedures. Prohibited items may be confiscated, and passengers found in violation of these requirements may be denied boarding.</p>
          </div>
        )
      },
      {
        type: 'header-body',
        header: "When in Doubt",
        body: (
          <div className="space-y-6">
            <p>If you are unsure whether an item is permitted, it is best to check in advance before travelling.</p>
            <p>You can contact us via our contact form here: <a href="/contact"  aria-label="link to our contact page" className="text-blue-ink underline font-medium hover:text-blue-surface/60 transition-colors duration-200">ttferry.vercel.app/contact</a></p>
          </div>
        )
      },
    ]
  }
];
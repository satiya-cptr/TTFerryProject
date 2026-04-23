"use client";

// the footer
//TODO: add animations + make links use rolling text

import Link from "next/link";
import { DoubleStackButton } from "./doubleStackButton";
import { toast } from "@heroui/react";
import RollingText from "./rollingText";
import TTWordMark from "../logos/ttWordMark";
import { motion } from "motion/react";

export default function Footer() {
  return (
    <footer className="mx-[10px] mb-10 rounded-[32px] overflow-hidden bg-gradient-to-b from-blue-surface via-[#BED9ED] to-light-surface p-6 md:p-8">
      
      {/* row 1 */}
      <div className="flex flex-col md:flex-row justify-between items-start w-full gap-12 lg:gap-0">
        
        <div className="flex flex-col items-start max-w-lg">
          <h2 className="text-light-surface font-semimedium font-inter-tight text-2xl md:text-4xl lg:text-5xl mb-5 md:mb-7 text-left leading-tight">
            Service updates, <br /> straight to your inbox
          </h2>
          
          <div className="w-full max-w-md flex items-center h-[48px] rounded-full border border-light-surface/40 bg-[#E4EFF7]/20 backdrop-blur-[6px] overflow-hidden">
            <input type="email" placeholder="name@email.com"
              className="flex-1 min-w-0 h-full bg-transparent px-4 md:px-6 text-light-surface placeholder:text-light-surface/80 outline-none text-sm font-light"
            />
            <div className="h-full flex-shrink-0">
              <DoubleStackButton variant="light" className="h-full px-5 md:px-8" onClick={() => toast.success("You have subscribed to service updates.")}>
                <RollingText primary="subscribe" secondary="subscribe" />
              </DoubleStackButton>
            </div>
          </div>
        </div>

        {/* site map */}
        <div className="flex flex-row gap-[24px]">
          <div className="flex flex-col gap-1.5 text-light-surface text-lg font-light font-inter-tight">
            <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
            <Link href="/schedule" className="hover:opacity-70 transition-opacity">Schedule</Link>
            <Link href="/updates" className="hover:opacity-70 transition-opacity">Updates</Link>
            <Link href="/contact" className="hover:opacity-70 transition-opacity">Contact</Link>
            <Link href="/book" className="hover:opacity-70 transition-opacity">Book</Link>
          </div>
          
          <div className="flex flex-col gap-1.5 text-light-surface text-lg font-light font-inter-tight">
            <Link href="/info/info-hub" className="hover:opacity-70 transition-opacity">Info Hub</Link>
            <Link href="/info/faq" className="hover:opacity-70 transition-opacity">FAQs</Link>
            <Link href="/info/fleet" className="hover:opacity-70 transition-opacity">The Fleet</Link>
            <Link href="/info/voyage" className="hover:opacity-70 transition-opacity">The Voyage</Link>
            <Link href="/credits" className="hover:opacity-70 transition-opacity">Credits</Link>
          </div>
        </div>
      </div>

      {/* separator */}
      <div className="w-full h-[1px] bg-light-surface mt-10 mb-2 md:mb-5" />

      {/* row 2 */}
      <div className="flex items-center justify-between w-full mb-8 text-sm text-light-surface font-normal">
        <span>Website by <b>SJM</b></span>
        <span className="hidden lg:block">This website does not use <b>cookies</b></span>
        <span className="hidden md:block">Copyright 2026, all rights reserved</span>
      </div>


      {/* row 3 */}
      <div className="relative w-full mt-12 md:mt-16">
        <div className="relative w-full"> 
          <TTWordMark className="w-full h-auto text-light-surface" />
    
          {/* the memojis */}
          <div className="absolute top-0 left-0 w-full h-full  ">
            {/* jonathan */}
            <div className="group flex absolute flex-col items-center"
              style={{ left: "5.2%", top: "34%", transform: "rotate(-22.5deg)" }}
            >
              <div className="w-[5.8vw] h-auto shrink-0">
                <img src="/images/memoji/jonathan-memoji.png" className="w-full h-full object-contain" alt="Jonathan" />
              </div>
        
              <div className="mt-1 py-1.5 px-4 rounded-full hidden md:flex items-center justify-center whitespace-nowrap bg-[#B8D2FF] group-hover:bg-[#0864FF] text-blue-ink group-hover:text-light-surface group-hover:shadow-[1px_2px_18px_0px_rgba(8,100,255,0.5)] transition-all duration-200">
                <span className="curser-pointer text-[0.9vw] min-text-sm font-light font-inter-tight "> Jonathan G. </span>
              </div>
            </div>

            {/* satiya */}
            <div className="group flex absolute flex-col items-center"
              style={{ left: "49.5%", top: "5%", }}
            >
              <div className="mb-[-8px] ml-8 py-1.5 px-4 rounded-full hidden md:flex items-center justify-center whitespace-nowrap bg-[#FED8E7] group-hover:bg-[#FF0365] text-blue-ink group-hover:text-light-surface group-hover:shadow-[1px_2px_18px_0px_rgba(255,3,101,0.5)] transition-all duration-200">
                <span className="text-[0.9vw] min-text-sm font-light font-inter-tight"> Satiya W. </span>
              </div>

              <div className="w-[7.3vw] h-auto shrink-0">
                <img src="/images/memoji/satiya-memoji.png" className="w-full h-full object-contain" alt="Satiya" />
              </div>
            </div>

            {/* maath */}
            <div className="group flex absolute flex-col items-center"
              style={{ left: "86.1%", top: "-19%", transform: "rotate(15deg)" }}
            >
              <div className="w-[7.6vw] h-auto shrink-0">
                <img src="/images/memoji/maath-memoji.png" className="w-full h-full object-contain" alt="Maath" />
              </div>

              <div className="mt-[-16px] py-1.5 px-4 rounded-full hidden md:flex items-center justify-center whitespace-nowrap bg-[#CEFEBB] group-hover:bg-[#44EE00] text-blue-ink group-hover:text-light-surface group-hover:shadow-[1px_2px_18px_0px_rgba(68,238,0,0.5)] transition-all duration-200">
                <span className="text-[0.9vw] min-text-sm font-light font-inter-tight"> Maath A. </span>
              </div>
            </div>
            
          </div>
        </div>
      </div>

    </footer>
  );
}


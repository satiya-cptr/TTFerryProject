"use client";

// The menu
// consists of a main menu + a mini menu
// Slides off screen on mobile so the mini menu is usable 

// TODO 2: make the secondary options functional + maybe make site creds and opening hours mini panels

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { DoubleStackButton } from "./doubleStackButton";
import RollingText from "./rollingText";
import { motion, AnimatePresence } from "motion/react";


interface MenuPanelProps {
  onClose: () => void;
}

export default function MenuPanel({ onClose }: MenuPanelProps) {
  const [showInfo, setShowInfo] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // for the background stack
  const glassStack = (
    <>
      <Image
        src="/images/pexels-technobulka.webp"
        alt="Menu background"
        fill
        priority
        className="object-cover -z-20"
      />
      <div className="absolute inset-0 bg-blue-surface/30 backdrop-blur-md -z-10" />
    </>
  );

  const glassBorder = "relative overflow-hidden border border-light-surface/2 shadow-2xl";

  // variants for the big panel animation
  const panelVariants = {
    closed: { 
      x: "-110%", 
      rotate: 25, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.32, 0, 0.67, 0] as const, //eases in
        when: "afterChildren",
      }
    },
    open: { 
      x: 0, 
      rotate: 0, 
      opacity: 1,
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1] as const, // eases out
      }
    }
  };
  // variants for the mini panel animation
  const miniMenuVariants = {
    closed: { 
      x: -250, 
      opacity: 1,
      rotate: 25,
      transition: {
        duration: 0.4,
        ease: "easeInOut" as const, // must be as const, else error
      }
    },
    open: { 
      x: 0, 
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring" as const, 
        stiffness: 200,
        damping: 20,
        mass: 1
      }
    }
  };

  // Menu + mini menu items 
  // TODO: update with accurate hrefs
  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Schedule", href: "/schedule" },
    { name: "Updates", href: "/updates" },
  ];

  const infoItems = [
    { name: "The Fleet", href: "/info/fleet" },
    { name: "Info Hub", href: "/info/info-hub" },
    { name: "FAQ", href: "/info/faq" },
  ];

  const handleNavigation = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-blue-ink/20">
      <div
        ref={panelRef}
        className={`fixed left-2.5 top-[calc(env(safe-area-inset-top)+10px)] flex items-center gap-[10px] transition-transform duration-500 ease-in-out ${showInfo ? "-translate-x-[80%] md:translate-x-0" : "translate-x-0"} `}
      >
        {/* wrapper */}
        <motion.div 
          variants={panelVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="relative origin-top-left flex items-center"
        >
          {/* main panel box */}
          <div className={`${glassBorder} relative z-100 w-[calc(100vw-20px)] md:w-[348px] rounded-[32px] p-[44px] text-light-surface flex flex-col overflow-hidden`}>
            {glassStack}

            {/* close btn, need to replace w rolling text + make 'x' rotate */}
            <button 
              onClick={onClose} 
              className="flex items-center gap-1 self-start mb-6 hover:text-butter transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
              <span className="text-sm font-light tracking-wider">MENU</span>
            </button>

            {/* main items */}
            <nav className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <motion.button 
                  key={item.name}
                  initial="rest" 
                  whileHover="hover" 
                  animate="rest"
                  onClick={() => handleNavigation(item.href)}
                  className=" relative text-3xl font-light text-left hover:text-butter transition-colors"
                >
                  {/* little indicator */}
                  {pathname === item.href && (
                    <div 
                      className="absolute -left-[22px] top-[40%] w-2 h-2 bg-butter rounded-[2px] rotate-45"
                      aria-hidden="true" 
                    />
                  )}
                  <RollingText primary={item.name} secondary={item.name} />
                </motion.button>
              ))}
              

              <motion.button 
                initial="rest" 
                whileHover="hover" 
                animate="rest"
                onClick={() => setShowInfo(!showInfo)} //toggle mini menu
                className="relative text-3xl font-light text-left hover:text-butter transition-colors flex items-center gap-2 w-full group"
              >
                {/* indicator */}
                {pathname.startsWith('/info') && (
                  <div className="absolute -left-[22px] w-2 h-2 bg-butter rounded-[2px] rotate-45" />
                )}
                <RollingText primary="Information" secondary="Information" />
                {/* chevron */}
                <motion.div
                  animate={{ rotate: showInfo ? 0 : 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="flex items-center justify-end"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={24} strokeWidth={1.5} />
                </motion.div>
              </motion.button>

              <motion.button 
                initial="rest" 
                whileHover="hover" 
                animate="rest"
                onClick={() => handleNavigation("/contact")}
                className="relative text-3xl font-light text-left hover:text-butter transition-colors"
              >
                {pathname.startsWith('/contact') && (
                  <div className="absolute -left-[22px] top-[40%] w-2 h-2 bg-butter rounded-[2px] rotate-45" />
                )}
                <RollingText primary="Contact" secondary="Contact" />
              </motion.button>
            </nav>

            {/* secondary items  */}
            <div className="mt-[44px] flex flex-col gap-[4px]">
              {/* 1st row */}
              <div className="flex justify-between text-sm font-normal">
                <button 
                  onClick={() => handleNavigation("/credits")}
                  className="text-light-surface/60 hover:text-butter transition-colors"
                >
                  site credits
                </button>
                <button className="text-light-surface/60 hover:text-butter cursor-default transition-colors"> 1(868)625-3055 </button>
              </div>
    
              {/* 2nd row */}
              <div className="flex justify-between text-sm font-normal">
                <button 
                  onClick={() => handleNavigation("/hours")}
                  className="text-light-surface/60 hover:text-butter transition-colors"
                >
                  opening hours
                </button>
                <button className="text-light-surface/60 hover:text-butter cursor-default transition-colors"> help@ttferry.com </button>
              </div>
            </div>

            {/* bottom btn */}
            <div className="mt-8">
              <DoubleStackButton variant="light" className="w-full hover:text-butter transition-colors" onClick={() => handleNavigation("/book")} >
                <RollingText primary={"book tickets"} secondary={"book tickets"} />
              </DoubleStackButton>
            </div>
          </div>

          {/* mini menu */}
          <AnimatePresence>
            {showInfo && (
              <motion.div 
                variants={miniMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="absolute z-90 left-[calc(100%+10px)] top-1/2 -translate-y-1/2 flex flex-col items-start gap-[10px]"
              >
                <div className={`${glassBorder} rounded-[32px] p-6 pr-14 pb-8 text-light-surface overflow-hidden`}>
                  {glassStack}
                  <p className="text-xs font-normal mb-6 opacity-60">INFORMATION</p>
                  <nav className="flex flex-col gap-3">
                    {infoItems.map((item) => (
                      <motion.button 
                        key={item.name}
                        initial="rest" 
                        whileHover="hover" 
                        animate="rest"
                        onClick={() => handleNavigation(item.href)}
                        className="text-xl font-light text-left hover:text-butter transition-colors"
                      >
                        <RollingText primary={item.name} secondary={item.name} />
                      </motion.button>
                    ))}
                  </nav>
                </div>

                {/* close btn */}
                <button 
                  onClick={() => setShowInfo(false)}
                  className={`${glassBorder} w-[55px] h-[55px] rounded-full flex items-center justify-center text-light-surface hover:text-butter transition-colors self-start overflow-hidden`}
                >
                  {glassStack}
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={28} strokeWidth={1.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, DashboardBrowsingIcon, Ticket02Icon, UserCircleIcon } from "@hugeicons/core-free-icons";
import TicketButton from '../ui/ticketButton';
import TTWordMark from "../logos/ttWordMark";
import TTWordmarkShort from "../logos/ttWordMarkShort";
import RollingText from './rollingText';
import { AnimatePresence, motion } from "framer-motion";
import MenuPanel from "./menuPanel";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

export default function Header() {
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserData(null);
        return;
      }

      setUser(firebaseUser);

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      setUserData(userDoc.data());
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <header className="fixed left-0 right-0 z-50 top-[calc(env(safe-area-inset-top)+10px)]">
        
        {/* safe area */}
        <div className="px-[10px]">
          
          {/* glassy background, shows on scroll */}
          <div
            className={`
              w-full rounded-full px-4 md:px-9 py-3 flex items-center justify-between transition-all duration-300 ease-out

              ${
                scrolled
                  ? "bg-light-surface/12 border border-light-surface/18 backdrop-blur-sm"
                  : "bg-transparent border border-transparent"
              }
            `}
          >

            {/*  left content  */}
            <motion.button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-3 p-4 -m-4"
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              <Image
                src="/images/icons/menu.svg"
                alt="Menu"
                width={32}
                height={6}
                className="w-6 h-[6px] lg:w-8 lg:h-[8px]"
              />

              <span className="hidden sm:block text-sm font-normal uppercase text-blue-ink font-inter">
                <RollingText primary="MENU" secondary="MENU" />
              </span>
            </motion.button>


            {/*  center content, leads back home  */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 p-3 -m-3" >
              <TTWordMark className="hidden lg:block w-[111px] h-auto text-blue-ink" />
              <TTWordmarkShort className=" lg:hidden w-[31px] h-auto text-blue-ink" />
            </Link>

            {/* right content */}
            <div className="flex items-center gap-4 md:gap-8">

              {/* my booking btn */}
              <motion.button 
                onClick={() => router.push("/auth?tab=guest")}
                className="flex items-center gap-2 text-blue-ink p-4 -m-4"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <div className="md:hidden">
                  <HugeiconsIcon icon={Ticket02Icon} size={24} strokeWidth={1.5} />
                </div>
                <div className="hidden md:block">
                  <HugeiconsIcon icon={Ticket02Icon} size={20} strokeWidth={1.5} />
                </div>
                
                <span className="hidden sm:block text-sm font-normal uppercase font-inter">
                  <RollingText primary="MY BOOKING" secondary="MY BOOKING" />
                </span>
              </motion.button>

              {/* log in btn */}
              <motion.button 
                onClick={() => router.push(user ? "/account" : "/auth?tab=account")}
                className="flex items-center gap-2 text-blue-ink p-4 -m-4"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <div className="md:hidden">
                  <HugeiconsIcon icon={UserCircleIcon} size={24} strokeWidth={1.5} />
                </div>
                <div className="hidden md:block">
                  <HugeiconsIcon icon={UserCircleIcon} size={20} strokeWidth={1.5} />
                </div>
                <span className="hidden sm:block text-sm font-normal uppercase font-inter">
                  <RollingText
                    primary={user ? `HI, ${userData?.firstName || "..."}` : "LOG IN"}
                    secondary={user ? `HI, ${userData?.firstName || "..."}` : "LOG IN"}
                  />
                </span>
              </motion.button>

              {user && userData?.role === "admin" && (
                <motion.button
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-2 text-blue-ink p-4 -m-4"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <div className="md:hidden">
                    <HugeiconsIcon icon={DashboardBrowsingIcon} size={24} strokeWidth={1.5} />
                  </div>
                  <div className="hidden md:block">
                    <HugeiconsIcon icon={DashboardBrowsingIcon} size={20} strokeWidth={1.5} />
                  </div>
                
                  <span className="hidden sm:block text-sm font-normal uppercase font-inter ">
                    <RollingText primary="ADMIN CONTROLS" secondary="ADMIN CONTROLS" />
                  </span>
                </motion.button>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* for the menu panel */}
      <AnimatePresence>
        {menuOpen && ( <MenuPanel onClose={() => setMenuOpen(false)} /> )}
      </AnimatePresence>
    </>
  );
}


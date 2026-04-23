"use client";

import { motion } from "framer-motion";

interface RollingTextProps {
  primary: string;
  secondary: string;
}

// NOTE: For some reason, this alters the padding of certain elements when used inside them
// making the padding a few pixels larger than it should be (specifically by 3px) fixes it.

// NOTE: this chops off descenders in buttons, yikes

export default function RollingText({ primary, secondary }: RollingTextProps) {
  const letters1 = primary.split("");
  const letters2 = secondary.split("");

  const container = {
    rest: {},
    hover: {
      transition: { staggerChildren: 0.01 },
    },
  };

  const letter = {
    rest: { y: 0 },
    hover: { y: "-110%" },
  };

  const letterSecondary = {
    rest: { y: "100%" },
    hover: { y: 0 },
  };

  return (
    <motion.span className="relative block overflow-hidden leading-none align-middle">
      <motion.span className="flex items-center" variants={container}>
        {letters1.map((char, i) => (
          <motion.span
            key={i}
            className="relative inline-block leading-none"
            style={{ width: char === " " ? "0.26em" : "auto" }}
          >
            <motion.span
              className="block leading-none"
              variants={letter}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {char}
            </motion.span>

            <motion.span
              className="absolute left-0 top-0 block"
              variants={letterSecondary}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {letters2[i] || char}
            </motion.span>
          </motion.span>
        ))}
      </motion.span>
    </motion.span>
  );
}

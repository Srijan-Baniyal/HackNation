"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  /** Optional id for in-page anchors. */
  id?: string;
  /** Index used to stagger sibling reveals (0,1,2…). */
  index?: number;
}

/**
 * A lightweight scroll-triggered fade-up. We use Motion's whileInView
 * so it works without an explicit IntersectionObserver hook.
 */
export function RevealSection({
  children,
  className,
  index = 0,
  id,
}: RevealSectionProps) {
  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, y: 22 }}
      transition={{
        delay: 0.05 + index * 0.06,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true, amount: 0.18 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.section>
  );
}

"use client";

import gsap from "gsap";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

interface AnimatedHeroProps {
  /** Text shown as the eyebrow tag above the headline. */
  eyebrow: string;
  /** Subhead rendered after the title finishes animating. */
  subhead: string;
  /** Title rendered word-by-word for the GSAP reveal. */
  title: string;
}

/**
 * Headline with a GSAP word-by-word reveal + a Motion fade for the
 * supporting text. Falls back to plain text if JS hasn't loaded.
 */
export function AnimatedHero({ eyebrow, title, subhead }: AnimatedHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }
    const words = node.querySelectorAll<HTMLSpanElement>("[data-word]");
    if (words.length === 0) {
      return;
    }
    const tween = gsap.fromTo(
      words,
      {
        yPercent: 110,
        opacity: 0,
        rotate: 6,
      },
      {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        duration: 0.95,
        stagger: 0.045,
        ease: "power3.out",
      }
    );
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div className="grid gap-6">
      <motion.span
        animate={{ opacity: 1, y: 0 }}
        className="text-muted-foreground text-xs uppercase tracking-[0.18em]"
        initial={{ opacity: 0, y: 6 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {eyebrow}
      </motion.span>

      <h1
        className="font-display text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl"
        ref={containerRef}
      >
        {(() => {
          const words = title.split(" ");
          let cursor = 0;
          return words.map((word) => {
            const start = title.indexOf(word, cursor);
            cursor = start + word.length;
            return (
              <span
                className="mr-[0.18em] inline-block overflow-hidden align-bottom"
                key={`${word}-${start}`}
              >
                <span className="inline-block" data-word>
                  {word}
                </span>
              </span>
            );
          });
        })()}
      </h1>

      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl text-base text-muted-foreground leading-7 sm:text-lg sm:leading-8"
        initial={{ opacity: 0, y: 8 }}
        transition={{ delay: 0.7, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {subhead}
      </motion.p>
    </div>
  );
}

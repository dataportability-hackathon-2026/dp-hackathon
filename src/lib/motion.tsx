"use client";

import { motion, useInView } from "motion/react";
import { type ReactNode, useRef } from "react";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

/**
 * Fade-in with directional slide. Triggers once when scrolled into view.
 */
export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  as: Tag = motion.div,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  as?: typeof motion.div | typeof motion.section | typeof motion.header;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const directionMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <Tag
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        y: directionMap[direction].y,
        x: directionMap[direction].x,
      }}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0 }
          : {
              opacity: 0,
              y: directionMap[direction].y,
              x: directionMap[direction].x,
            }
      }
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/**
 * Container that staggers its children into view.
 * Wrap each child in <StaggerItem>.
 */
export function StaggerList({
  children,
  className = "",
  staggerDelay = 0.08,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A single child inside a <StaggerList>. Fades up into place.
 */
export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

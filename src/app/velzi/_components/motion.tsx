"use client";

import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fires once when the element first scrolls into view. */
export function useInView<T extends HTMLElement>(rootMargin = "-40px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    // Anything already on screen counts immediately. The observer alone is not
    // enough: it samples position when observation starts, and elements below
    // a still-settling layout can be reported as outside the viewport and then
    // never revisited.
    const rect = node.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewportH && rect.bottom > 0) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

/** Fades + lifts children into place on first view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`v-reveal ${inView ? "is-in" : ""} ${className}`.trim()}
      style={{ ["--d" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Eases a number up from zero the first time it is seen.
 * Reduced-motion users get the final value immediately.
 */
export function CountUp({
  value,
  format,
  duration = 1250,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (prefersReducedMotion() || value === 0) {
      setShown(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo — fast out of the gate, settles precisely on the value
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setShown(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {format(shown)}
    </span>
  );
}

/** Moves a radial sheen to follow the pointer across a card. */
export function useSheen<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      node.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    node.addEventListener("pointermove", onMove);
    return () => node.removeEventListener("pointermove", onMove);
  }, []);

  return ref;
}

/** Subtle 3D tilt toward the pointer. */
export function useTilt<T extends HTMLElement = HTMLDivElement>(strength = 7) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg)`;
    };
    const reset = () => {
      node.style.transform = "";
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", reset);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", reset);
    };
  }, [strength]);

  return ref;
}

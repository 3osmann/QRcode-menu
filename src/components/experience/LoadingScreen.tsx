"use client";

import { useProgress } from "@react-three/drei";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

/** Full-screen intro shown while the 3D kitchen loads, then fades away. */
export function LoadingScreen() {
  const { progress } = useProgress();
  const [visible, setVisible] = useState(true);
  const overlay = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const started = useRef(Date.now());

  useEffect(() => {
    if (bar.current) gsap.to(bar.current, { scaleX: Math.max(0.04, progress / 100), duration: 0.6, ease: "power2.out" });
  }, [progress]);

  useEffect(() => {
    // Minimum display time, so the intro animation can play even if the assets are cached.
    const remaining = Math.max(0, 2200 - (Date.now() - started.current));
    const timer = window.setTimeout(() => {
      const node = overlay.current;
      if (!node) return setVisible(false);
      gsap.to(node, {
        opacity: 0,
        duration: 0.9,
        ease: "power2.inOut",
        onComplete: () => setVisible(false),
      });
    }, remaining);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!overlay.current) return;
    const letters = overlay.current.querySelectorAll("[data-letter]");
    gsap.fromTo(letters, { opacity: 0, y: 18, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.04, ease: "power3.out" });
  }, []);

  if (!visible) return null;

  const title = "EMBER RAMEN BAR".split("");
  return (
    <div
      ref={overlay}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0604] px-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,150,70,0.18),transparent_60%)]" aria-hidden="true" />
      <p className="relative font-display text-4xl tracking-[0.2em] text-[#fbeed6] sm:text-6xl">
        {title.map((letter, index) => (
          <span key={index} data-letter className="inline-block whitespace-pre">
            {letter}
          </span>
        ))}
      </p>
      <p className="relative mt-4 text-xs uppercase tracking-[0.35em] text-[#d9a85c]">Lighting the kitchen</p>
      <div className="relative mt-8 h-px w-56 overflow-hidden bg-white/10">
        <div ref={bar} className="h-full origin-left scale-x-[0.04] bg-gradient-to-r from-[#f0c77f] to-[#d9753a]" />
      </div>
      <p className="relative mt-3 font-mono text-[11px] text-[#8f7a61]">{Math.round(progress)}%</p>
    </div>
  );
}

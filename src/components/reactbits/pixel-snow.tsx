"use client";

import { useEffect, useRef } from "react";

type PixelSnowProps = {
  className?: string;
  /** Number of falling pixels (default ~80) */
  count?: number;
  /** Base color (default: theme-friendly white/80) */
  color?: string;
  /** Max pixel size in px (default 3) */
  maxSize?: number;
  /** Fall speed multiplier (default 1) */
  speed?: number;
};

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
}

export function PixelSnow({
  className = "",
  count,
  maxSize = 3,
  speed = 1,
  color,
}: PixelSnowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr =
      typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const n = count ?? Math.min(100, Math.floor((w * h) / 12000));
      particlesRef.current = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1 + Math.random() * (maxSize - 1),
        speed: 0.5 + Math.random() * 1.5,
        drift: (Math.random() - 0.5) * 0.5,
        opacity: 0.4 + Math.random() * 0.5,
      }));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const w = () => canvas.clientWidth;
    const h = () => canvas.clientHeight;

    const tick = () => {
      const width = w();
      const height = h();
      ctx.clearRect(0, 0, width, height);

      const baseColor = color ?? "255, 255, 255";

      for (const p of particlesRef.current) {
        p.y += p.speed * speed;
        p.x += p.drift * speed;
        if (p.y > height) {
          p.y = -p.size * 2;
          p.x = Math.random() * width;
        }
        if (p.x < -2) p.x = width + 2;
        if (p.x > width + 2) p.x = -2;

        ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [count, maxSize, speed, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ width: "100%", height: "100%" }}
      aria-hidden
    />
  );
}

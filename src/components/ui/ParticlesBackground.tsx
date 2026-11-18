"use client";

const STATIC_PARTICLES = [
  { id: 1, x: 15, y: 20, size: 2.5, duration: 18, delay: 0 },
  { id: 2, x: 75, y: 15, size: 2, duration: 22, delay: 1 },
  { id: 3, x: 40, y: 60, size: 3, duration: 20, delay: 2 },
  { id: 4, x: 85, y: 70, size: 2, duration: 25, delay: 0.5 },
  { id: 5, x: 25, y: 80, size: 2.5, duration: 19, delay: 3 },
  { id: 6, x: 60, y: 35, size: 2, duration: 24, delay: 1.5 },
];

export function ParticlesBackground() {
  return (
    <div className="hidden sm:block fixed inset-0 pointer-events-none z-[-15] overflow-hidden opacity-25">
      {STATIC_PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-purple-500/80 animate-pulse will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: "translateZ(0)",
          }}
        />
      ))}
    </div>
  );
}

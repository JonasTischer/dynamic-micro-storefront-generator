'use client';
import React from 'react';

export function RocketLoader() {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-gradient-to-b from-transparent to-white/60 backdrop-blur-[1px] pointer-events-none">
      <div className="relative w-56 h-56">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white opacity-60"
            style={{
              width: Math.random() > 0.7 ? 3 : 2,
              height: Math.random() > 0.7 ? 3 : 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle 1.8s ease-in-out ${Math.random()}s infinite`,
            }}
          />
        ))}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ animation: 'launch 2.4s ease-in infinite' }}>
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M48 6c14 12 18 32 18 44 0 6-2 12-6 16H34c-4-4-6-10-6-16 0-12 4-32 20-44z" fill="#ff6a6a" stroke="#e14f4f" strokeWidth="3" />
            <circle cx="48" cy="34" r="8" fill="#fff1f1" />
            <path d="M28 68c-6 2-12 10-12 18 6-2 12-6 16-10" fill="#5ad0ff" />
            <path d="M68 68c6 2 12 10 12 18-6-2-12-6-16-10" fill="#5ad0ff" />
            <path d="M48 72c8 6 8 14 0 20-8-6-8-14 0-20z" fill="#ffd166">
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.6s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>

        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={`smoke-${i}`}
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-gray-300/70"
            style={{
              width: 10 + i * 4,
              height: 10 + i * 4,
              bottom: 16,
              filter: 'blur(1px)',
              animation: `smoke 1.6s ease-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes launch {
          0%   { transform: translate(-50%, 0) }
          60%  { transform: translate(-50%, -70%) }
          100% { transform: translate(-50%, -120%) }
        }
        @keyframes smoke {
          0%   { transform: translate(-50%, 0) scale(0.8); opacity: .7 }
          100% { transform: translate(-50%, 60px) scale(1.6); opacity: 0 }
        }
        @keyframes twinkle {
          0%,100% { opacity: .3 }
          50%     { opacity: 1 }
        }
      `}</style>
    </div>
  );
}
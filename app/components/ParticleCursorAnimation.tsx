'use client';

import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { animate, createTimer } from 'animejs';

// Helper function to get random number in a range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

const ParticleCursorAnimation: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const animationWrapperRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<HTMLDivElement[]>([]);
  const pointer = useRef({ x: 0, y: 0, isDown: false, radius: 15 }).current;
  const numParticles = 150;
  const baseRadius = 15;
  const activeRadius = 45;
  let radiusTimeoutTimer: ReturnType<typeof createTimer> | null = null;

  useEffect(() => {
    setIsClient(true);
    particleRefs.current = []; // Reset refs on mount

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Initialize particles and main event listeners once client-side
  useEffect(() => {
    if (!isClient || !animationWrapperRef.current) return;

    // Initialize Radius Timeout Timer
    radiusTimeoutTimer = createTimer({
      duration: 150,
      autoplay: false,
      onComplete: () => {
        pointer.radius = baseRadius;
      },
    });

    // Particle Animation Loop
    const animateParticle = (el: HTMLDivElement) => {
      if (!el) return;
      createTimer({
        loop: true,
        frameRate: 10,
        onUpdate: () => {
          if (!el) return;
          const angle = Math.random() * Math.PI * 2;
          const currentRadius = pointer.isDown ? activeRadius : pointer.radius;
          const targetX = Math.cos(angle) * currentRadius + pointer.x;
          const targetY = Math.sin(angle) * currentRadius + pointer.y;

          animate(el, {
            translateX: targetX,
            translateY: targetY,
            scale: random(0.4, 1.2),
            opacity: random(0.3, 0.8),
            backgroundColor: [
              'hsl(0, 100%, 70%)',
              'hsl(30, 100%, 70%)',
              'hsl(45, 100%, 70%)',
            ],
            duration: random(300, 800),
            easing: `easeOutExpo`,
          });
        },
      });
    };

    // Create and start animation for each particle
    particleRefs.current.forEach((el, i) => {
        setTimeout(() => animateParticle(el), i * 2); 
    });

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

  }, [isClient]);

  const handleMouseMove = (e: MouseEvent) => {
    pointer.x = e.clientX - window.innerWidth / 2;
    pointer.y = e.clientY - window.innerHeight / 2;
    pointer.radius = pointer.isDown ? activeRadius : baseRadius * 1.25;
    if (radiusTimeoutTimer) radiusTimeoutTimer.restart();
  };

  const handleMouseDown = () => {
    pointer.isDown = true;
    pointer.radius = activeRadius;
    if (radiusTimeoutTimer) radiusTimeoutTimer.pause();
  };

  const handleMouseUp = () => {
    pointer.isDown = false;
    pointer.radius = baseRadius;
    if (radiusTimeoutTimer) radiusTimeoutTimer.restart();
  };

  if (!isClient) {
    return null;
  }

  return (
    <div
      ref={animationWrapperRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '1px',
        height: '1px',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    >
      {Array.from({ length: numParticles }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) particleRefs.current[i] = el; }}
          className="particle"
          style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'hsl(0, 100%, 70%)',
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleCursorAnimation; 
'use client';

import React, { useEffect, useRef } from 'react';

interface MovingStarsProps {
  starColor?: string;
}

const MovingStars: React.FC<MovingStarsProps> = ({ starColor = '#ffffff' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mouse = { x: 0, y: 0 };
    const stars: { 
      x: number; 
      y: number; 
      originalX: number;
      originalY: number;
      size: number; 
      speed: number; 
      opacity: number 
    }[] = [];

    // Create stars
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      stars.push({
        x,
        y,
        originalX: x,
        originalY: y,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.2 + 0.1,
        opacity: Math.random() * 0.8 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Calculate distance from mouse
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        // Mouse interaction effect
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          star.x -= Math.cos(angle) * force * 3;
          star.y -= Math.sin(angle) * force * 3;
        } else {
          // Return to original position slowly
          star.x += (star.originalX - star.x) * 0.02;
          star.y += (star.originalY - star.y) * 0.02;
        }

        // Normal upward movement
        star.originalY -= star.speed;
        star.y -= star.speed;
        
        // Reset star position if it goes off screen
        if (star.originalY < 0) {
          star.originalY = canvas.height;
          star.y = canvas.height;
          star.originalX = Math.random() * canvas.width;
          star.x = star.originalX;
        }

        // Draw star with glow effect when near cursor
        const glowIntensity = distance < maxDistance ? (maxDistance - distance) / maxDistance : 0;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        // Add glow when near cursor
        if (glowIntensity > 0) {
          ctx.shadowBlur = 15 * glowIntensity;
          ctx.shadowColor = 'rgba(244, 194, 161, 0.8)';
        } else {
          ctx.shadowBlur = 0;
        }
        
        const color = starColor === '#ffffff' ? '255, 255, 255' : '0, 0, 0';
        ctx.fillStyle = `rgba(${color}, ${star.opacity + glowIntensity * 0.3})`;
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

export default MovingStars;
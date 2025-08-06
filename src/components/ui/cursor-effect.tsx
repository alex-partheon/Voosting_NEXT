'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CursorEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(isInteractive);
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <>
      <motion.div
        className="pointer-events-none fixed z-50 h-4 w-4 rounded-full bg-primary mix-blend-difference"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isPointer ? 1.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
      <motion.div
        className="pointer-events-none fixed z-50 h-10 w-10 rounded-full border-2 border-primary/30 mix-blend-difference"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isPointer ? 1.2 : 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      />
    </>
  );
}
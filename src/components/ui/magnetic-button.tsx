'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'button' | 'div';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function MagneticButton({ 
  children, 
  className = '', 
  onClick, 
  as = 'button',
  type = 'button',
  disabled = false
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  
  const MotionComponent = as === 'div' ? motion.div : motion.button;
  
  const props = {
    ref,
    onMouseMove: handleMouse,
    onMouseLeave: reset,
    animate: { x, y },
    transition: { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 },
    className,
    onClick,
    ...(as === 'button' && { type, disabled })
  } as any;

  return (
    <MotionComponent {...props}>
      {children}
    </MotionComponent>
  );
}
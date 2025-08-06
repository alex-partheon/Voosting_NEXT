'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function LiquidTransition({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="relative overflow-hidden">
      <motion.div
        initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        animate={{ clipPath: isVisible ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)' }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}
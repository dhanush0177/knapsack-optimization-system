import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CounterAnimationProps {
  value: number;
  duration?: number;
  format?: (val: number) => string;
}

export function CounterAnimation({ value, duration = 1, format = (v) => v.toString() }: CounterAnimationProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = count;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = startValue + (value - startValue) * easeOut;
      
      setCount(currentVal);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-block tabular-nums"
    >
      {format(Math.round(count))}
    </motion.span>
  );
}

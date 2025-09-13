'use client';

import { motion } from 'framer-motion';
import { StaticGear } from './FloatingGears';
import { useState } from 'react';

interface InteractiveGearElementProps {
  children: React.ReactNode;
  className?: string;
  gearSize?: number;
  gearColor?: string;
  gearPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function InteractiveGearElement({
  children,
  className = '',
  gearSize = 24,
  gearColor = '#f97316',
  gearPosition = 'top-right'
}: InteractiveGearElementProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getGearPositionClasses = () => {
    switch (gearPosition) {
      case 'top-left':
        return '-top-3 -left-3';
      case 'top-right':
        return '-top-3 -right-3';
      case 'bottom-left':
        return '-bottom-3 -left-3';
      case 'bottom-right':
        return '-bottom-3 -right-3';
      default:
        return '-top-3 -right-3';
    }
  };

  return (
    <motion.div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {children}
      
      {/* Interactive gear that appears on hover */}
      <motion.div
        className={`absolute ${getGearPositionClasses()} pointer-events-none`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: isHovered ? 0.6 : 0,
          scale: isHovered ? 1 : 0,
        }}
        transition={{ 
          duration: 0.3, 
          ease: 'easeOut' 
        }}
      >
        <StaticGear 
          size={gearSize} 
          color={gearColor} 
          duration={8} 
          direction="clockwise"
        />
      </motion.div>
    </motion.div>
  );
}
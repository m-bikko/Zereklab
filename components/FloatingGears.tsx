'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GearProps {
  size: number;
  color: string;
  rotation: number;
  duration: number;
  x: number;
  y: number;
  opacity: number;
}

const GearSVG = ({ 
  size, 
  color, 
  className = '' 
}: { 
  size: number; 
  color: string; 
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l1.86-1.41c.2-.15.25-.42.13-.64l-1.74-3.18c-.12-.22-.39-.31-.61-.22L17.5 5.5c-.58-.45-1.27-.81-2-1.03L15.22.98c-.03-.24-.24-.4-.5-.4h-3.44c-.26 0-.47.16-.5.4L10.5 4.47c-.73.22-1.42.58-2 1.03L6.93 4.04c-.22-.09-.49 0-.61.22L4.58 7.44c-.12.22-.07.49.13.64L6.57 9.5c-.04.34-.07.67-.07 1c0 .33.03.65.07.97L4.71 12.88c-.2.15-.25.42-.13.64l1.74 3.18c.12.22.39.31.61.22l1.57-.66c.58.45 1.27.81 2 1.03l.28 3.49c.03.24.24.4.5.4h3.44c.26 0 .47-.16.5-.4l.28-3.49c.73-.22 1.42-.58 2-1.03l1.57.66c.22.09.49 0 .61-.22l1.74-3.18c.12-.22.07-.49-.13-.64L17.43 13z"/>
  </svg>
);

const FloatingGear = ({ 
  size, 
  color, 
  rotation, 
  duration, 
  x, 
  y, 
  opacity 
}: GearProps) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        opacity,
      }}
      initial={{ 
        rotate: rotation,
        scale: 0,
        opacity: 0 
      }}
      animate={{ 
        rotate: rotation + 360,
        scale: 1,
        opacity,
      }}
      transition={{
        rotate: {
          duration,
          repeat: Infinity,
          ease: 'linear',
        },
        scale: {
          duration: 0.8,
          ease: 'easeOut',
          delay: Math.random() * 2,
        },
        opacity: {
          duration: 0.8,
          ease: 'easeOut',
          delay: Math.random() * 2,
        }
      }}
    >
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: duration * 0.7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: Math.random() * 3,
        }}
      >
        <GearSVG size={size} color={color} />
      </motion.div>
    </motion.div>
  );
};

interface FloatingGearsProps {
  gearCount?: number;
  containerHeight?: string;
  colors?: string[];
  className?: string;
}

export default function FloatingGears({ 
  gearCount = 6,
  containerHeight = "100%",
  colors = [
    '#f97316', // Primary orange
    '#fb923c', // Primary orange 400
    '#ea580c', // Primary orange 600
    '#3b82f6', // Secondary blue
    '#60a5fa', // Secondary blue 400
    '#2563eb', // Secondary blue 600
    'rgba(249, 115, 22, 0.6)', // Semi-transparent orange
    'rgba(59, 130, 246, 0.6)', // Semi-transparent blue
  ],
  className = ""
}: FloatingGearsProps) {
  const [gears, setGears] = useState<GearProps[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (containerWidth === 0) return;

    const newGears: GearProps[] = [];
    const adjustedGearCount = Math.min(gearCount, Math.floor(containerWidth / 200)); // Responsive gear count

    for (let i = 0; i < adjustedGearCount; i++) {
      newGears.push({
        size: Math.random() * 40 + 20, // 20-60px
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        duration: Math.random() * 15 + 10, // 10-25 seconds
        x: Math.random() * 90 + 5, // 5-95% from left
        y: Math.random() * 80 + 10, // 10-90% from top
        opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4 opacity
      });
    }

    setGears(newGears);
  }, [containerWidth, gearCount, colors]);

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ height: containerHeight }}
    >
      {gears.map((gear, index) => (
        <FloatingGear key={index} {...gear} />
      ))}
    </div>
  );
}

// Individual Gear component for targeted placement
export const StaticGear = ({
  size = 40,
  color = '#f97316',
  duration = 15,
  className = '',
  direction = 'clockwise'
}: {
  size?: number;
  color?: string;
  duration?: number;
  className?: string;
  direction?: 'clockwise' | 'counterclockwise';
}) => {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ 
        rotate: direction === 'clockwise' ? 360 : -360 
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <GearSVG size={size} color={color} />
    </motion.div>
  );
};
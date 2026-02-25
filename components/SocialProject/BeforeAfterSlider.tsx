'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'До',
  afterLabel = 'После',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const position = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPosition(position);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const width = rect.width;
      const position = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPosition(position);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isResizing]);

  if (!beforeImage || !afterImage) return null;

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full cursor-ew-resize select-none overflow-hidden rounded-xl"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-cover"
          draggable={false}
        />
        <span className="absolute right-4 top-4 rounded bg-black/50 px-2 py-1 text-sm font-medium text-white backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>

      {/* Before Image (Foreground with Clip) */}
      <div
        className="absolute inset-0 border-r-2 border-white"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover"
          draggable={false}
        />
        <span className="absolute left-4 top-4 rounded bg-black/50 px-2 py-1 text-sm font-medium text-white backdrop-blur-sm">
          {beforeLabel}
        </span>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute bottom-0 top-0 z-10 flex w-1 cursor-ew-resize items-center justify-center bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors group-hover:bg-primary-500"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="-ml-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition-transform group-hover:scale-110">
          <MoveHorizontal size={16} />
        </div>
      </div>
    </div>
  );
}

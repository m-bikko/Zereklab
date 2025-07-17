'use client';

import { useEffect } from 'react';

import Image from 'next/image';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageModalProps {
  images: string[];
  selectedIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  alt: string;
}

export default function ImageModal({
  images,
  selectedIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  alt,
}: ImageModalProps) {
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrevious();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrevious, onNext]);

  if (!images || images.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/90"
            aria-label="Закрыть просмотр изображения"
          >
            <X className="h-6 w-6" />
          </motion.button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.1 }}
                onClick={e => {
                  e.stopPropagation();
                  onPrevious();
                }}
                className="absolute left-4 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/90"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.1 }}
                onClick={e => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-4 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/90"
                aria-label="Следующее изображение"
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            </>
          )}

          {/* Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="relative mx-4 flex max-h-[90vh] max-w-[90vw] items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative max-h-[85vh] w-auto overflow-hidden rounded-lg shadow-2xl">
              <Image
                src={images[selectedIndex]}
                alt={`${alt} - изображение ${selectedIndex + 1} из ${images.length}`}
                width={1200}
                height={800}
                className="h-auto max-h-[85vh] w-auto object-contain"
                priority
                quality={95}
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    '/images/placeholder-product.svg';
                }}
              />
            </div>
          </motion.div>

          {/* Image Counter */}
          {images.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-full bg-black/50 px-4 py-2 text-sm text-white"
            >
              {selectedIndex + 1} из {images.length}
            </motion.div>
          )}

          {/* Thumbnail Navigation */}
          {images.length > 1 && images.length <= 8 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-16 left-1/2 flex -translate-x-1/2 transform gap-2"
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={e => {
                    e.stopPropagation();
                    // Trigger navigation to specific image
                    const diff = index - selectedIndex;
                    if (diff > 0) {
                      for (let i = 0; i < diff; i++) onNext();
                    } else if (diff < 0) {
                      for (let i = 0; i < Math.abs(diff); i++) onPrevious();
                    }
                  }}
                  className={`relative h-12 w-12 overflow-hidden rounded border-2 transition-all ${
                    selectedIndex === index
                      ? 'border-white ring-2 ring-white/50'
                      : 'border-white/50 hover:border-white'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Миниатюра ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        '/images/placeholder-product.svg';
                    }}
                  />
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

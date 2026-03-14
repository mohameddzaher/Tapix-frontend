'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { bannersApi } from '@/lib/api';
import { useLocalized } from '@/lib/i18n';

export function Hero() {
  const { l } = useLocalized();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: banners, isLoading } = useQuery({
    queryKey: ['homepage-banners'],
    queryFn: () => bannersApi.getByPosition('hero_main'),
  });

  // Map database banners to the expected format
  const mappedBanners = banners?.map((b: any) => ({
    _id: b._id,
    title: l(b, 'title') || '',
    image: { url: b.image },
  })) || [];

  const slides = mappedBanners;

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Hide if no banners and done loading
  if (!isLoading && slides.length === 0) return null;

  const currentBanner = slides[currentSlide];
  if (!currentBanner) return null;

  return (
    <section className="relative bg-dark-950 overflow-hidden">
      <div className="relative min-h-[360px] md:min-h-[440px]">
        {/* Background Slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner._id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0">
              <Image
                src={currentBanner.image?.url || '/images/hero-placeholder.jpg'}
                alt={currentBanner.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </motion.div>
        </AnimatePresence>


        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_: any, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/30 w-1.5 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;

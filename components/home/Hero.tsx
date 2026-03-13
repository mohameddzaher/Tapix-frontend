'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { bannersApi, cmsApi } from '@/lib/api';
import { Button } from '@/components/ui';
import { useTranslation, useLocalized } from '@/lib/i18n';

export function Hero() {
  const { t } = useTranslation();
  const { l } = useLocalized();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: banners, isLoading } = useQuery({
    queryKey: ['homepage-banners'],
    queryFn: () => bannersApi.getByPosition('hero_main'),
  });

  // Map database banners to the expected format
  const mappedBanners = banners?.map((b: any) => ({
    _id: b._id,
    title: l(b, 'title'),
    subtitle: l(b, 'subtitle'),
    description: l(b, 'subtitle'),
    image: { url: b.image },
    buttonText: l(b, 'linkText') || t('hero.shopNow'),
    buttonLink: b.link || '/products',
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
              <div className="absolute inset-0 bg-gradient-to-r from-dark-950/85 via-dark-950/50 to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 container-custom flex items-center h-full min-h-[360px] md:min-h-[440px] py-14 md:py-20">
          <div className="max-w-lg">
            {/* Subtitle tag */}
            {currentBanner.subtitle && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium tracking-wide mb-5 border border-white/10"
              >
                {currentBanner.subtitle}
              </motion.span>
            )}

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentBanner._id + '-title'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight"
              >
                {currentBanner.title}
              </motion.h1>
            </AnimatePresence>

            {/* Description */}
            {currentBanner.description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mt-4 text-base md:text-lg text-white/70 leading-relaxed"
              >
                {currentBanner.description}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mt-8"
            >
              <Link href={currentBanner.buttonLink || '/products'}>
                <Button
                  size="lg"
                  rightIcon={<HiArrowRight size={16} />}
                >
                  {currentBanner.buttonText || t('hero.shopNow')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

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

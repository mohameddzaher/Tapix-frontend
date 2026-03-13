'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HiOutlineFire, HiArrowRight } from 'react-icons/hi';
import { bannersApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { Button } from '@/components/ui';
import { useTranslation, useLocalized } from '@/lib/i18n';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeLeft(endsAt: Date | string | undefined): TimeLeft {
  if (!endsAt) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };

  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired: false,
  };
}

export function DealsSection() {
  const { t } = useTranslation();
  const { l } = useLocalized();

  const { data: banners, isLoading } = useQuery({
    queryKey: queryKeys.banners.byPosition('flash_deals'),
    queryFn: () => bannersApi.getByPosition('flash_deals'),
    staleTime: 1000 * 60 * 2,
  });

  const banner = banners?.[0];

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(banner?.endsAt)
  );

  useEffect(() => {
    if (!banner?.endsAt) return;

    setTimeLeft(calculateTimeLeft(banner.endsAt));

    const timer = setInterval(() => {
      const next = calculateTimeLeft(banner.endsAt);
      setTimeLeft(next);
      if (next.isExpired) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [banner?.endsAt]);

  if (!isLoading && !banner) return null;
  if (timeLeft.isExpired && !isLoading && banner?.endsAt) return null;

  if (isLoading) {
    return (
      <section className="py-10 md:py-14 bg-dark-950">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-dark-800 rounded-full animate-pulse" />
              <div className="h-10 w-3/4 bg-dark-800 rounded-lg animate-pulse" />
              <div className="h-5 w-1/2 bg-dark-800 rounded-lg animate-pulse" />
              <div className="flex gap-3 mt-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-14 h-20 bg-dark-800 rounded-xl animate-pulse" />
                ))}
              </div>
              <div className="h-12 w-40 bg-dark-800 rounded-lg animate-pulse mt-4" />
            </div>
            <div className="aspect-[4/3] bg-dark-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  const title = l(banner, 'title');
  const subtitle = l(banner, 'subtitle');
  const linkText = l(banner, 'linkText') || t('deals.viewAllDeals');
  const linkUrl = banner.link || '/deals';
  const imageUrl = banner.image;
  const mobileImageUrl = banner.mobileImage || imageUrl;

  const timerUnits = [
    { value: timeLeft.days, label: t('deals.days') },
    { value: timeLeft.hours, label: t('deals.hours') },
    { value: timeLeft.minutes, label: t('deals.mins') },
    { value: timeLeft.seconds, label: t('deals.secs') },
  ];

  return (
    <section className="py-10 md:py-14 bg-dark-950 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-600/[0.08] rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-500/15 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4">
              <HiOutlineFire className="text-primary-400" size={16} />
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                {t('deals.limitedTime')}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
              {title || t('deals.flashDeals')}
            </h2>

            {/* Subtitle */}
            {subtitle && (
              <p className="mt-3 text-base md:text-lg text-white/70 leading-relaxed">
                {subtitle}
              </p>
            )}

            {/* Countdown Timer */}
            {banner.endsAt && !timeLeft.isExpired && (
              <div className="mt-6">
                <p className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3">
                  {t('deals.endsIn')}
                </p>
                <div className="flex items-start gap-2 sm:gap-3">
                  {timerUnits.map((unit, index) => (
                    <Fragment key={unit.label}>
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                          <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">
                            {String(unit.value).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="mt-1.5 text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-medium">
                          {unit.label}
                        </span>
                      </div>
                      {index < timerUnits.length - 1 && (
                        <span className="text-white/30 text-lg font-bold mt-3.5 sm:mt-4">:</span>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-8"
            >
              <Link href={linkUrl}>
                <Button size="lg" rightIcon={<HiArrowRight size={16} />}>
                  {linkText}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <Link href={linkUrl} className="group block relative overflow-hidden rounded-2xl">
              <div className="hidden md:block">
                <Image
                  src={imageUrl}
                  alt={title || 'Flash Deals'}
                  width={700}
                  height={500}
                  className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="block md:hidden">
                <Image
                  src={mobileImageUrl}
                  alt={title || 'Flash Deals'}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover rounded-2xl"
                  unoptimized
                />
              </div>
              <div className="absolute inset-0 bg-dark-950/0 group-hover:bg-dark-950/10 transition-colors duration-300 rounded-2xl" />
            </Link>
            <div className="absolute -inset-4 bg-primary-500/5 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default DealsSection;

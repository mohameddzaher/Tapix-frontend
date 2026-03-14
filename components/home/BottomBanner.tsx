'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { bannersApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { useTranslation } from '@/lib/i18n';

export function BottomBanner() {
  const { t } = useTranslation();
  const { data: banners, isLoading } = useQuery({
    queryKey: queryKeys.banners.byPosition('home_bottom'),
    queryFn: () => bannersApi.getByPosition('home_bottom'),
  });

  if (isLoading || !banners || banners.length === 0) return null;

  const visibleBanners = banners.slice(0, 2);

  return (
    <section className="py-6 md:py-8">
      <div className="container-custom">
        <div
          className={`grid gap-4 ${
            visibleBanners.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {visibleBanners.map((banner: any, index: number) => (
            <motion.div
              key={banner._id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={banner.link || '/products'}
                className="group relative block overflow-hidden rounded-xl h-[180px] md:h-[240px]"
              >
                {banner.image && (
                  <Image
                    src={banner.image}
                    alt={banner.title || ''}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-dark-950/60 via-dark-950/20 to-transparent" />
                <div className="absolute inset-0 flex items-center p-6 md:p-8">
                  <div>
                    {banner.subtitle && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium mb-2">
                        {banner.subtitle}
                      </span>
                    )}
                    {banner.title && (
                      <h3 className="text-xl md:text-2xl font-display font-bold text-white">
                        {banner.title}
                      </h3>
                    )}
                    <span className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors">
                      {banner.linkText || t('hero.shopNow')}
                      <HiArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BottomBanner;

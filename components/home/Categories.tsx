'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { categoriesApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { Skeleton } from '@/components/ui';
import { useTranslation, useLocalized } from '@/lib/i18n';

// Fallback images only used when category has no image set in admin panel
const fallbackCategoryImages: Record<string, string> = {
  'smartphones-tablets': 'https://i.pinimg.com/736x/74/22/90/7422905148a220700458fe39f8b376e9.jpg',
  'audio-wearables': 'https://i.pinimg.com/1200x/d8/67/e2/d867e25416f27feca2d56e08b4ce7523.jpg',
  'charging-power': 'https://i.pinimg.com/736x/ce/4f/7d/ce4f7d2ccffa5cee3128af88b6f887da.jpg',
  'cases-protection': 'https://i.pinimg.com/1200x/dc/e3/32/dce3324ba1d4cb71d31d3f69959474b7.jpg',
  'gaming-accessories': 'https://i.pinimg.com/736x/75/d8/8f/75d88fe072681175aa7ffe57d528984b.jpg',
};

export function Categories() {
  const { t } = useTranslation();
  const { l } = useLocalized();
  const { data: categories, isLoading } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesApi.getAll,
  });

  // Filter to show only parent categories (no parentId)
  const parentCategories = categories?.filter((cat: any) => !cat.parentId) || [];

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-primary-600 font-medium uppercase tracking-wider"
          >
            {t('categories.shopBy')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-2xl md:text-3xl font-display font-semibold text-dark-900"
          >
            {t('categories.browseCollections')}
          </motion.h2>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rounded" className="aspect-square" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {parentCategories.slice(0, 6).map((category: any, index: number) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="w-[calc(33.333%-6px)] sm:w-[calc(25%-6px)] md:w-[calc(16.666%-8px)]"
              >
                <Link
                  href={`/products?category=${category._id}`}
                  className="group block relative aspect-square rounded-xl overflow-hidden"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-beige-200">
                    <Image
                      src={category.image?.url || fallbackCategoryImages[category.slug] || '/placeholder-category.png'}
                      alt={l(category, 'name')}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-dark-950/30 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-2 md:p-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-1">
                      {l(category, 'name')}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-white/70">
                      {category.productCount || 0} {t('categories.items')}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Categories;

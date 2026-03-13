'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HiArrowRight, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { HiOutlineTag, HiOutlineSparkles, HiOutlineFire } from 'react-icons/hi';
import { productsApi, categoriesApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { ProductCard } from '@/components/product/ProductCard';
import { useTranslation, useLocalized } from '@/lib/i18n';

interface ProductRowProps {
  title: string;
  products: any[];
  href: string;
  linkText: string;
  icon: React.ReactNode;
  accentColor: string;
}

function ProductRow({ title, products, href, linkText, icon, accentColor }: ProductRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 220;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-10 last:mb-0">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-5">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2.5"
        >
          <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentColor}`}>
            {icon}
          </span>
          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
            {title}
          </h3>
        </motion.div>
        <Link
          href={href}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider"
        >
          {linkText}
          <HiArrowRight size={12} />
        </Link>
      </div>

      {/* Scrollable Products */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white shadow-lg rounded-full text-dark-700 hover:text-dark-900 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
          aria-label="Scroll left"
        >
          <HiChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white shadow-lg rounded-full text-dark-700 hover:text-dark-900 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
          aria-label="Scroll right"
        >
          <HiChevronRight size={18} />
        </button>

        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-3 w-fit mx-auto">
            {products.map((product: any) => (
              <div
                key={product._id}
                className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px]"
              >
                <ProductCard product={product} variant="compact" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryStrip() {
  const { t } = useTranslation();
  const { l } = useLocalized();

  // Fetch on-sale products
  const { data: saleData } = useQuery({
    queryKey: queryKeys.products.list({ onSale: true, limit: 8 }),
    queryFn: () => productsApi.getAll({ onSale: true, limit: 8 }),
  });

  // Fetch new arrivals
  const { data: newData } = useQuery({
    queryKey: queryKeys.products.list({ newArrivals: true, limit: 8 }),
    queryFn: () => productsApi.getAll({ newArrivals: true, limit: 8 }),
  });

  // Fetch categories to pick the top one
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const topCategory = categories.find((cat: any) => !cat.parentId && cat.productCount > 0);

  // Fetch products from top category
  const { data: categoryData } = useQuery({
    queryKey: queryKeys.products.list({ category: topCategory?._id, limit: 8 }),
    queryFn: () => productsApi.getAll({ category: topCategory?._id, limit: 8 }),
    enabled: !!topCategory,
  });

  const saleProducts = saleData?.products || [];
  const newProducts = newData?.products || [];
  const categoryProducts = categoryData?.products || [];

  // Hide entire section if all rows are empty
  if (saleProducts.length === 0 && newProducts.length === 0 && categoryProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-dark-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary-500/[0.08] rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary-600/[0.06] rounded-full blur-3xl" />
      </div>
      <div className="container-custom relative">
        <ProductRow
          title={t('strip.onSale')}
          products={saleProducts}
          href="/products?onSale=true"
          linkText={t('common.viewAll')}
          icon={<HiOutlineTag size={18} className="text-red-400" />}
          accentColor="bg-red-500/15"
        />
        <ProductRow
          title={t('strip.newArrivals')}
          products={newProducts}
          href="/products?newArrivals=true"
          linkText={t('common.viewAll')}
          icon={<HiOutlineSparkles size={18} className="text-amber-400" />}
          accentColor="bg-amber-500/15"
        />
        {topCategory && (
          <ProductRow
            title={`${t('strip.topIn')} ${l(topCategory, 'name')}`}
            products={categoryProducts}
            href={`/products?category=${topCategory._id}`}
            linkText={t('common.viewAll')}
            icon={<HiOutlineFire size={18} className="text-primary-400" />}
            accentColor="bg-primary-500/15"
          />
        )}
      </div>
    </section>
  );
}

export default CategoryStrip;

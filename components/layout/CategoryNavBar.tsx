'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { categoriesApi } from '@/lib/api';
import { useTranslation, useLocalized } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function CategoryNavBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, dir } = useTranslation();
  const { l } = useLocalized();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  // Only show on homepage and products pages
  const showOnPages = ['/', '/products', '/home-appliances', '/gaming'];
  if (!showOnPages.includes(pathname)) return null;

  // Hide if no categories
  const parentCategories = categories.filter((cat: any) => !cat.parentId);
  if (parentCategories.length === 0) return null;

  const activeCategory = searchParams.get('category');

  // Categories with dedicated pages — map slug to route
  const dedicatedPages: Record<string, string> = {
    'home-appliances': '/home-appliances',
    'gaming': '/gaming',
  };

  const getCategoryHref = (cat: any) => {
    if (dedicatedPages[cat.slug]) return dedicatedPages[cat.slug];
    return `/products?category=${cat._id}`;
  };

  const isCategoryActive = (cat: any) => {
    if (dedicatedPages[cat.slug]) return pathname === dedicatedPages[cat.slug];
    return activeCategory === cat._id;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="sticky top-16 lg:top-24 z-30 bg-dark-950">
      <div className="container-custom relative">
        {/* Fade edges on mobile for scroll hint */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-dark-950 to-transparent z-[5] pointer-events-none lg:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-dark-950 to-transparent z-[5] pointer-events-none lg:hidden" />

        {/* Scrollable categories */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 py-2.5 overflow-x-auto scrollbar-hide px-8 sm:px-4 lg:px-0 lg:justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* All Products pill */}
          <Link
            href="/products"
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap border',
              pathname === '/products' && !activeCategory
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-transparent text-white/75 border-white/15 hover:border-white/30 hover:text-white'
            )}
          >
            {t('categoryNav.allProducts')}
          </Link>

          {/* Category pills */}
          {parentCategories.map((cat: any) => (
            <Link
              key={cat._id}
              href={getCategoryHref(cat)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap border',
                isCategoryActive(cat)
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-transparent text-white/75 border-white/15 hover:border-white/30 hover:text-white'
              )}
            >
              {cat.icon && <span className="text-sm">{cat.icon}</span>}
              {l(cat, 'name')}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryNavBar;

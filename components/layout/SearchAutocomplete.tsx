'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { productsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { useSettings } from '@/lib/settings-context';
import { useTranslation, useLocalized } from '@/lib/i18n';

interface SearchAutocompleteProps {
  onClose: () => void;
}

export function SearchAutocomplete({ onClose }: SearchAutocompleteProps) {
  const router = useRouter();
  const { formatPrice } = useSettings();
  const { t } = useTranslation();
  const { l } = useLocalized();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: results = [], isLoading } = useQuery({
    queryKey: queryKeys.products.autocomplete(debouncedQuery),
    queryFn: () => productsApi.searchAutocomplete(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const navigateToProduct = useCallback((slug: string) => {
    onClose();
    router.push(`/products/${slug}`);
  }, [onClose, router]);

  const navigateToSearch = useCallback(() => {
    if (query.trim()) {
      onClose();
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  }, [query, onClose, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        navigateToProduct(results[selectedIndex].slug);
      } else {
        navigateToSearch();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getFinalPrice = (product: any) => {
    if (product.discount > 0) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="flex items-center gap-3 p-4 md:p-5">
        <div className="w-10 h-10 rounded-xl bg-beige-100 flex items-center justify-center flex-shrink-0">
          <HiOutlineSearch className="text-dark-400" size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          className="flex-1 text-base md:text-lg outline-none border-none ring-0 focus:outline-none focus:border-none focus:ring-0 placeholder:text-dark-300 bg-transparent font-medium"
        />
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-dark-300 hover:text-dark-600 hover:bg-beige-100 rounded-lg transition-colors"
          aria-label={t('nav.closeSearch')}
        >
          <HiOutlineX size={20} />
        </button>
      </div>

      {/* Results */}
      {debouncedQuery.length >= 2 && (
        <div className="border-t border-beige-100">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-dark-400">
                <div className="w-4 h-4 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
                {t('search.searching')}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-dark-400">{t('search.noResults')}</p>
            </div>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto">
              {results.map((product: any, index: number) => (
                <li key={product._id}>
                  <button
                    type="button"
                    onClick={() => navigateToProduct(product.slug)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 md:px-5 py-3 text-left transition-all ${
                      index === selectedIndex
                        ? 'bg-primary-50/60'
                        : 'hover:bg-beige-50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-beige-100 overflow-hidden flex-shrink-0 border border-beige-200">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={l(product, 'title')}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-dark-200">
                          <HiOutlineSearch size={18} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-900 truncate">
                        {l(product, 'title')}
                      </p>
                      {product.brand && (
                        <p className="text-xs text-dark-400 mt-0.5">{product.brand}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-dark-900">
                        {formatPrice(getFinalPrice(product))}
                      </p>
                      {product.discount > 0 && (
                        <p className="text-xs text-dark-300 line-through">
                          {formatPrice(product.price)}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}

              {/* View all results */}
              <li>
                <button
                  type="button"
                  onClick={navigateToSearch}
                  className="w-full px-5 py-3.5 text-center text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors border-t border-beige-100"
                >
                  {t('search.viewAll')} &quot;{query}&quot;
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;

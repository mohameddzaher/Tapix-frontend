'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineFilter,
  HiOutlineViewGrid,
  HiOutlineSearch,
  HiViewList,
  HiX,
  HiChevronDown,
  HiOutlineStar,
  HiStar,
  HiOutlineTag,
  HiOutlineSparkles,
} from 'react-icons/hi';
import { productsApi, categoriesApi, brandsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { ProductCard } from '@/components/product/ProductCard';
import {
  Button,
  Checkbox,
  Select,
  ProductGridSkeleton,
  Card,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { useTranslation, useLocalized } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { l } = useLocalized();
  const { formatPrice } = useSettings();

  const sortOptions = [
    { value: '-createdAt', label: t('sort.newestFirst') },
    { value: 'price', label: t('sort.priceLowHigh') },
    { value: '-price', label: t('sort.priceHighLow') },
    { value: '-averageRating', label: t('sort.highestRated') },
    { value: '-soldCount', label: t('sort.bestSelling') },
    { value: 'title', label: t('sort.nameAZ') },
    { value: '-title', label: t('sort.nameZA') },
  ];

  const priceRanges = [
    { label: `${t('products.priceRange').split(' ')[0]} SAR 100`, min: 0, max: 100 },
    { label: 'SAR 100 - 500', min: 100, max: 500 },
    { label: 'SAR 500 - 1,000', min: 500, max: 1000 },
    { label: 'SAR 1,000 - 5,000', min: 1000, max: 5000 },
    { label: `SAR 5,000+`, min: 5000, max: '' },
  ];
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    price: true,
    rating: true,
    availability: true,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brands: (searchParams.get('brands') || '').split(',').filter(Boolean),
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    newArrivals: searchParams.get('newArrivals') === 'true',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page') || '1'),
  });

  // Search autocomplete
  const [searchInput, setSearchInput] = useState(filters.search);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: suggestions = [] } = useQuery({
    queryKey: queryKeys.products.autocomplete(debouncedSearch),
    queryFn: () => productsApi.searchAutocomplete(debouncedSearch),
    enabled: debouncedSearch.length >= 2 && showSuggestions,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // submitSearch is defined after handleFilterChange below

  // Categories with dedicated pages — exclude from main products listing
  const EXCLUDED_CATEGORY_SLUGS = 'home-appliances,gaming';

  // Fetch products - keepPreviousData prevents skeleton flash on filter changes
  const { data: productsData, isLoading: isLoadingProducts, isFetching } = useQuery({
    queryKey: queryKeys.products.list({ ...filters, excludeCategorySlugs: EXCLUDED_CATEGORY_SLUGS }),
    queryFn: () =>
      productsApi.getAll({
        search: filters.search || undefined,
        category: filters.category || undefined,
        brands: filters.brands.length > 0 ? filters.brands.join(',') : undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        rating: filters.rating ? parseFloat(filters.rating) : undefined,
        inStock: filters.inStock || undefined,
        onSale: filters.onSale || undefined,
        newArrivals: filters.newArrivals || undefined,
        sort: filters.sort,
        page: filters.page,
        limit: 12,
        excludeCategorySlugs: EXCLUDED_CATEGORY_SLUGS,
      }),
    placeholderData: keepPreviousData,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesApi.getAll,
  });

  // Fetch brands
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.getAll(),
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  // Update URL when filters change - use ref-based debounce to avoid loops
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      const f = filtersRef.current;
      Object.entries(f).forEach(([key, value]) => {
        if (key === 'brands') {
          if (Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(','));
          }
        } else if (key === 'sort' && value === '-createdAt') {
          // Skip default sort to keep URL clean
        } else if (key === 'page' && value === 1) {
          // Skip default page
        } else if (value && value !== '') {
          params.set(key, String(value));
        }
      });
      const search = params.toString();
      router.push(`/products${search ? `?${search}` : ''}`, { scroll: false });
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const submitSearch = (val: string) => {
    setShowSuggestions(false);
    if (val.trim()) {
      handleFilterChange('search', val.trim());
    }
  };

  const handlePriceRange = (min: number | string, max: number | string) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: String(min),
      maxPrice: max ? String(max) : '',
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brands: [],
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
      onSale: false,
      newArrivals: false,
      sort: '-createdAt',
      page: 1,
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeFilterCount = [
    filters.category,
    filters.brands.length > 0,
    filters.minPrice || filters.maxPrice,
    filters.rating,
    filters.inStock,
    filters.onSale,
    filters.newArrivals,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: string;
    children: React.ReactNode;
  }) => (
    <div className="py-4 border-t border-beige-200">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between text-sm font-medium text-dark-900 mb-3"
      >
        {title}
        <HiChevronDown
          size={16}
          className={cn(
            'transition-transform duration-200',
            expandedSections[section] ? 'rotate-180' : ''
          )}
        />
      </button>
      {expandedSections[section] && (
        <div>
          {children}
        </div>
      )}
    </div>
  );

  const FilterContent = () => (
    <>
      {/* Quick Filters */}
      <div className="pb-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-beige-50 transition-colors">
          <input
            type="checkbox"
            checked={filters.onSale}
            onChange={(e) => handleFilterChange('onSale', e.target.checked)}
            className="w-4 h-4 rounded text-primary-600 border-beige-300"
          />
          <HiOutlineTag className="text-red-500" size={18} />
          <span className="text-sm text-dark-700">{t('products.onSale')}</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-beige-50 transition-colors">
          <input
            type="checkbox"
            checked={filters.newArrivals}
            onChange={(e) => handleFilterChange('newArrivals', e.target.checked)}
            className="w-4 h-4 rounded text-primary-600 border-beige-300"
          />
          <HiOutlineSparkles className="text-blue-500" size={18} />
          <span className="text-sm text-dark-700">{t('products.newArrivals')}</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-beige-50 transition-colors">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="w-4 h-4 rounded text-primary-600 border-beige-300"
          />
          <span className="text-sm text-dark-700">{t('products.inStockOnly')}</span>
        </label>
      </div>

      {/* Categories */}
      <FilterSection title={t('nav.categories')} section="categories">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          <label
            className={cn(
              'flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors',
              !filters.category ? 'bg-primary-50 text-primary-700' : 'hover:bg-beige-50'
            )}
          >
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => handleFilterChange('category', '')}
              className="sr-only"
            />
            <span className="text-sm">{t('products.allCategories')}</span>
          </label>
          {categories?.map((cat: any) => (
            <label
              key={cat._id}
              className={cn(
                'flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg transition-colors',
                filters.category === cat._id
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-beige-50'
              )}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat._id}
                  onChange={() => handleFilterChange('category', cat._id)}
                  className="sr-only"
                />
                <span className="text-sm">{l(cat, 'name')}</span>
              </div>
              {cat.productCount && (
                <span className="text-xs text-dark-400">({cat.productCount})</span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title={t('products.brands')} section="brands">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {brands?.map((brand: any) => {
            const isSelected = filters.brands.includes(brand.name);
            return (
              <label
                key={brand._id}
                className={cn(
                  'flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors',
                  isSelected
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-beige-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    const newBrands = isSelected
                      ? filters.brands.filter((b) => b !== brand.name)
                      : [...filters.brands, brand.name];
                    handleFilterChange('brands', newBrands);
                  }}
                  className="w-4 h-4 rounded text-primary-600 border-beige-300"
                />
                <span className="text-sm">{brand.name}</span>
                {brand.productCount > 0 && (
                  <span className="text-xs text-dark-400">({brand.productCount})</span>
                )}
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title={t('products.priceRange')} section="price">
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range.label}
              className={cn(
                'flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors',
                filters.minPrice === String(range.min) &&
                  (range.max === '' ? !filters.maxPrice : filters.maxPrice === String(range.max))
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-beige-50'
              )}
            >
              <input
                type="radio"
                name="priceRange"
                checked={
                  filters.minPrice === String(range.min) &&
                  (range.max === '' ? !filters.maxPrice : filters.maxPrice === String(range.max))
                }
                onChange={() => handlePriceRange(range.min, range.max)}
                className="sr-only"
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-beige-100">
          <p className="text-xs text-dark-500 mb-2">{t('products.customRange')}</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t('common.min')}
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-beige-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            <span className="text-dark-400">-</span>
            <input
              type="number"
              placeholder={t('common.max')}
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-beige-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title={t('products.customerRating')} section="rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className={cn(
                'flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors',
                filters.rating === String(rating)
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-beige-50'
              )}
            >
              <input
                type="radio"
                name="rating"
                checked={filters.rating === String(rating)}
                onChange={() =>
                  handleFilterChange(
                    'rating',
                    filters.rating === String(rating) ? '' : String(rating)
                  )
                }
                className="sr-only"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < rating ? (
                      <HiStar className="text-yellow-400" size={16} />
                    ) : (
                      <HiOutlineStar className="text-gray-300" size={16} />
                    )}
                  </span>
                ))}
              </div>
              <span className="text-sm text-dark-600">{t('products.andUp')}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );

  return (
    <div className="min-h-screen bg-beige-50">
      {/* Header */}
      <div className="bg-white border-b border-beige-200">
        <div className="container-custom py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-semibold text-dark-900">
                {filters.search ? `${t('products.resultsFor')} "${filters.search}"` : t('products.allProducts')}
              </h1>
              <span className="text-sm text-dark-400 bg-beige-100 px-2.5 py-0.5 rounded-full">
                {pagination?.total || 0} {(pagination?.total || 0) === 1 ? t('products.product') : t('products.products')}
              </span>
            </div>
            <div ref={searchContainerRef} className="relative max-w-sm w-full sm:w-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(searchInput);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={t('products.searchProducts')}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-beige-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-dark-400"
                  />
                </div>
                <Button type="submit" size="sm" variant="primary">
                  {t('products.search')}
                </Button>
              </form>

              {/* Autocomplete Suggestions */}
              {showSuggestions && debouncedSearch.length >= 2 && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-soft-lg border border-beige-200 z-50 overflow-hidden">
                  <ul className="max-h-[300px] overflow-y-auto">
                    {suggestions.map((product: any) => (
                      <li key={product._id}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSuggestions(false);
                            router.push(`/products/${product.slug}`);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-beige-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-beige-100 overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={l(product, 'title')}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-dark-300">
                                <HiOutlineSearch size={14} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-900 truncate">{l(product, 'title')}</p>
                            {product.brand && <p className="text-xs text-dark-400">{product.brand}</p>}
                          </div>
                          <span className="text-sm font-semibold text-dark-900 flex-shrink-0">
                            {formatPrice(product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <Card padding="md" className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-dark-900">{t('products.filters')}</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {t('products.clearAll')}
                  </button>
                )}
              </div>
              <FilterContent />
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Mobile filter button */}
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<HiOutlineFilter size={16} />}
                onClick={() => setShowFilters(true)}
                className="lg:hidden"
              >
                {t('products.filters')}
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Active filters tags */}
              {hasActiveFilters && (
                <div className="hidden lg:flex items-center gap-2 flex-wrap">
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                      {categories?.find((cat: any) => cat._id === filters.category)?.name || filters.category}
                      <button
                        type="button"
                        aria-label="Remove category filter"
                        onClick={() => handleFilterChange('category', '')}
                      >
                        <HiX size={14} />
                      </button>
                    </span>
                  )}
                  {filters.brands.map((brandName) => (
                    <span
                      key={brandName}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {brandName}
                      <button
                        type="button"
                        aria-label={`Remove ${brandName} filter`}
                        onClick={() =>
                          handleFilterChange(
                            'brands',
                            filters.brands.filter((b) => b !== brandName)
                          )
                        }
                      >
                        <HiX size={14} />
                      </button>
                    </span>
                  ))}
                  {filters.onSale && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                      {t('products.onSale')}
                      <button
                        type="button"
                        aria-label="Remove sale filter"
                        onClick={() => handleFilterChange('onSale', false)}
                      >
                        <HiX size={14} />
                      </button>
                    </span>
                  )}
                  {filters.newArrivals && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {t('products.newArrivals')}
                      <button
                        type="button"
                        aria-label="Remove new arrivals filter"
                        onClick={() => handleFilterChange('newArrivals', false)}
                      >
                        <HiX size={14} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-dark-500 hidden sm:inline">{t('products.sortBy')}</span>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-3 py-2 text-sm border border-beige-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View mode */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-beige-100 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white text-dark-900 shadow-sm'
                      : 'text-dark-500 hover:text-dark-700'
                  )}
                >
                  <HiOutlineViewGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-dark-900 shadow-sm'
                      : 'text-dark-500 hover:text-dark-700'
                  )}
                >
                  <HiViewList size={18} />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {isLoadingProducts ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <Card padding="lg" className="text-center py-16">
                <h3 className="text-lg font-medium text-dark-900">
                  {t('products.noProducts')}
                </h3>
                <p className="mt-2 text-dark-500">
                  {t('products.adjustFilters')}
                </p>
                <Button variant="primary" className="mt-4" onClick={clearFilters}>
                  {t('products.clearFilters')}
                </Button>
              </Card>
            ) : (
              <>
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'
                      : 'space-y-4',
                    isFetching && 'opacity-60 transition-opacity duration-200'
                  )}
                >
                  {products.map((product: any) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      variant={viewMode === 'list' ? 'horizontal' : 'default'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() =>
                        handleFilterChange('page', pagination.page - 1)
                      }
                    >
                      {t('products.previous')}
                    </Button>

                    {/* Page numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleFilterChange('page', pageNum)}
                            className={cn(
                              'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                              pagination.page === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'bg-white border border-beige-300 text-dark-600 hover:bg-beige-50'
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <span className="sm:hidden px-4 text-sm text-dark-600">
                      {t('products.page')} {pagination.page} {t('products.of')} {pagination.totalPages}
                    </span>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() =>
                        handleFilterChange('page', pagination.page + 1)
                      }
                    >
                      {t('products.next')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-80 bg-white shadow-soft-xl z-50 lg:hidden flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b border-beige-200 p-4 flex items-center justify-between">
                <h2 className="font-semibold text-dark-900">{t('products.filters')}</h2>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {t('products.clear')}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Close filters"
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-dark-500 hover:text-dark-700"
                  >
                    <HiX size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterContent />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-beige-200 p-4">
                <Button fullWidth onClick={() => setShowFilters(false)}>
                  {t('common.show')} {pagination?.total || 0} {t('common.results')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

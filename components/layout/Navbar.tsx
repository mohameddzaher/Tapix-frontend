'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Dialog, Transition, Popover } from '@headlessui/react';
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { cn } from '@/lib/utils';
import { useAuthStore, useCartStore, useUIStore, useWishlistStore } from '@/lib/store';
import { useSettings } from '@/lib/settings-context';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui';
import { SearchAutocomplete } from './SearchAutocomplete';
import { CategoryNavBar } from './CategoryNavBar';

export function Navbar() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { t, locale, setLocale } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.products'), href: '/products' },
    { name: t('nav.homeAppliances'), href: '/home-appliances' },
    { name: t('nav.gaming'), href: '/gaming' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const { user, isAuthenticated } = useAuthStore();
  const { items: cartItems, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft'
            : 'bg-white'
        )}
      >
        {/* Top bar - fixed height */}
        <div className="hidden lg:block bg-dark-950 text-white h-8">
          <div className="container-custom h-full flex items-center justify-between text-xs">
            <p>
              {settings.enableFreeShipping && settings.freeShippingThreshold
                ? `${t('common.freeShippingOn')} ${settings.currency} ${settings.freeShippingThreshold.toLocaleString()}`
                : `${t('common.welcomeTo')} ${settings.siteName}`}
            </p>
            <div className="flex items-center gap-4">
              <Link href="/track-order" className="hover:text-primary-300 transition-colors">
                {t('nav.trackOrder')}
              </Link>
              <span>|</span>
              <Link href="/contact" className="hover:text-primary-300 transition-colors">
                {t('nav.helpCenter')}
              </Link>
            </div>
          </div>
        </div>

        {/* Main navbar - fixed height */}
        <nav className="container-custom h-16">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center z-10">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.siteName}
                  className="h-10 w-auto"
                />
              ) : (
                <Image
                  src="/images/logo.png"
                  alt={settings.siteName}
                  width={120}
                  height={46}
                  className="h-14 w-auto"
                  priority
                />
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-dark-700 hover:text-dark-900 hover:bg-beige-100'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="px-2.5 py-1.5 text-xs font-medium text-dark-600 hover:text-dark-900 hover:bg-beige-100 rounded-lg transition-colors"
                aria-label="Switch language"
              >
                {locale === 'en' ? 'العربية' : 'English'}
              </button>

              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-dark-600 hover:text-dark-900 transition-colors"
                aria-label="Search"
              >
                <HiOutlineSearch size={22} />
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="relative p-2 text-dark-600 hover:text-dark-900 transition-colors hidden sm:flex"
                aria-label="Wishlist"
              >
                <HiOutlineHeart size={22} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-primary-600 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-dark-600 hover:text-dark-900 transition-colors"
                aria-label="Cart"
              >
                <HiOutlineShoppingBag size={22} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-primary-600 rounded-full flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* User */}
              {isAuthenticated ? (
                <Popover className="relative">
                  {({ open, close }) => (
                    <>
                      <Popover.Button className="p-2 text-dark-600 hover:text-dark-900 transition-colors focus:outline-none">
                        <HiOutlineUser size={22} />
                      </Popover.Button>

                      {open && <Popover.Overlay className="fixed inset-0" />}

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                      <Popover.Panel className="absolute right-0 z-50 mt-3 w-56">
                          <div className="overflow-hidden rounded-xl bg-white shadow-soft-lg ring-1 ring-beige-200">
                            <div className="p-3 border-b border-beige-200">
                              <p className="text-sm font-medium text-dark-900">
                                {user?.name}
                              </p>
                              <p className="text-xs text-dark-500">{user?.email}</p>
                            </div>
                            <div className="p-2">
                              <Link
                                href="/account/profile"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.myProfile')}
                              </Link>
                              <Link
                                href="/account/orders"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.myOrders')}
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  close();
                                  openCart();
                                }}
                                className="block w-full text-left px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.myCart')}
                                {cartItemCount > 0 && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                                    {cartItemCount}
                                  </span>
                                )}
                              </button>
                              <Link
                                href="/account/wishlist"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.wishlist')}
                                {wishlistItems.length > 0 && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                                    {wishlistItems.length}
                                  </span>
                                )}
                              </Link>
                              <Link
                                href="/account/addresses"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.addresses')}
                              </Link>
                              <Link
                                href="/account/referrals"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.referEarn')}
                              </Link>
                              {(user?.role === 'admin' ||
                                user?.role === 'super_admin') && (
                                <Link
                                  href="/admin"
                                  onClick={() => close()}
                                  className="block px-3 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg"
                                >
                                  {t('nav.adminPanel')}
                                </Link>
                              )}
                            </div>
                            <div className="p-2 border-t border-beige-200">
                              <button
                                onClick={() => {
                                  useAuthStore.getState().logout();
                                  window.location.href = '/';
                                }}
                                className="block w-full text-left px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded-lg"
                              >
                                {t('nav.logOut')}
                              </button>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
              ) : (
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="primary" size="sm">
                    {t('nav.signIn')}
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-dark-600 hover:text-dark-900 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <HiOutlineX size={24} />
                ) : (
                  <HiOutlineMenu size={24} />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Modal with Autocomplete */}
      <Transition show={showSearch} as={Fragment}>
        <Dialog onClose={() => setShowSearch(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 pt-20">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-soft-xl transition-all">
                  <SearchAutocomplete onClose={() => setShowSearch(false)} />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Mobile Menu */}
      <Transition show={isMobileMenuOpen} as={Fragment}>
        <Dialog onClose={closeMobileMenu} className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-full"
            >
              <Dialog.Panel className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-soft-xl">
                <div className="flex items-center justify-between p-4 border-b border-beige-200">
                  {settings.logo ? (
                    <img
                      src={settings.logo}
                      alt={settings.siteName}
                      className="h-8 w-auto"
                    />
                  ) : (
                    <Image
                      src="/images/logo.png"
                      alt={settings.siteName}
                      width={100}
                      height={38}
                      className="h-8 w-auto"
                    />
                  )}
                  <button
                    type="button"
                    onClick={closeMobileMenu}
                    className="p-2 text-dark-600 hover:text-dark-900"
                    aria-label="Close menu"
                  >
                    <HiOutlineX size={24} />
                  </button>
                </div>

                <div className="p-4 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'block px-4 py-3 text-sm font-medium rounded-lg',
                        pathname === item.href
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-dark-700 hover:bg-beige-100'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="p-4 border-t border-beige-200">
                  {/* Mobile Language Switcher */}
                  <button
                    type="button"
                    onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                    className="block w-full text-left px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg mb-2"
                  >
                    {locale === 'en' ? 'العربية' : 'English'}
                  </button>
                  <div className="border-t border-beige-200 pt-2">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <Link
                        href="/account/profile"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.myProfile')}
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.myOrders')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          openCart();
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.myCart')}
                        {cartItemCount > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                            {cartItemCount}
                          </span>
                        )}
                      </button>
                      <Link
                        href="/account/wishlist"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.wishlist')}
                        {wishlistItems.length > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                            {wishlistItems.length}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/account/addresses"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.addresses')}
                      </Link>
                      <Link
                        href="/account/referrals"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.referEarn')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          useAuthStore.getState().logout();
                          closeMobileMenu();
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg mt-2"
                      >
                        {t('nav.logOut')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link href="/auth/login" className="block">
                        <Button variant="primary" fullWidth>
                          {t('nav.signIn')}
                        </Button>
                      </Link>
                      <Link href="/auth/register" className="block">
                        <Button variant="secondary" fullWidth>
                          {t('nav.createAccount')}
                        </Button>
                      </Link>
                    </div>
                  )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Spacer for fixed header - matches header height */}
      <div className="h-16 lg:h-24" />

      {/* Category Navigation Bar */}
      <CategoryNavBar />
    </>
  );
}

export default Navbar;

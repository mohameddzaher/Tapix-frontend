'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaLinkedinIn,
  FaSnapchatGhost,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { HiOutlineLink } from 'react-icons/hi';
import { categoriesApi } from '@/lib/api';
import { useSettings } from '@/lib/settings-context';
import { useTranslation } from '@/lib/i18n';

export function Footer() {
  const { settings } = useSettings();
  const { t } = useTranslation();

  const supportLinks = [
    { name: t('footer.contactUs'), href: '/contact' },
    { name: t('footer.faqs'), href: '/faq' },
    { name: t('footer.trackOrder'), href: '/track-order' },
    { name: t('footer.shippingInfo'), href: '/shipping' },
    { name: t('footer.returnsExchanges'), href: '/returns' },
    { name: t('footer.warranty'), href: '/warranty' },
  ];

  const companyLinks = [
    { name: t('footer.aboutUs'), href: '/about' },
    { name: t('footer.blog'), href: '/blog' },
    { name: t('footer.careers'), href: '/careers' },
    { name: t('footer.press'), href: '/press' },
    { name: t('footer.privacyPolicy'), href: '/privacy' },
    { name: t('footer.termsOfService'), href: '/terms' },
  ];

  const [shopLinks, setShopLinks] = useState([
    { name: t('footer.allProducts'), href: '/products' },
    { name: t('footer.specialDeals'), href: '/products?onSale=true' },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await categoriesApi.getAll();
        const parentCategories = (categories || [])
          .filter((cat: any) => !cat.parentId)
          .slice(0, 4);

        const dynamicLinks = [
          { name: t('footer.allProducts'), href: '/products' },
          ...parentCategories.map((cat: any) => ({
            name: cat.name,
            href: `/products?category=${cat._id}`,
          })),
          { name: t('footer.specialDeals'), href: '/products?onSale=true' },
        ];
        setShopLinks(dynamicLinks);
      } catch {
        // Keep default static links on error
      }
    };
    fetchCategories();
  }, []);

  // Build social links dynamically from settings
  const socialLinks = [
    settings.socialFacebook && { name: 'Facebook', href: settings.socialFacebook, icon: FaFacebookF },
    settings.socialInstagram && { name: 'Instagram', href: settings.socialInstagram, icon: FaInstagram },
    settings.socialTwitter && { name: 'X', href: settings.socialTwitter, icon: FaXTwitter },
    settings.socialYoutube && { name: 'YouTube', href: settings.socialYoutube, icon: FaYoutube },
    settings.socialTiktok && { name: 'TikTok', href: settings.socialTiktok, icon: FaTiktok },
    settings.socialLinkedin && { name: 'LinkedIn', href: settings.socialLinkedin, icon: FaLinkedinIn },
    settings.socialWhatsapp && { name: 'WhatsApp', href: settings.socialWhatsapp.startsWith('http') ? settings.socialWhatsapp : `https://wa.me/${settings.socialWhatsapp.replace(/[^0-9]/g, '')}`, icon: FaWhatsapp },
    settings.socialSnapchat && { name: 'Snapchat', href: settings.socialSnapchat, icon: FaSnapchatGhost },
    settings.socialLinktree && { name: 'Linktree', href: settings.socialLinktree, icon: HiOutlineLink },
  ].filter(Boolean) as { name: string; href: string; icon: any }[];

  return (
    <footer className="bg-dark-950 text-white">
      {/* Main Footer */}
      <div className="container-custom py-10 md:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8">
          {/* Brand Column - wider */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/images/footer-logo.png"
                alt={settings.siteName}
                width={120}
                height={40}
                className="h-9 w-auto"
              />
            </Link>
            {settings.siteDescription && (
              <p className="mt-3 text-sm text-dark-400 leading-relaxed">
                {settings.siteDescription}
              </p>
            )}
            {!settings.siteDescription && (
              <p className="mt-3 text-sm text-dark-400 leading-relaxed">
                {t('footer.description')}
              </p>
            )}
            <div className="mt-4 space-y-2">
              {settings.sitePhone && (
                <a
                  href={`tel:${settings.sitePhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors"
                >
                  <HiOutlinePhone size={16} />
                  <span>{settings.sitePhone}</span>
                </a>
              )}
              {settings.siteEmail && (
                <a
                  href={`mailto:${settings.siteEmail}`}
                  className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors"
                >
                  <HiOutlineMail size={16} />
                  <span>{settings.siteEmail}</span>
                </a>
              )}
              {settings.siteAddress && (
                <div className="flex items-start gap-2 text-sm text-dark-400">
                  <HiOutlineLocationMarker size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{settings.siteAddress}</span>
                </div>
              )}
            </div>

            {/* Social Links - Dynamic from settings */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {t('footer.shop')}
            </h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-dark-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-dark-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {t('footer.company')}
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-dark-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {t('footer.account')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/account/profile" className="text-xs text-dark-400 hover:text-white transition-colors">
                  {t('footer.myAccount')}
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-xs text-dark-400 hover:text-white transition-colors">
                  {t('footer.orderHistory')}
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="text-xs text-dark-400 hover:text-white transition-colors">
                  {t('footer.wishlist')}
                </Link>
              </li>
              <li>
                <Link href="/account/cart" className="text-xs text-dark-400 hover:text-white transition-colors">
                  {t('footer.shoppingCart')}
                </Link>
              </li>
              <li>
                <Link href="/account/referrals" className="text-xs text-dark-400 hover:text-white transition-colors">
                  {t('footer.referEarn')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-800">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Copyright */}
            <p className="text-xs text-dark-500">
              &copy; {new Date().getFullYear()} {settings.siteName}. {t('footer.allRightsReserved')}
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-dark-500">{t('footer.weAccept')}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-[8px] font-bold text-blue-600">VISA</span>
                </div>
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-[8px] font-bold text-primary-500">MC</span>
                </div>
                {settings.enableCOD && (
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold text-dark-700">COD</span>
                  </div>
                )}
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-3 text-xs text-dark-500">
              <Link href="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
              <span>&bull;</span>
              <Link href="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

export function Features() {
  const { t } = useTranslation();

  const defaultFeatures = [
    { icon: '🚚', title: t('features.freeShipping'), description: t('features.freeShippingDesc') },
    { icon: '🛡️', title: t('features.warranty'), description: t('features.warrantyDesc') },
    { icon: '↩️', title: t('features.easyReturns'), description: t('features.easyReturnsDesc') },
    { icon: '💬', title: t('features.support'), description: t('features.supportDesc') },
  ];

  const { data: cmsData } = useQuery({
    queryKey: ['cms-homepage-features'],
    queryFn: () => cmsApi.getContent('homepage_features'),
    staleTime: 5 * 60 * 1000,
  });

  let features = defaultFeatures;
  try {
    if (cmsData?.value) {
      const parsed = typeof cmsData.value === 'string' ? JSON.parse(cmsData.value) : cmsData.value;
      if (Array.isArray(parsed) && parsed.length > 0) features = parsed;
    }
  } catch {
    // use defaults
  }

  return (
    <section className="py-8 md:py-10 bg-white border-y border-beige-100">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature: any, index: number) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-beige-50/80 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{feature.icon}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-dark-900 leading-tight">
                  {feature.title}
                </h3>
                <p className="mt-0.5 text-xs text-dark-400 leading-snug">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;

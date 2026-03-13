'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

export function WhyChooseUs() {
  const { t } = useTranslation();

  const defaultData = {
    badge: t('whyChooseUs.badge'),
    title: t('whyChooseUs.title'),
    description: t('whyChooseUs.description'),
    reasons: [
      { icon: '✅', title: t('whyChooseUs.original'), description: t('whyChooseUs.originalDesc') },
      { icon: '💰', title: t('whyChooseUs.bestPrice'), description: t('whyChooseUs.bestPriceDesc') },
      { icon: '🚚', title: t('whyChooseUs.fastShipping'), description: t('whyChooseUs.fastShippingDesc') },
      { icon: '🛡️', title: t('whyChooseUs.warranty'), description: t('whyChooseUs.warrantyDesc') },
      { icon: '↩️', title: t('whyChooseUs.easyReturns'), description: t('whyChooseUs.easyReturnsDesc') },
      { icon: '💬', title: t('whyChooseUs.support'), description: t('whyChooseUs.supportDesc') },
    ],
    cta: {
      title: t('whyChooseUs.ctaTitle'),
      description: t('whyChooseUs.ctaDesc'),
      phone: '+966 53 848 6109',
      buttonText: t('whyChooseUs.sendMessage'),
      buttonLink: '/contact',
    },
  };

  const { data: cmsData } = useQuery({
    queryKey: ['cms-homepage-why-choose-us'],
    queryFn: () => cmsApi.getContent('homepage_why_choose_us'),
    staleTime: 5 * 60 * 1000,
  });

  let content = defaultData;
  try {
    if (cmsData?.value) {
      const parsed = typeof cmsData.value === 'string' ? JSON.parse(cmsData.value) : cmsData.value;
      if (parsed && parsed.reasons) content = { ...defaultData, ...parsed };
    }
  } catch {
    // use defaults
  }

  return (
    <section className="section bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm text-primary-600 font-medium uppercase tracking-wider"
          >
            {content.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl md:text-4xl font-display font-semibold text-dark-900"
          >
            {content.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-dark-600"
          >
            {content.description}
          </motion.p>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {content.reasons.map((reason: any, index: number) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl border border-beige-200 hover:border-primary-200 hover:shadow-soft transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-primary-600 transition-colors mb-4">
                <span className="text-2xl">{reason.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-900 group-hover:text-primary-600 transition-colors">
                {reason.title}
              </h3>
              <p className="mt-2 text-dark-500 text-sm leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-8 md:p-12 rounded-2xl bg-dark-950 text-white text-center"
        >
          <h3 className="text-2xl md:text-3xl font-display font-semibold text-white">
            {content.cta.title}
          </h3>
          <p className="mt-2 text-white/80 max-w-xl mx-auto">
            {content.cta.description}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href={`tel:${content.cta.phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              {t('whyChooseUs.callUs')} {content.cta.phone}
            </a>
            <a
              href={content.cta.buttonLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/15"
            >
              {content.cta.buttonText}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default WhyChooseUs;

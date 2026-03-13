'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiOutlinePencilAlt, HiX, HiChevronRight } from 'react-icons/hi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { testimonialsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button, Input, Textarea } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

const testimonialSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email'),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(10, 'Please write at least 10 characters'),
});

type TestimonialForm = z.infer<typeof testimonialSchema>;

interface Testimonial {
  _id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  createdAt?: string;
}

function TestimonialCard({ testimonial, locale }: { testimonial: Testimonial; locale: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg p-4 shadow-soft h-full flex flex-col"
    >
      {/* Header with avatar and rating */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
          {testimonial.customerAvatar ? (
            <img
              src={testimonial.customerAvatar}
              alt={testimonial.customerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-primary-600">
              {testimonial.customerName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark-900 truncate">
            {testimonial.customerName}
          </p>
          <div className="flex gap-0.5 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <HiStar
                key={i}
                className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'}
                size={12}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Title */}
      {testimonial.title && (
        <h4 className="text-xs font-semibold text-dark-800 mb-1 line-clamp-1">
          {testimonial.title}
        </h4>
      )}

      {/* Content */}
      <p className="text-xs text-dark-600 leading-relaxed line-clamp-3 flex-1">
        "{testimonial.content}"
      </p>

      {/* Date */}
      {testimonial.createdAt && (
        <p className="text-[10px] text-dark-400 mt-2">
          {new Date(testimonial.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
    </motion.div>
  );
}

function TestimonialSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-soft animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-beige-200" />
        <div className="flex-1">
          <div className="h-3 bg-beige-200 rounded w-24 mb-2" />
          <div className="h-2 bg-beige-200 rounded w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-beige-200 rounded w-full" />
        <div className="h-2 bg-beige-200 rounded w-full" />
        <div className="h-2 bg-beige-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export function Testimonials() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { t, locale } = useTranslation();

  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ['testimonials-approved'],
    queryFn: () => testimonialsApi.getApproved(),
    staleTime: 5 * 60 * 1000,
  });

  const submitMutation = useMutation({
    mutationFn: (data: TestimonialForm) => testimonialsApi.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials-approved'] });
      toast.success(t('testimonials.successToast'));
      setIsFormOpen(false);
      reset();
    },
    onError: () => {
      toast.error(t('testimonials.errorToast'));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      rating: 5,
    },
  });

  const onSubmit = (data: TestimonialForm) => {
    submitMutation.mutate({ ...data, rating: selectedRating });
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  const hasTestimonials = testimonials && testimonials.length > 0;

  // Hide section if no testimonials and done loading
  if (!isLoading && !hasTestimonials) return null;

  return (
    <section className="py-10 md:py-14 bg-dark-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-600/[0.06] rounded-full blur-3xl" />
      </div>
      <div className="container-custom relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs text-primary-400 font-medium uppercase tracking-wider"
            >
              {t('testimonials.customerReviews')}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-1 text-2xl md:text-3xl font-display font-semibold text-white"
            >
              {t('testimonials.whatCustomersSay')}
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Button
              variant="outline"
              size="sm"
              leftIcon={<HiOutlinePencilAlt size={14} />}
              onClick={() => setIsFormOpen(true)}
            >
              {t('testimonials.writeReview')}
            </Button>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <TestimonialSkeleton key={i} />
            ))}
          </div>
        ) : hasTestimonials ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {testimonials.slice(0, 6).map((testimonial: Testimonial) => (
                <TestimonialCard key={testimonial._id} testimonial={testimonial} locale={locale} />
              ))}
            </div>

            {/* View All Link */}
            {testimonials.length > 6 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-6 text-center"
              >
                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                  {t('testimonials.viewAll')} {testimonials.length} {t('testimonials.reviews')}
                  <HiChevronRight size={16} />
                </Link>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10"
          >
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('testimonials.noReviewsTitle')}</h3>
            <p className="text-sm text-white/60 mb-4">
              {t('testimonials.noReviewsDesc')}
            </p>
            <Button
              variant="primary"
              leftIcon={<HiOutlinePencilAlt size={16} />}
              onClick={() => setIsFormOpen(true)}
            >
              {t('testimonials.writeFirstReview')}
            </Button>
          </motion.div>
        )}

        {/* Stats - Compact */}
        {hasTestimonials && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-4 gap-3 text-center"
          >
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="text-xl md:text-2xl font-bold text-primary-400">
                {testimonials.length}+
              </div>
              <div className="text-[10px] md:text-xs text-white/60">{t('testimonials.reviews')}</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="text-xl md:text-2xl font-bold text-primary-400">
                {(testimonials.reduce((acc: number, t: Testimonial) => acc + t.rating, 0) / testimonials.length).toFixed(1)}
              </div>
              <div className="text-[10px] md:text-xs text-white/60">{t('testimonials.avgRating')}</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="text-xl md:text-2xl font-bold text-primary-400">
                {Math.round((testimonials.filter((t: Testimonial) => t.rating >= 4).length / testimonials.length) * 100)}%
              </div>
              <div className="text-[10px] md:text-xs text-white/60">{t('testimonials.satisfied')}</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="text-xl md:text-2xl font-bold text-primary-400">
                {testimonials.filter((t: Testimonial) => t.rating === 5).length}
              </div>
              <div className="text-[10px] md:text-xs text-white/60">{t('testimonials.fiveStar')}</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Testimonial Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm z-50"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dark-900">{t('testimonials.shareExperience')}</h3>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 text-dark-400 hover:text-dark-600 transition-colors rounded-full hover:bg-beige-100"
                    title={t('testimonials.cancel')}
                    aria-label={t('testimonials.cancel')}
                  >
                    <HiX size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  {!isAuthenticated && (
                    <>
                      <Input
                        label={t('testimonials.yourName')}
                        placeholder={t('testimonials.enterName')}
                        error={errors.customerName?.message}
                        {...register('customerName')}
                      />
                      <Input
                        label={t('testimonials.emailAddress')}
                        type="email"
                        placeholder={t('testimonials.enterEmail')}
                        error={errors.customerEmail?.message}
                        {...register('customerEmail')}
                      />
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1.5">
                      {t('testimonials.yourRating')}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleRatingClick(rating)}
                          className="p-0.5 transition-transform hover:scale-110"
                          title={`${rating}`}
                          aria-label={`${rating}`}
                        >
                          <HiStar
                            size={24}
                            className={rating <= selectedRating ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label={t('testimonials.titleOptional')}
                    placeholder={t('testimonials.titlePlaceholder')}
                    {...register('title')}
                  />

                  <Textarea
                    label={t('testimonials.yourReview')}
                    placeholder={t('testimonials.reviewPlaceholder')}
                    rows={3}
                    error={errors.content?.message}
                    {...register('content')}
                  />

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => setIsFormOpen(false)}
                    >
                      {t('testimonials.cancel')}
                    </Button>
                    <Button type="submit" fullWidth isLoading={submitMutation.isPending}>
                      {t('testimonials.submit')}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Testimonials;

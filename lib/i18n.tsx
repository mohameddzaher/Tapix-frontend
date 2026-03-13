'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Locale = 'en' | 'ar';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.contact': 'Contact',
    'nav.homeAppliances': 'Home Appliances',
    'nav.gaming': 'Gaming',
    'nav.categories': 'Categories',
    'nav.signIn': 'Sign In',
    'nav.trackOrder': 'Track Order',
    'nav.helpCenter': 'Help Center',
    'nav.myProfile': 'My Profile',
    'nav.myOrders': 'My Orders',
    'nav.myCart': 'My Cart',
    'nav.wishlist': 'Wishlist',
    'nav.addresses': 'Addresses',
    'nav.referEarn': 'Refer & Earn',
    'nav.adminPanel': 'Admin Panel',
    'nav.logOut': 'Log Out',
    'nav.createAccount': 'Create Account',
    'nav.viewAllProducts': 'View all products',
    'nav.noCategories': 'No categories available',
    'nav.searchProducts': 'Search for products...',
    'nav.closeSearch': 'Close search',
    'nav.closeMenu': 'Close menu',

    // Hero
    'hero.shopNow': 'Shop Now',
    'hero.searchProducts': 'Search products...',

    // Features
    'features.freeShipping': 'Free Shipping',
    'features.freeShippingDesc': 'On orders over SAR 2,000',
    'features.warranty': '1 Year Warranty',
    'features.warrantyDesc': 'Official manufacturer warranty',
    'features.easyReturns': 'Easy Returns',
    'features.easyReturnsDesc': '14-day return policy',
    'features.support': '24/7 Support',
    'features.supportDesc': 'Expert assistance anytime',

    // Categories
    'categories.shopBy': 'Shop by Category',
    'categories.browseCollections': 'Browse Our Collections',
    'categories.items': 'items',

    // Products
    'products.allProducts': 'All Products',
    'products.resultsFor': 'Results for',
    'products.product': 'product',
    'products.products': 'products',
    'products.search': 'Search',
    'products.searchProducts': 'Search products...',
    'products.filters': 'Filters',
    'products.clearAll': 'Clear all',
    'products.clear': 'Clear',
    'products.sortBy': 'Sort by:',
    'products.noProducts': 'No products found',
    'products.adjustFilters': 'Try adjusting your filters or search term',
    'products.clearFilters': 'Clear Filters',
    'products.previous': 'Previous',
    'products.next': 'Next',
    'products.page': 'Page',
    'products.of': 'of',
    'products.showResults': 'Show Results',
    'products.onSale': 'On Sale',
    'products.newArrivals': 'New Arrivals',
    'products.inStockOnly': 'In Stock Only',
    'products.allCategories': 'All Categories',
    'products.priceRange': 'Price Range',
    'products.customRange': 'Custom Range',
    'products.customerRating': 'Customer Rating',
    'products.andUp': '& up',
    'products.brands': 'Brands',

    // Deals
    'deals.limitedTime': 'Limited Time Offer',
    'deals.flashDeals': 'Flash Deals',
    'deals.endsIn': 'Ends in:',
    'deals.viewAllDeals': 'View All Deals',
    'deals.days': 'Days',
    'deals.hours': 'Hours',
    'deals.mins': 'Mins',
    'deals.secs': 'Secs',

    // Featured Products
    'featured.handPicked': 'Hand-picked for you',
    'featured.title': 'Featured Products',

    // Newsletter
    'newsletter.subscribe': 'Subscribe',
    'newsletter.enterEmail': 'Enter your email',

    // Footer
    'footer.allRightsReserved': 'All rights reserved.',
    'footer.shop': 'Shop',
    'footer.support': 'Support',
    'footer.company': 'Company',
    'footer.account': 'Account',
    'footer.allProducts': 'All Products',
    'footer.specialDeals': 'Special Deals',
    'footer.contactUs': 'Contact Us',
    'footer.faqs': 'FAQs',
    'footer.trackOrder': 'Track Order',
    'footer.shippingInfo': 'Shipping Info',
    'footer.returnsExchanges': 'Returns & Exchanges',
    'footer.warranty': 'Warranty',
    'footer.aboutUs': 'About Us',
    'footer.blog': 'Blog',
    'footer.careers': 'Careers',
    'footer.press': 'Press',
    'footer.privacyPolicy': 'Privacy Policy',
    'footer.termsOfService': 'Terms of Service',
    'footer.myAccount': 'My Account',
    'footer.orderHistory': 'Order History',
    'footer.wishlist': 'Wishlist',
    'footer.shoppingCart': 'Shopping Cart',
    'footer.referEarn': 'Refer & Earn',
    'footer.weAccept': 'We accept:',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.description': 'Your destination for premium electronics and smart accessories. Top brands, competitive prices, and exceptional service.',

    // Products page sort options
    'sort.newestFirst': 'Newest First',
    'sort.priceLowHigh': 'Price: Low to High',
    'sort.priceHighLow': 'Price: High to Low',
    'sort.highestRated': 'Highest Rated',
    'sort.bestSelling': 'Best Selling',
    'sort.nameAZ': 'Name: A-Z',
    'sort.nameZA': 'Name: Z-A',

    // Search Autocomplete
    'search.placeholder': 'Search for products...',
    'search.searching': 'Searching...',
    'search.noResults': 'No products found',
    'search.viewAll': 'View all results for',

    // Category Nav
    'categoryNav.allProducts': 'All Products',

    // Category Strip
    'strip.onSale': 'On Sale',
    'strip.newArrivals': 'New Arrivals',
    'strip.topIn': 'Top in',

    // Home Appliances
    'homeAppliances.title': 'Home Appliances',
    'homeAppliances.subtitle': 'Premium appliances for your home',
    'homeAppliances.allAppliances': 'All Appliances',
    'homeAppliances.subcategories': 'Browse by Type',
    'homeAppliances.notFound': 'Home Appliances category not yet configured',
    'homeAppliances.notFoundDesc': 'Create a category with slug "home-appliances" in the admin panel to get started.',
    'homeAppliances.shopAll': 'Shop All',
    'homeAppliances.products': 'products',

    // Gaming page
    'gaming.title': 'Gaming',
    'gaming.subtitle': 'Level up your gaming setup',
    'gaming.allGaming': 'All Gaming',
    'gaming.subcategories': 'Browse by Type',
    'gaming.notFound': 'Gaming category not yet configured',
    'gaming.notFoundDesc': 'Create a category with slug "gaming" in the admin panel to get started.',
    'gaming.shopAll': 'Shop All',
    'gaming.products': 'products',

    // Common
    'common.loading': 'Loading...',
    'common.viewAll': 'View All',
    'common.shopNow': 'Shop now',
    'common.learnMore': 'Learn More',
    'common.freeShippingOn': 'Free shipping on orders over',
    'common.welcomeTo': 'Welcome to',
    'common.min': 'Min',
    'common.max': 'Max',
    'common.show': 'Show',
    'common.results': 'Results',

    // Contact Page
    'contact.title': 'Contact Us',
    'contact.description': 'Have a question or need assistance? We\'re here to help. Reach out to us and we\'ll respond as soon as possible.',
    'contact.getInTouch': 'Get in Touch',
    'contact.sendMessage': 'Send us a Message',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.address': 'Address',
    'contact.workingHours': 'Working Hours',
    'contact.workingHoursValue': 'Sun - Thu: 9AM - 6PM',
    'contact.followUs': 'Follow us on social media',
    'contact.yourName': 'Your Name',
    'contact.enterName': 'Enter your name',
    'contact.emailAddress': 'Email Address',
    'contact.emailPlaceholder': 'you@example.com',
    'contact.phoneOptional': 'Phone Number (Optional)',
    'contact.subject': 'Subject',
    'contact.subjectPlaceholder': 'What\'s this about?',
    'contact.message': 'Message',
    'contact.messagePlaceholder': 'Tell us more about your inquiry...',
    'contact.sendBtn': 'Send Message',
    'contact.successToast': 'Message sent successfully! We\'ll get back to you soon.',
    'contact.errorToast': 'Failed to send message',
    'contact.nameError': 'Name must be at least 2 characters',
    'contact.emailError': 'Please enter a valid email',
    'contact.subjectError': 'Subject must be at least 3 characters',
    'contact.messageError': 'Message must be at least 10 characters',

    // Newsletter
    'newsletter.badge': 'Newsletter',
    'newsletter.title': 'Get 10% Off Your First Order',
    'newsletter.description': 'Subscribe to our newsletter and receive exclusive offers, product updates, and expert insights on the latest electronics and smart accessories.',
    'newsletter.exclusiveOffers': 'Exclusive Offers',
    'newsletter.exclusiveOffersDesc': 'Get special discounts',
    'newsletter.earlyAccess': 'Early Access',
    'newsletter.earlyAccessDesc': 'New arrivals first',
    'newsletter.flashSales': 'Flash Sales',
    'newsletter.flashSalesDesc': 'Never miss a deal',
    'newsletter.formTitle': 'Join Our Community',
    'newsletter.subscriberText': 'Over 10,000+ subscribers already',
    'newsletter.buttonText': 'Subscribe & Get 10% Off',
    'newsletter.emailLabel': 'Email address',
    'newsletter.emailPlaceholder': 'Enter your email address',
    'newsletter.privacyText': 'By subscribing, you agree to our',
    'newsletter.privacyLink': 'Privacy Policy',
    'newsletter.unsubscribeText': '. Unsubscribe anytime.',
    'newsletter.noSpam': 'No spam',
    'newsletter.weeklyUpdates': 'Weekly updates',
    'newsletter.unsubscribeAnytime': 'Unsubscribe anytime',
    'newsletter.successToast': 'Successfully subscribed! Check your email for confirmation.',
    'newsletter.errorToast': 'Failed to subscribe',

    // Testimonials
    'testimonials.customerReviews': 'Customer Reviews',
    'testimonials.whatCustomersSay': 'What Our Customers Say',
    'testimonials.writeReview': 'Write a Review',
    'testimonials.noReviewsTitle': 'No Reviews Yet',
    'testimonials.noReviewsDesc': 'Be the first to share your experience with Tapix!',
    'testimonials.writeFirstReview': 'Write the First Review',
    'testimonials.viewAll': 'View all',
    'testimonials.reviews': 'reviews',
    'testimonials.avgRating': 'Avg Rating',
    'testimonials.satisfied': 'Satisfied',
    'testimonials.fiveStar': '5-Star',
    'testimonials.shareExperience': 'Share Your Experience',
    'testimonials.yourName': 'Your Name',
    'testimonials.enterName': 'Enter your name',
    'testimonials.emailAddress': 'Email Address',
    'testimonials.enterEmail': 'Enter your email',
    'testimonials.yourRating': 'Your Rating',
    'testimonials.titleOptional': 'Title (Optional)',
    'testimonials.titlePlaceholder': 'e.g., Great shopping experience!',
    'testimonials.yourReview': 'Your Review',
    'testimonials.reviewPlaceholder': 'Tell us about your experience with Tapix...',
    'testimonials.cancel': 'Cancel',
    'testimonials.submit': 'Submit',
    'testimonials.successToast': 'Thank you for your testimonial! It will be reviewed shortly.',
    'testimonials.errorToast': 'Failed to submit testimonial. Please try again.',

    // Track Order
    'trackOrder.title': 'Track Your Order',
    'trackOrder.description': 'Enter your order number to check the status of your delivery.',
    'trackOrder.orderNumber': 'Order Number',
    'trackOrder.placeholder': 'Enter your order number (e.g. ORD-12345)',
    'trackOrder.trackBtn': 'Track Order',
    'trackOrder.viewAllOrders': 'View all your orders →',
    'trackOrder.signInToView': 'to view your order history.',
    'trackOrder.signIn': 'Sign in',
    'trackOrder.signInRequired': 'Sign in Required',
    'trackOrder.signInToTrack': 'Please sign in to track your order.',
    'trackOrder.orderNotFound': 'Order Not Found',
    'trackOrder.noOrderFound': 'No order found with number',
    'trackOrder.checkAndTry': 'Please check the order number and try again, or',
    'trackOrder.viewAllYourOrders': 'view all your orders',
    'trackOrder.orderPlaced': 'Order Placed',
    'trackOrder.accepted': 'Accepted',
    'trackOrder.processing': 'Processing',
    'trackOrder.outForDelivery': 'Out for Delivery',
    'trackOrder.delivered': 'Delivered',
    'trackOrder.cancelled': 'Cancelled',
    'trackOrder.failed': 'Failed',
    'trackOrder.placedOn': 'Placed on',
    'trackOrder.estimatedDelivery': 'Estimated Delivery: ',
    'trackOrder.deliveredOn': 'Delivered on: ',
    'trackOrder.cancelReason': 'Cancel Reason: ',
    'trackOrder.yourNotes': 'Your Notes: ',
    'trackOrder.statusHistory': 'Status History',
    'trackOrder.orderItems': 'Order Items',
    'trackOrder.qty': 'Qty:',
    'trackOrder.subtotal': 'Subtotal',
    'trackOrder.shipping': 'Shipping',
    'trackOrder.free': 'Free',
    'trackOrder.discount': 'Discount',
    'trackOrder.tax': 'Tax',
    'trackOrder.total': 'Total',
    'trackOrder.shippingAddress': 'Shipping Address',
    'trackOrder.building': 'Building:',
    'trackOrder.floor': 'Floor:',
    'trackOrder.apt': 'Apt:',
    'trackOrder.landmark': 'Landmark:',

    // Auth - Login
    'auth.welcomeBack': 'Welcome back',
    'auth.signInToContinue': 'Sign in to continue shopping',
    'auth.continueWithGoogle': 'Continue with Google',
    'auth.orContinueWithEmail': 'or continue with email',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'you@example.com',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.signIn': 'Sign In',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.signUp': 'Sign up',
    'auth.welcomeBackToast': 'Welcome back!',
    'auth.loginError': 'Failed to login',
    'auth.googleComingSoon': 'Google login coming soon',
    'auth.demoAccounts': 'Demo Accounts:',

    // Auth - Register
    'auth.createAccount': 'Create an account',
    'auth.joinAndShop': 'Join Tapix and start shopping',
    'auth.orRegisterWithEmail': 'or register with email',
    'auth.fullName': 'Full Name',
    'auth.fullNamePlaceholder': 'John Doe',
    'auth.phoneOptional': 'Phone (Optional)',
    'auth.phonePlaceholder': '+966 5X XXX XXXX',
    'auth.createPassword': 'Create a password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.confirmPasswordPlaceholder': 'Confirm your password',
    'auth.referralCodeApplied': 'Referral Code Applied!',
    'auth.referralDiscount': 'You will get {discount} off your first order',
    'auth.enterReferralCode': 'Enter referral code',
    'auth.apply': 'Apply',
    'auth.haveReferralCode': 'Have a referral code?',
    'auth.agreeToTerms': 'I agree to the',
    'auth.termsOfService': 'Terms of Service',
    'auth.and': 'and',
    'auth.privacyPolicy': 'Privacy Policy',
    'auth.createAccountBtn': 'Create Account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signInLink': 'Sign in',
    'auth.accountCreatedWithReferral': 'Account created! SAR 100 discount has been added to your account.',
    'auth.accountCreated': 'Account created successfully!',
    'auth.createAccountError': 'Failed to create account',
    'auth.googleSignupComingSoon': 'Google signup coming soon',
    'auth.referralAppliedToast': 'Referral code applied! You will get SAR 100 off your first order.',
    'auth.invalidReferral': 'Invalid referral code',
    'auth.acceptTermsError': 'You must accept the terms and conditions',
    'auth.nameError': 'Name must be at least 2 characters',
    'auth.emailError': 'Please enter a valid email',
    'auth.passwordError': 'Password must be at least 8 characters',
    'auth.passwordRegexError': 'Password must contain uppercase, lowercase, and a number',
    'auth.passwordsNoMatch': 'Passwords do not match',
    'auth.passwordRequired': 'Password is required',

    // Auth - Forgot Password
    'auth.forgotPasswordTitle': 'Forgot password?',
    'auth.forgotPasswordDesc': 'No worries, we\'ll send you reset instructions.',
    'auth.backToSignIn': 'Back to sign in',
    'auth.resetPassword': 'Reset Password',
    'auth.checkEmail': 'Check your email',
    'auth.resetLinkSent': 'We\'ve sent a password reset link to',
    'auth.didntReceive': 'Didn\'t receive the email? Check your spam folder or',
    'auth.tryAgain': 'try again',
    'auth.backToSignInBtn': 'Back to Sign In',
    'auth.resetEmailSent': 'Reset email sent!',
    'auth.resetEmailError': 'Failed to send reset email',
    'auth.enterYourEmail': 'Enter your email',

    // Auth - Reset Password
    'auth.setNewPassword': 'Set New Password',
    'auth.enterNewPasswordBelow': 'Enter your new password below',
    'auth.newPassword': 'New Password',
    'auth.enterNewPassword': 'Enter new password',
    'auth.confirmNewPassword': 'Confirm new password',
    'auth.passwordResetComplete': 'Password Reset Complete',
    'auth.passwordResetSuccess': 'Your password has been successfully reset. You can now log in with your new password.',
    'auth.goToLogin': 'Go to Login',
    'auth.rememberPassword': 'Remember your password?',
    'auth.backToLogin': 'Back to Login',
    'auth.passwordResetSuccessToast': 'Password reset successfully!',
    'auth.passwordResetError': 'Failed to reset password. The link may have expired.',
    'auth.invalidResetLink': 'Invalid reset link',

    // WhyChooseUs
    'whyChooseUs.badge': 'Why Shop With Us',
    'whyChooseUs.title': 'The Tapix Difference',
    'whyChooseUs.description': 'Everything you need for a smooth, reliable shopping experience — all in one place.',
    'whyChooseUs.original': '100% Original Products',
    'whyChooseUs.originalDesc': 'Sourced directly from authorized distributors. Every product is genuine.',
    'whyChooseUs.bestPrice': 'Best Price Guarantee',
    'whyChooseUs.bestPriceDesc': 'Competitive prices with exclusive discounts you won\'t find elsewhere.',
    'whyChooseUs.fastShipping': 'Fast & Free Shipping',
    'whyChooseUs.fastShippingDesc': 'Free shipping on qualifying orders. Express delivery available.',
    'whyChooseUs.warranty': 'Official Warranty',
    'whyChooseUs.warrantyDesc': 'Every product backed by official manufacturer warranty.',
    'whyChooseUs.easyReturns': 'Easy Returns',
    'whyChooseUs.easyReturnsDesc': '14-day hassle-free returns. Full refund or exchange, no questions asked.',
    'whyChooseUs.support': '24/7 Support',
    'whyChooseUs.supportDesc': 'Our team is always available to help — anytime you need us.',
    'whyChooseUs.ctaTitle': 'Still Have Questions?',
    'whyChooseUs.ctaDesc': 'Our customer support team is here to help. Contact us anytime via phone, email, or live chat.',
    'whyChooseUs.callUs': 'Call Us:',
    'whyChooseUs.sendMessage': 'Send a Message',
  },
  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.contact': 'تواصل معنا',
    'nav.homeAppliances': 'الأجهزة المنزلية',
    'nav.gaming': 'الألعاب',
    'nav.categories': 'الأقسام',
    'nav.signIn': 'تسجيل الدخول',
    'nav.trackOrder': 'تتبع الطلب',
    'nav.helpCenter': 'مركز المساعدة',
    'nav.myProfile': 'حسابي',
    'nav.myOrders': 'طلباتي',
    'nav.myCart': 'سلة التسوق',
    'nav.wishlist': 'المفضلة',
    'nav.addresses': 'العناوين',
    'nav.referEarn': 'ادعُ واكسب',
    'nav.adminPanel': 'لوحة التحكم',
    'nav.logOut': 'تسجيل الخروج',
    'nav.createAccount': 'إنشاء حساب',
    'nav.viewAllProducts': 'عرض جميع المنتجات',
    'nav.noCategories': 'لا توجد أقسام متاحة',
    'nav.searchProducts': 'ابحث عن منتجات...',
    'nav.closeSearch': 'إغلاق البحث',
    'nav.closeMenu': 'إغلاق القائمة',

    // Hero
    'hero.shopNow': 'تسوق الآن',
    'hero.searchProducts': 'ابحث عن منتجات...',

    // Features
    'features.freeShipping': 'شحن مجاني',
    'features.freeShippingDesc': 'للطلبات فوق 2,000 ريال',
    'features.warranty': 'ضمان سنة',
    'features.warrantyDesc': 'ضمان الشركة المصنعة',
    'features.easyReturns': 'إرجاع سهل',
    'features.easyReturnsDesc': 'سياسة إرجاع 14 يوم',
    'features.support': 'دعم 24/7',
    'features.supportDesc': 'مساعدة الخبراء في أي وقت',

    // Categories
    'categories.shopBy': 'تسوق حسب القسم',
    'categories.browseCollections': 'تصفح مجموعاتنا',
    'categories.items': 'منتج',

    // Products
    'products.allProducts': 'جميع المنتجات',
    'products.resultsFor': 'نتائج البحث عن',
    'products.product': 'منتج',
    'products.products': 'منتجات',
    'products.search': 'بحث',
    'products.searchProducts': 'ابحث عن منتجات...',
    'products.filters': 'التصفية',
    'products.clearAll': 'مسح الكل',
    'products.clear': 'مسح',
    'products.sortBy': 'ترتيب:',
    'products.noProducts': 'لا توجد منتجات',
    'products.adjustFilters': 'حاول تعديل عوامل التصفية أو مصطلح البحث',
    'products.clearFilters': 'مسح التصفية',
    'products.previous': 'السابق',
    'products.next': 'التالي',
    'products.page': 'صفحة',
    'products.of': 'من',
    'products.showResults': 'عرض النتائج',
    'products.onSale': 'عروض',
    'products.newArrivals': 'وصل حديثاً',
    'products.inStockOnly': 'متوفر فقط',
    'products.allCategories': 'جميع الأقسام',
    'products.priceRange': 'نطاق السعر',
    'products.customRange': 'نطاق مخصص',
    'products.customerRating': 'تقييم العملاء',
    'products.andUp': 'وأعلى',
    'products.brands': 'الماركات',

    // Deals
    'deals.limitedTime': 'عرض لفترة محدودة',
    'deals.flashDeals': 'عروض سريعة',
    'deals.endsIn': 'ينتهي في:',
    'deals.viewAllDeals': 'عرض جميع العروض',
    'deals.days': 'أيام',
    'deals.hours': 'ساعات',
    'deals.mins': 'دقائق',
    'deals.secs': 'ثواني',

    // Featured Products
    'featured.handPicked': 'مختارة لك',
    'featured.title': 'منتجات مميزة',

    // Newsletter
    'newsletter.subscribe': 'اشترك',
    'newsletter.enterEmail': 'أدخل بريدك الإلكتروني',

    // Footer
    'footer.allRightsReserved': 'جميع الحقوق محفوظة.',
    'footer.shop': 'تسوق',
    'footer.support': 'الدعم',
    'footer.company': 'الشركة',
    'footer.account': 'الحساب',
    'footer.allProducts': 'جميع المنتجات',
    'footer.specialDeals': 'عروض خاصة',
    'footer.contactUs': 'تواصل معنا',
    'footer.faqs': 'الأسئلة الشائعة',
    'footer.trackOrder': 'تتبع الطلب',
    'footer.shippingInfo': 'معلومات الشحن',
    'footer.returnsExchanges': 'الإرجاع والاستبدال',
    'footer.warranty': 'الضمان',
    'footer.aboutUs': 'من نحن',
    'footer.blog': 'المدونة',
    'footer.careers': 'الوظائف',
    'footer.press': 'الصحافة',
    'footer.privacyPolicy': 'سياسة الخصوصية',
    'footer.termsOfService': 'شروط الخدمة',
    'footer.myAccount': 'حسابي',
    'footer.orderHistory': 'سجل الطلبات',
    'footer.wishlist': 'المفضلة',
    'footer.shoppingCart': 'سلة التسوق',
    'footer.referEarn': 'ادعُ واكسب',
    'footer.weAccept': 'نقبل:',
    'footer.privacy': 'الخصوصية',
    'footer.terms': 'الشروط',
    'footer.description': 'وجهتك للإلكترونيات المميزة والإكسسوارات الذكية. أفضل العلامات التجارية وأسعار تنافسية وخدمة استثنائية.',

    // Products page sort options
    'sort.newestFirst': 'الأحدث أولاً',
    'sort.priceLowHigh': 'السعر: من الأقل للأعلى',
    'sort.priceHighLow': 'السعر: من الأعلى للأقل',
    'sort.highestRated': 'الأعلى تقييماً',
    'sort.bestSelling': 'الأكثر مبيعاً',
    'sort.nameAZ': 'الاسم: أ-ي',
    'sort.nameZA': 'الاسم: ي-أ',

    // Search Autocomplete
    'search.placeholder': 'ابحث عن منتجات...',
    'search.searching': 'جاري البحث...',
    'search.noResults': 'لا توجد منتجات',
    'search.viewAll': 'عرض جميع النتائج لـ',

    // Category Nav
    'categoryNav.allProducts': 'جميع المنتجات',

    // Category Strip
    'strip.onSale': 'عروض خاصة',
    'strip.newArrivals': 'وصل حديثاً',
    'strip.topIn': 'الأفضل في',

    // Home Appliances
    'homeAppliances.title': 'الأجهزة المنزلية',
    'homeAppliances.subtitle': 'أجهزة منزلية فاخرة لمنزلك',
    'homeAppliances.allAppliances': 'جميع الأجهزة',
    'homeAppliances.subcategories': 'تصفح حسب النوع',
    'homeAppliances.notFound': 'قسم الأجهزة المنزلية غير مُعد بعد',
    'homeAppliances.notFoundDesc': 'قم بإنشاء قسم بالمعرف "home-appliances" في لوحة التحكم للبدء.',
    'homeAppliances.shopAll': 'تسوق الكل',
    'homeAppliances.products': 'منتج',

    // Gaming page
    'gaming.title': 'الألعاب',
    'gaming.subtitle': 'طوّر إعداد الألعاب الخاص بك',
    'gaming.allGaming': 'جميع الألعاب',
    'gaming.subcategories': 'تصفح حسب النوع',
    'gaming.notFound': 'قسم الألعاب غير مُعد بعد',
    'gaming.notFoundDesc': 'قم بإنشاء قسم بالمعرف "gaming" في لوحة التحكم للبدء.',
    'gaming.shopAll': 'تسوق الكل',
    'gaming.products': 'منتج',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.viewAll': 'عرض الكل',
    'common.shopNow': 'تسوق الآن',
    'common.learnMore': 'اعرف المزيد',
    'common.freeShippingOn': 'شحن مجاني للطلبات فوق',
    'common.welcomeTo': 'مرحباً بك في',
    'common.min': 'الحد الأدنى',
    'common.max': 'الحد الأقصى',
    'common.show': 'عرض',
    'common.results': 'نتائج',

    // Contact Page
    'contact.title': 'تواصل معنا',
    'contact.description': 'هل لديك سؤال أو تحتاج مساعدة؟ نحن هنا لمساعدتك. تواصل معنا وسنرد عليك في أقرب وقت.',
    'contact.getInTouch': 'تواصل معنا',
    'contact.sendMessage': 'أرسل لنا رسالة',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'الهاتف',
    'contact.address': 'العنوان',
    'contact.workingHours': 'ساعات العمل',
    'contact.workingHoursValue': 'الأحد - الخميس: 9 صباحاً - 6 مساءً',
    'contact.followUs': 'تابعنا على وسائل التواصل الاجتماعي',
    'contact.yourName': 'اسمك',
    'contact.enterName': 'أدخل اسمك',
    'contact.emailAddress': 'البريد الإلكتروني',
    'contact.emailPlaceholder': 'you@example.com',
    'contact.phoneOptional': 'رقم الهاتف (اختياري)',
    'contact.subject': 'الموضوع',
    'contact.subjectPlaceholder': 'ما هو الموضوع؟',
    'contact.message': 'الرسالة',
    'contact.messagePlaceholder': 'أخبرنا المزيد عن استفسارك...',
    'contact.sendBtn': 'إرسال الرسالة',
    'contact.successToast': 'تم إرسال الرسالة بنجاح! سنرد عليك قريباً.',
    'contact.errorToast': 'فشل إرسال الرسالة',
    'contact.nameError': 'يجب أن يكون الاسم على الأقل حرفين',
    'contact.emailError': 'يرجى إدخال بريد إلكتروني صحيح',
    'contact.subjectError': 'يجب أن يكون الموضوع على الأقل 3 أحرف',
    'contact.messageError': 'يجب أن تكون الرسالة على الأقل 10 أحرف',

    // Newsletter
    'newsletter.badge': 'النشرة البريدية',
    'newsletter.title': 'احصل على خصم 10% على طلبك الأول',
    'newsletter.description': 'اشترك في نشرتنا البريدية واحصل على عروض حصرية وتحديثات المنتجات ونصائح الخبراء حول أحدث الإلكترونيات والإكسسوارات الذكية.',
    'newsletter.exclusiveOffers': 'عروض حصرية',
    'newsletter.exclusiveOffersDesc': 'خصومات مميزة',
    'newsletter.earlyAccess': 'وصول مبكر',
    'newsletter.earlyAccessDesc': 'المنتجات الجديدة أولاً',
    'newsletter.flashSales': 'عروض سريعة',
    'newsletter.flashSalesDesc': 'لا تفوت أي عرض',
    'newsletter.formTitle': 'انضم لمجتمعنا',
    'newsletter.subscriberText': 'أكثر من 10,000 مشترك بالفعل',
    'newsletter.buttonText': 'اشترك واحصل على خصم 10%',
    'newsletter.emailLabel': 'البريد الإلكتروني',
    'newsletter.emailPlaceholder': 'أدخل بريدك الإلكتروني',
    'newsletter.privacyText': 'بالاشتراك، أنت توافق على',
    'newsletter.privacyLink': 'سياسة الخصوصية',
    'newsletter.unsubscribeText': '. يمكنك إلغاء الاشتراك في أي وقت.',
    'newsletter.noSpam': 'بدون إزعاج',
    'newsletter.weeklyUpdates': 'تحديثات أسبوعية',
    'newsletter.unsubscribeAnytime': 'إلغاء الاشتراك في أي وقت',
    'newsletter.successToast': 'تم الاشتراك بنجاح! تحقق من بريدك الإلكتروني للتأكيد.',
    'newsletter.errorToast': 'فشل الاشتراك',

    // Testimonials
    'testimonials.customerReviews': 'آراء العملاء',
    'testimonials.whatCustomersSay': 'ماذا يقول عملاؤنا',
    'testimonials.writeReview': 'اكتب تقييم',
    'testimonials.noReviewsTitle': 'لا توجد تقييمات بعد',
    'testimonials.noReviewsDesc': 'كن أول من يشارك تجربته مع Tapix!',
    'testimonials.writeFirstReview': 'اكتب أول تقييم',
    'testimonials.viewAll': 'عرض جميع',
    'testimonials.reviews': 'التقييمات',
    'testimonials.avgRating': 'متوسط التقييم',
    'testimonials.satisfied': 'راضون',
    'testimonials.fiveStar': '5 نجوم',
    'testimonials.shareExperience': 'شارك تجربتك',
    'testimonials.yourName': 'اسمك',
    'testimonials.enterName': 'أدخل اسمك',
    'testimonials.emailAddress': 'البريد الإلكتروني',
    'testimonials.enterEmail': 'أدخل بريدك الإلكتروني',
    'testimonials.yourRating': 'تقييمك',
    'testimonials.titleOptional': 'العنوان (اختياري)',
    'testimonials.titlePlaceholder': 'مثال: تجربة تسوق رائعة!',
    'testimonials.yourReview': 'تقييمك',
    'testimonials.reviewPlaceholder': 'أخبرنا عن تجربتك مع Tapix...',
    'testimonials.cancel': 'إلغاء',
    'testimonials.submit': 'إرسال',
    'testimonials.successToast': 'شكراً لتقييمك! سيتم مراجعته قريباً.',
    'testimonials.errorToast': 'فشل إرسال التقييم. يرجى المحاولة مرة أخرى.',

    // Track Order
    'trackOrder.title': 'تتبع طلبك',
    'trackOrder.description': 'أدخل رقم طلبك للتحقق من حالة التوصيل.',
    'trackOrder.orderNumber': 'رقم الطلب',
    'trackOrder.placeholder': 'أدخل رقم طلبك (مثال: ORD-12345)',
    'trackOrder.trackBtn': 'تتبع الطلب',
    'trackOrder.viewAllOrders': 'عرض جميع طلباتك ←',
    'trackOrder.signInToView': 'لعرض سجل طلباتك.',
    'trackOrder.signIn': 'تسجيل الدخول',
    'trackOrder.signInRequired': 'تسجيل الدخول مطلوب',
    'trackOrder.signInToTrack': 'يرجى تسجيل الدخول لتتبع طلبك.',
    'trackOrder.orderNotFound': 'الطلب غير موجود',
    'trackOrder.noOrderFound': 'لم يتم العثور على طلب بالرقم',
    'trackOrder.checkAndTry': 'يرجى التحقق من رقم الطلب والمحاولة مرة أخرى، أو',
    'trackOrder.viewAllYourOrders': 'عرض جميع طلباتك',
    'trackOrder.orderPlaced': 'تم الطلب',
    'trackOrder.accepted': 'تم القبول',
    'trackOrder.processing': 'قيد المعالجة',
    'trackOrder.outForDelivery': 'في الطريق للتوصيل',
    'trackOrder.delivered': 'تم التوصيل',
    'trackOrder.cancelled': 'ملغي',
    'trackOrder.failed': 'فشل',
    'trackOrder.placedOn': 'تم الطلب في',
    'trackOrder.estimatedDelivery': 'التوصيل المتوقع: ',
    'trackOrder.deliveredOn': 'تم التوصيل في: ',
    'trackOrder.cancelReason': 'سبب الإلغاء: ',
    'trackOrder.yourNotes': 'ملاحظاتك: ',
    'trackOrder.statusHistory': 'سجل الحالة',
    'trackOrder.orderItems': 'عناصر الطلب',
    'trackOrder.qty': 'الكمية:',
    'trackOrder.subtotal': 'المجموع الفرعي',
    'trackOrder.shipping': 'الشحن',
    'trackOrder.free': 'مجاني',
    'trackOrder.discount': 'الخصم',
    'trackOrder.tax': 'الضريبة',
    'trackOrder.total': 'الإجمالي',
    'trackOrder.shippingAddress': 'عنوان الشحن',
    'trackOrder.building': 'المبنى:',
    'trackOrder.floor': 'الطابق:',
    'trackOrder.apt': 'الشقة:',
    'trackOrder.landmark': 'معلم قريب:',

    // Auth - Login
    'auth.welcomeBack': 'مرحباً بعودتك',
    'auth.signInToContinue': 'سجل دخولك لمتابعة التسوق',
    'auth.continueWithGoogle': 'المتابعة مع جوجل',
    'auth.orContinueWithEmail': 'أو المتابعة بالبريد الإلكتروني',
    'auth.email': 'البريد الإلكتروني',
    'auth.emailPlaceholder': 'you@example.com',
    'auth.password': 'كلمة المرور',
    'auth.passwordPlaceholder': 'أدخل كلمة المرور',
    'auth.rememberMe': 'تذكرني',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.signIn': 'تسجيل الدخول',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.signUp': 'إنشاء حساب',
    'auth.welcomeBackToast': 'مرحباً بعودتك!',
    'auth.loginError': 'فشل تسجيل الدخول',
    'auth.googleComingSoon': 'تسجيل الدخول بجوجل قريباً',
    'auth.demoAccounts': 'حسابات تجريبية:',

    // Auth - Register
    'auth.createAccount': 'إنشاء حساب جديد',
    'auth.joinAndShop': 'انضم إلى Tapix وابدأ التسوق',
    'auth.orRegisterWithEmail': 'أو التسجيل بالبريد الإلكتروني',
    'auth.fullName': 'الاسم الكامل',
    'auth.fullNamePlaceholder': 'محمد أحمد',
    'auth.phoneOptional': 'الهاتف (اختياري)',
    'auth.phonePlaceholder': '+966 5X XXX XXXX',
    'auth.createPassword': 'أنشئ كلمة مرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.confirmPasswordPlaceholder': 'أكد كلمة المرور',
    'auth.referralCodeApplied': 'تم تطبيق كود الإحالة!',
    'auth.referralDiscount': 'ستحصل على خصم {discount} على طلبك الأول',
    'auth.enterReferralCode': 'أدخل كود الإحالة',
    'auth.apply': 'تطبيق',
    'auth.haveReferralCode': 'لديك كود إحالة؟',
    'auth.agreeToTerms': 'أوافق على',
    'auth.termsOfService': 'شروط الخدمة',
    'auth.and': 'و',
    'auth.privacyPolicy': 'سياسة الخصوصية',
    'auth.createAccountBtn': 'إنشاء حساب',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.signInLink': 'تسجيل الدخول',
    'auth.accountCreatedWithReferral': 'تم إنشاء الحساب! تم إضافة خصم 100 ريال إلى حسابك.',
    'auth.accountCreated': 'تم إنشاء الحساب بنجاح!',
    'auth.createAccountError': 'فشل إنشاء الحساب',
    'auth.googleSignupComingSoon': 'التسجيل بجوجل قريباً',
    'auth.referralAppliedToast': 'تم تطبيق كود الإحالة! ستحصل على خصم 100 ريال على طلبك الأول.',
    'auth.invalidReferral': 'كود إحالة غير صالح',
    'auth.acceptTermsError': 'يجب الموافقة على الشروط والأحكام',
    'auth.nameError': 'يجب أن يكون الاسم على الأقل حرفين',
    'auth.emailError': 'يرجى إدخال بريد إلكتروني صحيح',
    'auth.passwordError': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    'auth.passwordRegexError': 'يجب أن تحتوي كلمة المرور على حرف كبير وصغير ورقم',
    'auth.passwordsNoMatch': 'كلمات المرور غير متطابقة',
    'auth.passwordRequired': 'كلمة المرور مطلوبة',

    // Auth - Forgot Password
    'auth.forgotPasswordTitle': 'نسيت كلمة المرور؟',
    'auth.forgotPasswordDesc': 'لا تقلق، سنرسل لك تعليمات إعادة التعيين.',
    'auth.backToSignIn': 'العودة لتسجيل الدخول',
    'auth.resetPassword': 'إعادة تعيين كلمة المرور',
    'auth.checkEmail': 'تحقق من بريدك الإلكتروني',
    'auth.resetLinkSent': 'لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى',
    'auth.didntReceive': 'لم تستلم البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها أو',
    'auth.tryAgain': 'حاول مرة أخرى',
    'auth.backToSignInBtn': 'العودة لتسجيل الدخول',
    'auth.resetEmailSent': 'تم إرسال بريد إعادة التعيين!',
    'auth.resetEmailError': 'فشل إرسال بريد إعادة التعيين',
    'auth.enterYourEmail': 'أدخل بريدك الإلكتروني',

    // Auth - Reset Password
    'auth.setNewPassword': 'تعيين كلمة مرور جديدة',
    'auth.enterNewPasswordBelow': 'أدخل كلمة المرور الجديدة أدناه',
    'auth.newPassword': 'كلمة المرور الجديدة',
    'auth.enterNewPassword': 'أدخل كلمة المرور الجديدة',
    'auth.confirmNewPassword': 'تأكيد كلمة المرور الجديدة',
    'auth.passwordResetComplete': 'تم إعادة تعيين كلمة المرور',
    'auth.passwordResetSuccess': 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
    'auth.goToLogin': 'الذهاب لتسجيل الدخول',
    'auth.rememberPassword': 'تتذكر كلمة المرور؟',
    'auth.backToLogin': 'العودة لتسجيل الدخول',
    'auth.passwordResetSuccessToast': 'تم إعادة تعيين كلمة المرور بنجاح!',
    'auth.passwordResetError': 'فشل إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية.',
    'auth.invalidResetLink': 'رابط إعادة التعيين غير صالح',

    // WhyChooseUs
    'whyChooseUs.badge': 'لماذا تتسوق معنا',
    'whyChooseUs.title': 'ما يميز Tapix',
    'whyChooseUs.description': 'كل ما تحتاجه لتجربة تسوق سلسة وموثوقة — في مكان واحد.',
    'whyChooseUs.original': 'منتجات أصلية 100%',
    'whyChooseUs.originalDesc': 'من موزعين معتمدين مباشرة. كل منتج أصلي ومضمون.',
    'whyChooseUs.bestPrice': 'ضمان أفضل سعر',
    'whyChooseUs.bestPriceDesc': 'أسعار تنافسية مع خصومات حصرية لن تجدها في مكان آخر.',
    'whyChooseUs.fastShipping': 'شحن سريع ومجاني',
    'whyChooseUs.fastShippingDesc': 'شحن مجاني على الطلبات المؤهلة. التوصيل السريع متاح.',
    'whyChooseUs.warranty': 'ضمان رسمي',
    'whyChooseUs.warrantyDesc': 'كل منتج مدعوم بضمان الشركة المصنعة الرسمي.',
    'whyChooseUs.easyReturns': 'إرجاع سهل',
    'whyChooseUs.easyReturnsDesc': 'إرجاع بدون متاعب لمدة 14 يوم. استرداد كامل أو استبدال.',
    'whyChooseUs.support': 'دعم 24/7',
    'whyChooseUs.supportDesc': 'فريقنا متاح دائماً لمساعدتك — في أي وقت تحتاجنا.',
    'whyChooseUs.ctaTitle': 'لا تزال لديك أسئلة؟',
    'whyChooseUs.ctaDesc': 'فريق دعم العملاء لدينا هنا للمساعدة. تواصل معنا في أي وقت عبر الهاتف أو البريد أو الدردشة.',
    'whyChooseUs.callUs': 'اتصل بنا:',
    'whyChooseUs.sendMessage': 'أرسل رسالة',
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('tapix-locale') as Locale;
    if (saved === 'ar' || saved === 'en') {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('tapix-locale', newLocale);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] || translations['en']?.[key] || key;
  }, [locale]);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale, dir } = useI18n();
  return { t, locale, dir };
}

/**
 * Returns the localized value of a field from a data object.
 * If locale is 'ar', it tries `fieldAr` first, then falls back to `field`.
 * If locale is 'en', it returns `field` directly.
 *
 * Usage: localize(product, 'title', locale) → product.titleAr || product.title
 */
export function localize(item: any, field: string, locale: Locale): string {
  if (!item) return '';
  if (locale === 'ar') {
    const arField = `${field}Ar`;
    if (item[arField]) return item[arField];
  }
  return item[field] || '';
}

/**
 * Hook that returns a localize function bound to the current locale.
 * Usage: const { l } = useLocalized();
 *        l(product, 'title') → returns Arabic title if locale is 'ar' and titleAr exists
 */
export function useLocalized() {
  const { locale } = useI18n();
  const l = useCallback(
    (item: any, field: string): string => localize(item, field, locale),
    [locale]
  );
  return { l, locale };
}

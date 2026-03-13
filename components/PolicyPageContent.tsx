'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { Skeleton } from '@/components/ui';
import api from '@/lib/api';

const sanitizeHTML = (html: string) => {
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html);
};

async function fetchPolicy(slug: string) {
  try {
    const res = await api.get(`/cms/policies/${slug}`);
    return res.data.data;
  } catch {
    return null;
  }
}

// Inline fallback content for when the API hasn't seeded yet
const fallbackContent: Record<string, { title: string; content: string }> = {
  privacy: {
    title: 'Privacy Policy',
    content: `
<h2>Introduction</h2>
<p>At Tapix, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.</p>
<h2>Information We Collect</h2>
<h3>Personal Information</h3>
<p>When you create an account, place an order, or contact us, we may collect:</p>
<ul>
<li>Full name, email address, and phone number</li>
<li>Shipping and billing addresses</li>
<li>Payment information (processed securely through our payment providers)</li>
<li>Order history and preferences</li>
</ul>
<h3>Automatically Collected Information</h3>
<p>When you browse our website, we may automatically collect:</p>
<ul>
<li>IP address and browser type</li>
<li>Device information and operating system</li>
<li>Pages visited and time spent on our site</li>
<li>Referring website addresses</li>
</ul>
<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Process and fulfill your orders</li>
<li>Send order confirmations and shipping updates</li>
<li>Provide customer support and respond to inquiries</li>
<li>Personalize your shopping experience</li>
<li>Send promotional offers and newsletters (with your consent)</li>
<li>Improve our website, products, and services</li>
<li>Prevent fraud and ensure security</li>
</ul>
<h2>Information Sharing</h2>
<p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
<ul>
<li><strong>Shipping carriers</strong> to deliver your orders</li>
<li><strong>Payment processors</strong> to securely handle transactions</li>
<li><strong>Service providers</strong> who assist in operating our website</li>
<li><strong>Legal authorities</strong> when required by law</li>
</ul>
<h2>Data Security</h2>
<p>We implement industry-standard security measures to protect your personal information, including SSL encryption, secure data storage, and regular security audits.</p>
<h2>Cookies</h2>
<p>We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze website traffic. You can manage cookie preferences through your browser settings.</p>
<h2>Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access, update, or delete your personal information</li>
<li>Opt out of marketing communications</li>
<li>Request a copy of the data we hold about you</li>
<li>Lodge a complaint with a data protection authority</li>
</ul>
<h2>Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@tapix.com">privacy@tapix.com</a> or through our Contact page.</p>
`,
  },
  terms: {
    title: 'Terms of Service',
    content: `
<h2>Agreement to Terms</h2>
<p>By accessing and using the Tapix website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.</p>
<h2>Account Registration</h2>
<p>To place orders, you may need to create an account. You are responsible for:</p>
<ul>
<li>Providing accurate and complete registration information</li>
<li>Maintaining the security of your account credentials</li>
<li>All activities that occur under your account</li>
<li>Notifying us immediately of any unauthorized use</li>
</ul>
<h2>Products and Pricing</h2>
<ul>
<li>All product descriptions and images are as accurate as possible, but we do not guarantee that colors or details displayed on your screen are exact.</li>
<li>Prices are listed in SAR and are subject to change without notice.</li>
<li>We reserve the right to limit quantities and refuse any order.</li>
<li>Promotional offers and discounts may have specific terms and expiration dates.</li>
</ul>
<h2>Orders and Payment</h2>
<ul>
<li>By placing an order, you are making an offer to purchase the selected products.</li>
<li>We reserve the right to accept or decline any order.</li>
<li>Payment must be completed at the time of order or upon delivery (for Cash on Delivery).</li>
<li>All payment information is processed securely through trusted payment providers.</li>
</ul>
<h2>Shipping and Delivery</h2>
<p>Delivery times are estimates and may vary depending on your location and product availability. Please refer to our <a href="/shipping">Shipping Information</a> page for detailed delivery policies.</p>
<h2>Returns and Refunds</h2>
<p>We want you to be completely satisfied with your purchase. Please review our <a href="/returns">Returns & Exchanges</a> policy for information on how to return or exchange items.</p>
<h2>Intellectual Property</h2>
<p>All content on the Tapix website, including text, graphics, logos, images, and software, is the property of Tapix or its content suppliers and is protected by intellectual property laws.</p>
<h2>Limitation of Liability</h2>
<p>Tapix shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid for the product in question.</p>
<h2>User Conduct</h2>
<p>You agree not to:</p>
<ul>
<li>Use the website for any unlawful purpose</li>
<li>Attempt to gain unauthorized access to any part of the website</li>
<li>Interfere with the proper functioning of the website</li>
<li>Submit false or misleading information</li>
</ul>
<h2>Changes to Terms</h2>
<p>We reserve the right to update these Terms of Service at any time. Changes will be effective immediately upon posting.</p>
<h2>Governing Law</h2>
<p>These terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes shall be resolved in the competent courts of Saudi Arabia.</p>
<h2>Contact Us</h2>
<p>For questions about these Terms of Service, please contact us at <a href="mailto:legal@tapix.com">legal@tapix.com</a> or through our Contact page.</p>
`,
  },
  shipping: {
    title: 'Shipping & Delivery',
    content: `
<h2>Shipping Methods</h2>
<p>Tapix offers multiple shipping options to get your electronics and accessories to you as fast as possible:</p>
<ul>
<li><strong>Standard Shipping</strong> - Delivery within 3-5 business days to most cities in Egypt</li>
<li><strong>Express Shipping</strong> - Delivery within 1-2 business days to major cities (Cairo, Alexandria, Giza)</li>
<li><strong>Same-Day Delivery</strong> - Available for select areas in Cairo for orders placed before 12:00 PM</li>
</ul>
<h2>Shipping Timelines</h2>
<table>
<thead><tr><th>Location</th><th>Delivery Time</th></tr></thead>
<tbody>
<tr><td>Major Cities (Cairo, Alexandria, Giza)</td><td><strong>1-2 business days</strong></td></tr>
<tr><td>Other Cities</td><td>3-5 business days</td></tr>
<tr><td>Remote Areas</td><td>5-7 business days</td></tr>
</tbody>
</table>
<h2>Order Processing</h2>
<ul>
<li>Orders placed before <strong>2:00 PM</strong> are processed the same business day.</li>
<li>Orders placed after 2:00 PM or on weekends/holidays are processed the next business day.</li>
<li>You will receive a confirmation email with tracking details once your order is shipped.</li>
</ul>
<h2>Order Tracking</h2>
<p>Once your order has been shipped, you can track it by:</p>
<ul>
<li>Using the <a href="/track-order">Track Order</a> page with your order number</li>
<li>Checking your order status in <a href="/account/orders">My Orders</a></li>
<li>Clicking the tracking link in your shipping confirmation email</li>
</ul>
<h2>Free Shipping</h2>
<ul>
<li>Free standard shipping on all orders over SAR 2,000.</li>
<li>Free shipping applies to standard delivery only; express and same-day options may have additional fees.</li>
<li>Promotional free shipping offers may apply during sales events.</li>
</ul>
<h2>Delivery Issues</h2>
<p>If you experience any issues with your delivery:</p>
<ul>
<li>Contact us within 24 hours of the expected delivery date</li>
<li>Report any damaged or missing items immediately upon receipt</li>
<li>Reach out to our support team through the Contact Us page</li>
</ul>
<h2>Shipping Coverage</h2>
<p>We currently ship to all governorates within Egypt. International shipping is not available at this time, but we are working on expanding to the MENA region soon.</p>
`,
  },
  returns: {
    title: 'Returns & Exchanges',
    content: `
<h2>Return Policy Overview</h2>
<p>At Tapix, we want you to be completely satisfied with your purchase. If you're not happy with your order, we offer a hassle-free return and exchange process.</p>
<h2>Return Eligibility</h2>
<ul>
<li>Items can be returned within <strong>14 days</strong> of delivery.</li>
<li>Products must be in their original packaging and unused condition.</li>
<li>All accessories, manuals, and warranty cards must be included.</li>
<li>Items must not show signs of damage, wear, or tampering.</li>
</ul>
<h2>Non-Returnable Items</h2>
<p>The following items cannot be returned:</p>
<ul>
<li>Opened earbuds, headphones, or audio products (for hygiene reasons)</li>
<li>Screen protectors and tempered glass once applied</li>
<li>Products with broken seals or missing serial numbers</li>
<li>Products purchased on final sale or clearance</li>
<li>Gift cards and vouchers</li>
</ul>
<h2>How to Request a Return</h2>
<ol>
<li><strong>Initiate your request</strong> by contacting our customer support team or through your account under <a href="/account/orders">My Orders</a>.</li>
<li><strong>Provide details</strong> about your purchase and the reason for the return.</li>
<li><strong>Ship the item back</strong> - our team will provide return shipping instructions and a return label.</li>
<li><strong>Refund or exchange</strong> will be processed after we inspect the returned item.</li>
</ol>
<h2>Refund Process</h2>
<ul>
<li><strong>Original payment method</strong>: Refund within 7-10 business days after item inspection.</li>
<li><strong>Cash on Delivery orders</strong>: Refund via bank transfer.</li>
<li><strong>Shipping fees</strong>: Original shipping fees are non-refundable unless the return is due to our error.</li>
</ul>
<h2>Exchanges</h2>
<p>Want a different product? You can exchange your purchase for another item of equal or greater value:</p>
<ul>
<li>If the new item costs more, you'll pay the difference.</li>
<li>If the new item costs less, we'll refund the difference.</li>
<li>Exchange options are subject to product availability.</li>
</ul>
<h2>Defective or Damaged Products</h2>
<p>If you received a defective or damaged product:</p>
<ul>
<li>Contact us within <strong>48 hours</strong> of delivery with photos of the damage or defect.</li>
<li>We will arrange a free pickup and provide a replacement or full refund.</li>
<li>Please retain all original packaging until the claim is resolved.</li>
</ul>
<h2>Contact Us</h2>
<p>For return inquiries, contact our support team at <a href="mailto:returns@tapix.com">returns@tapix.com</a> or call us.</p>
`,
  },
  warranty: {
    title: 'Warranty Policy',
    content: `
<h2>Warranty Coverage</h2>
<p>All products sold by Tapix come with an official manufacturer warranty. The warranty period varies by product category:</p>
<table>
<thead><tr><th>Product Category</th><th>Warranty Period</th></tr></thead>
<tbody>
<tr><td>Smartphones</td><td>12 months manufacturer warranty</td></tr>
<tr><td>Smart Watches</td><td>12 months manufacturer warranty</td></tr>
<tr><td>Wireless Earbuds & Headphones</td><td>12 months manufacturer warranty</td></tr>
<tr><td>Chargers & Power Banks</td><td>6-12 months manufacturer warranty</td></tr>
<tr><td>Phone Cases & Accessories</td><td>6 months warranty</td></tr>
<tr><td>Gaming & Laptop Accessories</td><td>12 months manufacturer warranty</td></tr>
</tbody>
</table>
<h2>What's Covered</h2>
<ul>
<li>Manufacturing defects and hardware malfunctions</li>
<li>Battery defects within the warranty period</li>
<li>Connectivity or performance issues not caused by physical damage</li>
</ul>
<h2>What's NOT Covered</h2>
<ul>
<li>Physical damage from drops, impacts, or liquid exposure</li>
<li>Damage caused by unauthorized repairs or modifications</li>
<li>Normal wear and tear (scratches, fading, etc.)</li>
<li>Damage caused by improper use or voltage fluctuations</li>
<li>Consumable parts (ear tips, cables included as accessories)</li>
<li>Products with removed or tampered serial numbers</li>
</ul>
<h2>How to Claim Warranty</h2>
<ol>
<li><strong>Contact our support team</strong> at <a href="mailto:support@tapix.com">support@tapix.com</a> with your order number and a description of the issue.</li>
<li><strong>Provide proof of purchase</strong> - your Tapix order confirmation or invoice.</li>
<li><strong>Describe the issue</strong> with photos or videos of the defect.</li>
<li><strong>Our team will assess</strong> the claim and provide next steps within 2-3 business days.</li>
<li><strong>If approved</strong>, we will repair, replace, or refund the product as appropriate.</li>
</ol>
<h2>Warranty Service Options</h2>
<ul>
<li><strong>Repair</strong>: Product sent to the manufacturer's authorized service center for repair.</li>
<li><strong>Replacement</strong>: If the product cannot be repaired, a replacement unit will be provided.</li>
<li><strong>Refund</strong>: If a replacement is unavailable, a full refund will be issued.</li>
</ul>
<h2>Extended Warranty</h2>
<p>For select products, we offer extended warranty plans for additional coverage beyond the standard period. Check the product page for extended warranty options at the time of purchase.</p>
<h2>Brand Service Centers</h2>
<p>For certain brands, warranty service may be handled directly through the brand's official service centers in Egypt. Our team will guide you to the appropriate service center if applicable.</p>
<h2>Contact Us</h2>
<p>For warranty questions, reach out to <a href="mailto:support@tapix.com">support@tapix.com</a> or contact our customer support team.</p>
`,
  },
};

export default function PolicyPageContent({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const { data: page, isLoading } = useQuery({
    queryKey: ['policy', slug],
    queryFn: () => fetchPolicy(slug),
  });

  // Use API data first, then inline fallback
  const fb = fallbackContent[slug];
  const title = page?.title || fb?.title || fallbackTitle;
  const content = page?.content || fb?.content || '<p>This page is being updated. Please check back soon.</p>';

  return (
    <div className="min-h-screen bg-beige-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton variant="text" className="h-10 w-64" />
            <Skeleton variant="rounded" className="h-96" />
          </div>
        ) : (
          <>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-display font-semibold text-dark-900 mb-8"
            >
              {title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 md:p-8 shadow-sm prose prose-sm max-w-none prose-headings:text-dark-900 prose-p:text-dark-600 prose-a:text-primary-600 prose-li:text-dark-600 prose-table:text-dark-600 prose-th:text-dark-900 prose-th:bg-beige-50 prose-th:p-3 prose-td:p-3 prose-table:border prose-table:border-beige-200 prose-th:border prose-th:border-beige-200 prose-td:border prose-td:border-beige-200"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
            />
          </>
        )}
      </div>
    </div>
  );
}

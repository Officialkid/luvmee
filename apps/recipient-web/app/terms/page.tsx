import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Shield, Heart, AlertCircle } from 'lucide-react';
import { LegalNav } from '../../components/LegalNav';
import { LegalFooter } from '../../components/LegalFooter';

export const metadata: Metadata = {
  title: 'Terms of Service | LUVMEE',
  description: 'Terms and conditions governing the use of the LUVMEE mobile application and web celebration experiences.'
};

export default function TermsOfServicePage() {
  const lastUpdated = 'October 15, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-luvmee-ivory via-luvmee-blush/30 to-luvmee-ivory text-luvmee-burgundy">
      <LegalNav title="Terms of Service" />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full leading-relaxed">
        {/* Title Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-luvmee-rose/25 text-luvmee-rose text-xs font-bold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>User Agreement</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luvmee-burgundy tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-luvmee-muted mt-2">
            Effective Date: {lastUpdated} • Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8 p-5 bg-white/80 rounded-2xl border border-luvmee-rose/20 shadow-sm">
          <h2 className="font-serif font-bold text-lg text-luvmee-burgundy mb-2">
            1. Acceptance of Terms
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft mb-3">
            By downloading, accessing, or using the <strong>LUVMEE</strong> mobile application or visiting our recipient web player at <strong>https://luvmee.eventsslot.com</strong>, you agree to be bound by these Terms of Service and our{' '}
            <Link href="/privacy" className="text-luvmee-rose underline font-semibold">
              Privacy Policy
            </Link>
            . If you do not agree to these terms, you should discontinue using LUVMEE.
          </p>
          <p className="text-xs text-luvmee-muted italic border-t border-luvmee-rose/15 pt-3">
            Note on Developer Entity: LUVMEE is operated by the LUVMEE development team. Official registered business entities and governing law jurisdictions are subject to final founder registration prior to store launch.
          </p>
        </section>

        {/* Purpose & Eligibility */}
        <section className="mb-8 space-y-3">
          <h2 className="font-serif font-bold text-xl text-luvmee-burgundy">
            2. Purpose of the Service & Eligibility
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft">
            LUVMEE is a relationship celebration platform built to help individuals remember birthdays and anniversaries, send private love notes, and create digital greeting cards.
          </p>
          <p className="text-sm text-luvmee-burgundy-soft">
            You must be at least 13 years of age (or 16 where required by local law) to create an account on LUVMEE. By creating an account, you affirm that you meet this age threshold.
          </p>
        </section>

        {/* Acceptable Use */}
        <section className="mb-8 p-5 bg-white/80 rounded-2xl border border-luvmee-rose/20">
          <h2 className="font-serif font-bold text-lg text-luvmee-burgundy mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-luvmee-rose" />
            <span>3. Acceptable Use & Conduct</span>
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft mb-3">
            LUVMEE is dedicated to fostering genuine affection, joy, and healthy relationships. You agree not to use LUVMEE for any abusive, harmful, or unlawful purpose, including:
          </p>
          <ul className="text-xs text-luvmee-burgundy-soft space-y-2 list-disc list-inside">
            <li>Harassing, stalking, threatening, or impersonating another person.</li>
            <li>Sending unsolicited or non-consensual partner pairing requests.</li>
            <li>Uploading or transmitting unlawful, obscene, defamatory, or abusive content in greeting cards, love notes, or personal plans.</li>
            <li>Attempting to probe, scan, or breach the security of our application, Supabase database, or API infrastructure.</li>
            <li>Using automated scripts, bots, or scrapers to access the platform.</li>
          </ul>
        </section>

        {/* User Content & Sharing */}
        <section className="mb-8 space-y-3">
          <h2 className="font-serif font-bold text-xl text-luvmee-burgundy">
            4. User-Generated Content & Sharing Choices
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft">
            You retain ownership of the text, messages, dates, and names you enter into LUVMEE. You grant us only the limited, non-exclusive license necessary to store, display, and transmit this content to deliver the requested service (e.g. rendering your love note to your partner or displaying your greeting card to its recipient).
          </p>
          <div className="p-4 bg-white/90 rounded-xl border border-luvmee-rose/15 text-xs text-luvmee-burgundy-soft space-y-2">
            <p>
              <strong>Public Cards:</strong> If you select &quot;Public&quot; sharing for a greeting card, you understand that anyone who receives or accesses that URL slug will be able to view the card contents without logging in.
            </p>
            <p>
              <strong>Partner Content:</strong> Love Notes and partner-exclusive surprises are restricted to your authenticated partnership and are not shared with the general public.
            </p>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-8 space-y-3">
          <h2 className="font-serif font-bold text-xl text-luvmee-burgundy">
            5. Intellectual Property
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft">
            The LUVMEE brand name, logos, original greeting card template designs, interactive escaping-button animations, software code, and user interface styling are protected by copyright, trademark, and intellectual property laws. You may not copy, reverse-engineer, or redistribute any part of our platform without prior written consent.
          </p>
        </section>

        {/* Service Availability & Disclaimers */}
        <section className="mb-8 p-5 bg-white/80 rounded-2xl border border-luvmee-rose/20 text-xs text-luvmee-burgundy-soft space-y-2.5">
          <h2 className="font-serif font-bold text-base text-luvmee-burgundy">
            6. Service Availability & Disclaimers
          </h2>
          <p>
            LUVMEE is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. While we strive to maintain dependable service and timely push notification delivery, we do not warrant that the application will be completely error-free or that notifications will never be delayed by cellular carrier or operating system battery-saver policies.
          </p>
          <p>
            To the maximum extent permitted by applicable law, LUVMEE and its developers disclaim all warranties, express or implied, including warranties of merchantability and fitness for a particular purpose.
          </p>
        </section>

        {/* Account Termination */}
        <section className="mb-8 space-y-3">
          <h2 className="font-serif font-bold text-xl text-luvmee-burgundy">
            7. Termination & Account Deletion
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft">
            You may terminate your agreement with us at any time by deleting your account via the mobile app or through our{' '}
            <Link href="/delete-account" className="text-luvmee-rose underline font-semibold">
              Account Deletion Page
            </Link>
            . We reserve the right to suspend or terminate accounts that violate these Terms of Service.
          </p>
        </section>

        {/* Contact Us */}
        <section className="p-5 bg-white/80 rounded-2xl border border-luvmee-rose/20 text-center sm:text-left">
          <h2 className="font-serif font-bold text-lg text-luvmee-burgundy mb-2">
            8. Contact & Legal Inquiries
          </h2>
          <p className="text-xs text-luvmee-burgundy-soft mb-2">
            For questions regarding these Terms of Service, please visit our{' '}
            <Link href="/support" className="text-luvmee-rose underline font-semibold">
              Support Center
            </Link>{' '}
            or write to <span className="font-semibold text-luvmee-burgundy">support@eventsslot.com</span>.
          </p>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}

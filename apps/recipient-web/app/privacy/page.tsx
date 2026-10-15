import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Heart, Users, Calendar, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import { LegalNav } from '../../components/LegalNav';
import { LegalFooter } from '../../components/LegalFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy | LUVMEE',
  description: 'Understand how LUVMEE collects, protects, and handles your relationship data, private love notes, and celebrations.'
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 15, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-luvmee-ivory via-luvmee-blush/30 to-luvmee-ivory text-luvmee-burgundy">
      <LegalNav title="Privacy Policy" />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full leading-relaxed">
        {/* Title Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-luvmee-rose/25 text-luvmee-rose text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Policy</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luvmee-burgundy tracking-tight">
            LUVMEE Privacy Policy
          </h1>
          <p className="text-xs text-luvmee-muted mt-2">
            Effective Date: {lastUpdated} • Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8 p-5 bg-white/80 rounded-2xl border border-luvmee-rose/20 shadow-sm">
          <h2 className="font-serif font-bold text-lg text-luvmee-burgundy mb-2">
            1. Overview & Core Philosophy
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft mb-3">
            LUVMEE (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is a mobile relationship and celebration platform designed to help people remember important dates, celebrate loved ones, exchange daily love notes, and plan meaningful shared moments.
          </p>
          <p className="text-sm text-luvmee-burgundy-soft mb-3">
            Your relationships are intimate and deeply personal. We believe your data should be treated with the highest degree of respect, transparency, and architectural security. We do not sell your personal data, we do not rent contact lists, and we do not serve behavioral third-party advertisements.
          </p>
          <p className="text-xs text-luvmee-muted italic border-t border-luvmee-rose/15 pt-3">
            Responsible Developer Entity: <strong>LUVMEE Platform</strong> (Official developer details and registered legal representative are subject to final founder registration in the Google Play Console).
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-8 space-y-4">
          <h2 className="font-serif font-bold text-xl text-luvmee-burgundy">
            2. Information We Collect & How We Obtain It
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft">
            We only collect data necessary to provide the features you actively use in the application. Our processing includes the following categories:
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-4 bg-white/90 rounded-xl border border-luvmee-rose/15">
              <div className="flex items-center gap-2 font-bold text-sm text-luvmee-burgundy mb-1">
                <Users className="w-4 h-4 text-luvmee-rose" />
                <span>Account & Authentication</span>
              </div>
              <p className="text-xs text-luvmee-burgundy-soft">
                Email address, hashed password (managed securely via Supabase Auth), 6-digit verification one-time passwords (OTP), chosen username, and authentication identifier (UUID). Optional Google sign-in receives basic public profile details.
              </p>
            </div>

            <div className="p-4 bg-white/90 rounded-xl border border-luvmee-rose/15">
              <div className="flex items-center gap-2 font-bold text-sm text-luvmee-burgundy mb-1">
                <Heart className="w-4 h-4 text-luvmee-rose" />
                <span>Partner Connection</span>
              </div>
              <p className="text-xs text-luvmee-burgundy-soft">
                6-character alphanumeric pairing codes (e.g. <code>LUV-XXXX</code>), partnership status records, connection timestamps, and partner identifiers.
              </p>
            </div>

            <div className="p-4 bg-white/90 rounded-xl border border-luvmee-rose/15">
              <div className="flex items-center gap-2 font-bold text-sm text-luvmee-burgundy mb-1">
                <Calendar className="w-4 h-4 text-luvmee-rose" />
                <span>People & Important Dates</span>
              </div>
              <p className="text-xs text-luvmee-burgundy-soft">
                Contact names, relationship tags, personal notes, birthdays, anniversaries, and custom celebration dates (month and day). These directory entries are private to your account and do not require the contact to have an account.
              </p>
            </div>

            <div className="p-4 bg-white/90 rounded-xl border border-luvmee-rose/15">
              <div className="flex items-center gap-2 font-bold text-sm text-luvmee-burgundy mb-1">
                <Sparkles className="w-4 h-4 text-luvmee-rose" />
                <span>Love Notes & Shared Plans</span>
              </div>
              <p className="text-xs text-luvmee-burgundy-soft">
                Private chat messages sent between you and your connected partner, responses to daily Love Sparks prompts, and personal date ideas, places to visit, or gift wishlists.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-xl border border-luvmee-rose/15 mt-3">
            <h3 className="font-bold text-sm text-luvmee-burgundy mb-1">
              Device Tokens & Notification Preferences
            </h3>
            <p className="text-xs text-luvmee-burgundy-soft">
              If you grant notification permissions, we store an Expo Push Token associated with your device to dispatch scheduled anniversary reminders and notifications when your partner sends you a Love Note. We do not collect your GPS location or device hardware serial numbers.
            </p>
          </div>
        </section>

        {/* Public vs Private Content */}
        <section className="mb-8 p-5 bg-white/80 rounded-2xl border border-luvmee-rose/20">
          <h2 className="font-serif font-bold text-lg text-luvmee-burgundy mb-2">
            3. Public Greeting Cards vs. Private Partner Experiences
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft mb-3">
            LUVMEE provides two distinct categories of sharing:
          </p>
          <ul className="text-xs text-luvmee-burgundy-soft space-y-2 list-disc list-inside">
            <li>
              <strong>Public Greeting Cards (Digital Surprises):</strong> When you create and publish a surprise card with sharing mode set to &quot;Public&quot;, a unique web URL slug (e.g. <code>https://luvmee.eventsslot.com/e/your-card</code>) is generated. Anyone with this specific link can view the card in a web browser without creating an account.
            </li>
            <li>
              <strong>Partner-Exclusive Experiences:</strong> When marked as &quot;Partner Exclusive&quot;, the experience is protected by database security policies. Web visitors without an authorized session see only a branded handoff screen prompting them to open the native LUVMEE app.
            </li>
            <li>
              <strong>Love Notes:</strong> Love Notes are strictly private between two mutually paired partners and are never exposed publicly on the web.
            </li>
          </ul>
        </section>

        {/* Data Processors */}
        <section className="mb-8">
          <h2 className="font-serif font-bold text-xl text-luvmee-burgundy mb-3">
            4. Third-Party Service Providers & Infrastructure
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft mb-4">
            We work with established cloud infrastructure providers to run LUVMEE. Data is transmitted securely and handled solely for the operational purposes described below:
          </p>

          <div className="space-y-3 text-xs text-luvmee-burgundy-soft">
            <div className="p-3 bg-white/90 rounded-lg border border-luvmee-rose/15">
              <strong>Supabase Inc. (Backend Database & Authentication):</strong> Hosts our PostgreSQL database, handles user authentication, session tokens, and executes serverless edge functions for account deletion and push dispatch.
            </div>
            <div className="p-3 bg-white/90 rounded-lg border border-luvmee-rose/15">
              <strong>Vercel Inc. (Web Hosting):</strong> Hosts the recipient web application for greeting card viewing and public legal/support resources.
            </div>
            <div className="p-3 bg-white/90 rounded-lg border border-luvmee-rose/15">
              <strong>Expo / 650 Industries Inc. (Push Gateway & App Builds):</strong> Powers push notification routing via the Expo Push API and builds application binaries.
            </div>
            <div className="p-3 bg-white/90 rounded-lg border border-luvmee-rose/15">
              <strong>Google LLC (Google Play Store & Google Identity):</strong> Distributes the Android application and facilitates optional Google OAuth sign-in.
            </div>
          </div>
        </section>

        {/* Technical Protections */}
        <section className="mb-8 p-5 bg-white/80 rounded-2xl border border-luvmee-rose/20">
          <h2 className="font-serif font-bold text-lg text-luvmee-burgundy mb-2">
            5. Security & Technical Safeguards
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft mb-3">
            We implement multi-layered engineering safeguards to protect your personal information:
          </p>
          <ul className="text-xs text-luvmee-burgundy-soft space-y-2 list-disc list-inside">
            <li><strong>Encryption in Transit:</strong> All communications between mobile clients, web browsers, and cloud APIs are encrypted via TLS/HTTPS.</li>
            <li><strong>Row Level Security (RLS):</strong> Every database table enforces PostgreSQL Row Level Security policies, ensuring users can only read and write records they explicitly own or share with a mutually confirmed partner.</li>
            <li><strong>Privacy-Conscious Push Notifications:</strong> Outbound push notification payloads contain non-sensitive teaser copy (e.g. &quot;Your partner sent you a Love Note 💕&quot;) rather than exposing sensitive private message contents on lock screens.</li>
            <li><strong>Partitioned Local Storage:</strong> Client-side offline caches are partitioned by user ID and evicted immediately when you sign out.</li>
          </ul>
        </section>

        {/* Data Retention & Account Deletion */}
        <section className="mb-8">
          <h2 className="font-serif font-bold text-xl text-luvmee-burgundy mb-3">
            6. Data Retention & Account Deletion
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft mb-3">
            You maintain full ownership of your data. We retain information only for as long as your account remains active.
          </p>
          <div className="p-4 bg-white/90 rounded-xl border border-rose-200 mb-4">
            <h3 className="font-bold text-sm text-luvmee-burgundy flex items-center gap-1.5 mb-1">
              <Trash2 className="w-4 h-4 text-luvmee-rose" />
              <span>How to Delete Your Account & All Associated Data</span>
            </h3>
            <p className="text-xs text-luvmee-burgundy-soft mb-2">
              <strong>In-App Deletion (Instant):</strong> In the LUVMEE app, navigate to <em>Profile → Preferences & Account → Permanently Delete Account</em>. Confirming this action immediately runs a database cascade that permanently removes your profile, contacts, dates, reminders, personal plans, love notes, partnerships, and device tokens.
            </p>
            <p className="text-xs text-luvmee-burgundy-soft">
              <strong>External Web Deletion:</strong> If you no longer have access to the app, you can submit a deletion request via our public <Link href="/delete-account" className="text-luvmee-rose font-semibold underline">Account Deletion Page</Link>.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-8">
          <h2 className="font-serif font-bold text-lg text-luvmee-burgundy mb-2">
            7. Children&apos;s Privacy
          </h2>
          <p className="text-xs text-luvmee-burgundy-soft">
            LUVMEE is designed for romantic partners, couples, and adult relationships. We do not knowingly collect or solicit personal data from children under the age of 13 (or under 16 in applicable jurisdictions). If we become aware that a child under this age has registered an account, we will immediately delete that account and associated data.
          </p>
        </section>

        {/* Contact Us */}
        <section className="p-5 bg-white/80 rounded-2xl border border-luvmee-rose/20 text-center sm:text-left">
          <h2 className="font-serif font-bold text-lg text-luvmee-burgundy mb-2">
            8. Questions & Privacy Inquiries
          </h2>
          <p className="text-xs text-luvmee-burgundy-soft mb-3">
            If you have questions about this policy or wish to exercise your data rights, please contact our team:
          </p>
          <div className="text-xs font-semibold text-luvmee-burgundy space-y-1">
            <p>Support & Privacy Portal: <Link href="/support" className="text-luvmee-rose underline">luvmee.eventsslot.com/support</Link></p>
            <p>Email: <span className="text-luvmee-rose">support@eventsslot.com</span></p>
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}

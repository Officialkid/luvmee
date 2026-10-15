import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Trash2, Smartphone, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Mail } from 'lucide-react';
import { LegalNav } from '../../components/LegalNav';
import { LegalFooter } from '../../components/LegalFooter';
import { DeleteAccountForm } from './DeleteAccountForm';

export const metadata: Metadata = {
  title: 'Delete Account & Data | LUVMEE',
  description: 'Learn how to permanently delete your LUVMEE account, love notes, contacts, and personal data.'
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-luvmee-ivory via-luvmee-blush/30 to-luvmee-ivory text-luvmee-burgundy">
      <LegalNav title="Account Deletion" />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full leading-relaxed">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Data Rights & Deletion</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luvmee-burgundy tracking-tight">
            Delete Your LUVMEE Account & Data
          </h1>
          <p className="text-xs text-luvmee-muted mt-2">
            In compliance with Google Play Developer Policies and global data privacy standards.
          </p>
        </div>

        {/* Option 1: In-App (Instant) */}
        <section className="mb-8 p-6 bg-white/95 rounded-2xl border-2 border-luvmee-rose/30 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] uppercase tracking-wide">
              Fastest • Instant
            </span>
            <h2 className="font-serif font-bold text-xl text-luvmee-burgundy">
              Method 1: Direct In-App Deletion
            </h2>
          </div>
          <p className="text-sm text-luvmee-burgundy-soft mb-4">
            If you have the LUVMEE application installed on your Android device, you can permanently delete your account and all associated records immediately without waiting:
          </p>

          <ol className="text-xs text-luvmee-burgundy-soft space-y-2.5 bg-rose-50/50 p-4 rounded-xl border border-luvmee-rose/20 mb-4 list-decimal list-inside">
            <li>Open the <strong>LUVMEE</strong> app on your device.</li>
            <li>Tap on the <strong>Profile</strong> tab in the bottom navigation bar.</li>
            <li>Scroll down to the <strong>Preferences & Account</strong> section.</li>
            <li>Tap <strong>Permanently Delete Account</strong> (marked in red).</li>
            <li>Confirm the prompt. Your account and all stored records are instantly and irreversibly deleted.</li>
          </ol>

          <p className="text-[11px] text-luvmee-muted italic">
            Note: Deleting your account in-app executes a direct database cascade RPC that removes all records in real time and purges offline caches.
          </p>
        </section>

        {/* Option 2: Web Deletion Request */}
        <section className="mb-8 p-6 bg-white/95 rounded-2xl border border-luvmee-rose/25 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] uppercase tracking-wide">
              Web Request
            </span>
            <h2 className="font-serif font-bold text-xl text-luvmee-burgundy">
              Method 2: External Account Deletion Request
            </h2>
          </div>
          <p className="text-sm text-luvmee-burgundy-soft mb-4">
            If you have uninstalled the app or no longer have access to your mobile device, submit your registered email address below. For security, an email verification link will be sent to confirm your identity before data deletion is processed.
          </p>

          <DeleteAccountForm />
        </section>

        {/* Exact Categories Deleted */}
        <section className="mb-8 space-y-4">
          <h2 className="font-serif font-bold text-xl text-luvmee-burgundy">
            What Data Is Deleted?
          </h2>
          <p className="text-sm text-luvmee-burgundy-soft">
            When your account is deleted, the following data categories are permanently removed:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 text-xs text-luvmee-burgundy-soft">
            <div className="p-3.5 bg-white/90 rounded-xl border border-rose-100">
              <strong className="block text-luvmee-burgundy mb-1">✓ Profile & Authentication</strong>
              Your email address, authentication credentials, username, and user profile record.
            </div>

            <div className="p-3.5 bg-white/90 rounded-xl border border-rose-100">
              <strong className="block text-luvmee-burgundy mb-1">✓ People & Celebration Dates</strong>
              All contacts in your personal directory, birthdays, anniversaries, and custom celebration dates.
            </div>

            <div className="p-3.5 bg-white/90 rounded-xl border border-rose-100">
              <strong className="block text-luvmee-burgundy mb-1">✓ Scheduled Reminders</strong>
              All scheduled notification triggers and queued reminders.
            </div>

            <div className="p-3.5 bg-white/90 rounded-xl border border-rose-100">
              <strong className="block text-luvmee-burgundy mb-1">✓ Personal Plans & Wishlists</strong>
              All saved date ideas, places to visit, custom notes, and gift wishlists.
            </div>

            <div className="p-3.5 bg-white/90 rounded-xl border border-rose-100">
              <strong className="block text-luvmee-burgundy mb-1">✓ Love Notes & Partnerships</strong>
              All love notes authored by you. Your partner connection is severed and your partner&apos;s status reverts to unconnected.
            </div>

            <div className="p-3.5 bg-white/90 rounded-xl border border-rose-100">
              <strong className="block text-luvmee-burgundy mb-1">✓ Push Notification Tokens</strong>
              All device push tokens associated with your account are immediately invalidated and purged.
            </div>
          </div>
        </section>

        {/* Exceptions & Retention */}
        <section className="mb-8 p-5 bg-white/80 rounded-2xl border border-luvmee-rose/20 text-xs text-luvmee-burgundy-soft">
          <h2 className="font-serif font-bold text-sm text-luvmee-burgundy mb-2">
            Data Retention Periods & Exceptions
          </h2>
          <p className="mb-2">
            - <strong>In-App Deletion:</strong> Executed immediately. No recovery period is provided; once confirmed, data cannot be restored.
          </p>
          <p className="mb-2">
            - <strong>Web Requests:</strong> External deletion requests are verified and processed within 7 business days following email confirmation.
          </p>
          <p>
            - <strong>Exceptions:</strong> We do not retain backup archives of your personal notes or contacts after deletion, except to the extent strictly required by applicable law or to defend against fraud.
          </p>
        </section>

        {/* Contact info */}
        <div className="text-center text-xs text-luvmee-muted">
          Need assistance with your account? Visit our{' '}
          <Link href="/support" className="text-luvmee-rose underline font-semibold">
            Support Portal
          </Link>{' '}
          or email <span className="font-semibold text-luvmee-burgundy">support@eventsslot.com</span>.
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}

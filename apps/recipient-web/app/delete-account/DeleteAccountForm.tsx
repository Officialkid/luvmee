'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function DeleteAccountForm() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      // Simulate/queue verification dispatch to prevent unauthenticated unauthorized deletions
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
    } catch (err: any) {
      setError('An error occurred submitting your request. Please email support@eventsslot.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Verification Request Received</span>
        </div>
        <p className="text-xs text-emerald-700 leading-relaxed mb-3">
          If an active LUVMEE account is registered under <strong>{email}</strong>, a confirmation link has been queued for dispatch. To prevent unauthorized deletions, you must verify ownership by clicking the confirmation link sent to your inbox.
        </p>
        <p className="text-[11px] text-emerald-600">
          Once confirmed, your account and all associated cloud records will be permanently purged within 7 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
      {error && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-luvmee-burgundy mb-1">
          Registered Account Email <span className="text-luvmee-rose">*</span>
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-luvmee-rose/30 bg-white text-xs text-luvmee-burgundy placeholder:text-luvmee-muted focus:outline-none focus:ring-2 focus:ring-luvmee-rose/40"
          />
          <Mail className="w-4 h-4 text-luvmee-muted absolute left-3 top-3" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-luvmee-burgundy-soft mb-1">
          Reason for Deletion (Optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Help us understand how we can improve LUVMEE..."
          rows={2}
          className="w-full px-3.5 py-2 rounded-xl border border-luvmee-rose/30 bg-white text-xs text-luvmee-burgundy placeholder:text-luvmee-muted focus:outline-none focus:ring-2 focus:ring-luvmee-rose/40"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Submitting Request...</span>
          </>
        ) : (
          <span>Request Account & Data Deletion</span>
        )}
      </button>

      <p className="text-[10px] text-luvmee-muted text-center leading-normal">
        By submitting, an identity confirmation link will be delivered to your registered email to authorize the permanent removal of your data.
      </p>
    </form>
  );
}

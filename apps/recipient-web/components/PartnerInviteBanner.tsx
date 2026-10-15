'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Heart, Copy, Check, Smartphone, Download, ExternalLink } from 'lucide-react';

interface PartnerInviteBannerProps {
  initialCode?: string;
}

export function PartnerInviteBanner({ initialCode }: PartnerInviteBannerProps) {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string | null>(initialCode || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const paramCode = searchParams.get('code') || searchParams.get('partner_code');
    if (paramCode) {
      setCode(paramCode);
    }
  }, [searchParams]);

  const apkDownloadUrl =
    'https://expo.dev/accounts/dan.mwaili/projects/luvmee/builds/8a24c374-7809-4544-9153-3164deaf71a0';

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!code) {
    return (
      <div className="my-6 p-5 bg-white/90 rounded-2xl border border-luvmee-rose/20 shadow-sm text-center">
        <div className="inline-flex items-center gap-2 text-luvmee-rose font-semibold text-xs uppercase tracking-wider mb-2">
          <Smartphone className="w-4 h-4" />
          <span>LUVMEE Mobile App</span>
        </div>
        <h3 className="font-serif font-bold text-lg text-luvmee-burgundy mb-2">
          Experience LUVMEE on Your Phone
        </h3>
        <p className="text-xs text-luvmee-burgundy-soft max-w-sm mx-auto mb-4 leading-relaxed">
          Daily love notes, anniversary reminders, partner pairing, and personalized romantic plans.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={apkDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-luvmee-burgundy text-white font-semibold text-xs shadow-md hover:bg-luvmee-burgundy/90 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Android App (APK)</span>
          </a>
          <span className="text-[11px] font-medium text-luvmee-muted">
            Google Play Store release coming soon
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 p-6 bg-white/95 rounded-2xl border-2 border-luvmee-rose/35 shadow-xl text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
        💖
      </div>

      <span className="inline-block text-[11px] uppercase font-bold tracking-wider text-luvmee-rose bg-rose-50 px-3 py-1 rounded-full border border-luvmee-rose/20 mb-2">
        Partner Connection Invite
      </span>

      <h2 className="text-xl font-bold font-serif text-luvmee-burgundy tracking-tight">
        Connect with your partner on LUVMEE
      </h2>

      <p className="text-xs text-luvmee-burgundy-soft mt-1.5 max-w-sm mx-auto leading-relaxed">
        Your partner invited you to share real-time Love Notes, celebrate special dates, and build your shared love story.
      </p>

      {/* Code Display Box */}
      <div className="my-5 p-3.5 bg-rose-50/90 rounded-xl border border-dashed border-luvmee-rose/40 flex items-center justify-between max-w-xs mx-auto">
        <div className="text-left">
          <span className="block text-[10px] text-luvmee-muted uppercase font-bold tracking-wider">
            Your Partner Code
          </span>
          <span className="font-mono font-bold text-lg text-luvmee-rose tracking-wider">
            {code}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-luvmee-rose/30 text-xs font-semibold text-luvmee-burgundy hover:bg-rose-50 active:scale-95 transition-all shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-luvmee-rose" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5 max-w-sm mx-auto">
        {/* Open in App (for users who already have it) */}
        <a
          href={`luvmee://connect?code=${code}`}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-luvmee-burgundy text-white font-bold text-sm shadow hover:bg-luvmee-burgundy/90 transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          <span>Already have LUVMEE? Open App</span>
        </a>

        {/* Download Standalone APK */}
        <a
          href={apkDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-luvmee-rose to-rose-600 text-white font-bold text-sm shadow-md shadow-luvmee-rose/25 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download App (Android APK)</span>
        </a>
      </div>

      {/* Step by step guide */}
      <div className="mt-5 pt-4 border-t border-luvmee-rose/15 text-left text-xs text-luvmee-burgundy-soft space-y-1.5 max-w-sm mx-auto">
        <div className="font-bold text-luvmee-burgundy text-[11px] uppercase tracking-wider mb-1">
          How to connect:
        </div>
        <p className="flex items-start gap-2">
          <span className="font-bold text-luvmee-rose">1.</span>
          <span>Download and install the LUVMEE app on your phone.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="font-bold text-luvmee-rose">2.</span>
          <span>Sign up with your email or Google account.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="font-bold text-luvmee-rose">3.</span>
          <span>
            Tap <strong>Connect Partner</strong> and enter code{' '}
            <strong className="font-mono text-luvmee-rose">{code}</strong>!
          </span>
        </p>
      </div>
    </div>
  );
}

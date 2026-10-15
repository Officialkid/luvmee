import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Mail, Heart, Calendar, MessageSquare, Gift, Bookmark, Shield, KeyRound, Sparkles } from 'lucide-react';
import { LegalNav } from '../../components/LegalNav';
import { LegalFooter } from '../../components/LegalFooter';

export const metadata: Metadata = {
  title: 'Help & Support | LUVMEE',
  description: 'Guides, FAQs, and support for the LUVMEE mobile application, partner pairing, love notes, and celebration calendar.'
};

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-luvmee-ivory via-luvmee-blush/30 to-luvmee-ivory text-luvmee-burgundy">
      <LegalNav title="Help & Support" />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full leading-relaxed">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-luvmee-rose/25 text-luvmee-rose text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luvmee-burgundy tracking-tight">
            LUVMEE Support & Guides
          </h1>
          <p className="text-xs text-luvmee-muted mt-2">
            Everything you need to know about setting up your account, connecting with your partner, and celebrating special moments.
          </p>
        </div>

        {/* Feature Guides */}
        <div className="space-y-6 mb-12">
          {/* Guide 1: Auth & Account */}
          <div className="p-5 bg-white/90 rounded-2xl border border-luvmee-rose/20 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-luvmee-burgundy flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-luvmee-rose" />
              <span>1. Account Registration & Sign-In</span>
            </h2>
            <div className="text-xs text-luvmee-burgundy-soft space-y-2">
              <p>
                <strong>Email Sign-Up:</strong> Enter your email, create an 8+ character password, and choose a unique username. A 6-digit confirmation code will be sent to your inbox. Enter this code to verify your account.
              </p>
              <p>
                <strong>Google Sign-In:</strong> Tap &quot;Continue with Google&quot; on the sign-in screen to authenticate directly with your Google account.
              </p>
              <p>
                <strong>Password Reset:</strong> If you forgot your password, tap &quot;Continue with Email&quot; → &quot;Log In&quot; → &quot;Forgot password?&quot; to receive a password reset link.
              </p>
            </div>
          </div>

          {/* Guide 2: Partner Connection */}
          <div className="p-5 bg-white/90 rounded-2xl border border-luvmee-rose/20 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-luvmee-burgundy flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-luvmee-rose" />
              <span>2. Connecting With Your Partner</span>
            </h2>
            <div className="text-xs text-luvmee-burgundy-soft space-y-2">
              <p>
                <strong>Finding Your Partner Code:</strong> Open the app and navigate to your <strong>Profile</strong> tab or tap <strong>Connect Partner</strong> on the Home screen. Your unique 6-character partner code (e.g. <code>LUV-XXXX</code>) is displayed at the top.
              </p>
              <p>
                <strong>Sending an Invite:</strong> Tap &quot;Share My Partner Code&quot; to send an invite message via WhatsApp, SMS, or copy the link directly to your partner.
              </p>
              <p>
                <strong>Pairing:</strong> Your partner opens LUVMEE, taps <strong>Connect Partner</strong>, enters your code, and taps <strong>Send Connection Request</strong>. As soon as accepted, both phones link immediately!
              </p>
            </div>
          </div>

          {/* Guide 3: Love Notes & Sparks */}
          <div className="p-5 bg-white/90 rounded-2xl border border-luvmee-rose/20 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-luvmee-burgundy flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-luvmee-rose" />
              <span>3. Love Notes & Daily Sparks</span>
            </h2>
            <div className="text-xs text-luvmee-burgundy-soft space-y-2">
              <p>
                Once connected, navigate to the <strong>Messages</strong> tab to exchange private, chronological Love Notes in real time.
              </p>
              <p>
                <strong>Daily Sparks:</strong> Explore curated daily question prompts to spark meaningful conversations and discover new things about each other.
              </p>
            </div>
          </div>

          {/* Guide 4: People Directory & Calendar */}
          <div className="p-5 bg-white/90 rounded-2xl border border-luvmee-rose/20 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-luvmee-burgundy flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-luvmee-rose" />
              <span>4. People Directory & Celebration Calendar</span>
            </h2>
            <div className="text-xs text-luvmee-burgundy-soft space-y-2">
              <p>
                <strong>Adding Contacts:</strong> Under the <strong>People</strong> tab, add family, friends, or coworkers with their relationship tags (Partner, Family, Friend, Mentor). Contacts do not need to have an account.
              </p>
              <p>
                <strong>Annual Recurrence:</strong> Save birthdays and anniversaries by month and day (birth year is optional). Our engine automatically tracks countdowns and handles leap year February 29th roll-overs.
              </p>
              <p>
                <strong>Celebration Calendar:</strong> Under the <strong>Calendar</strong> tab, browse your visual monthly grid to see upcoming occasions and tap on dates to see celebration reminders.
              </p>
            </div>
          </div>

          {/* Guide 5: Personal Plans & Wishlists */}
          <div className="p-5 bg-white/90 rounded-2xl border border-luvmee-rose/20 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-luvmee-burgundy flex items-center gap-2 mb-2">
              <Bookmark className="w-4 h-4 text-luvmee-rose" />
              <span>5. Personal Plans & Gift Wishlists</span>
            </h2>
            <div className="text-xs text-luvmee-burgundy-soft space-y-2">
              <p>
                Under <strong>Profile → Personal Plans & Wishlist</strong> (or from the Home screen banner), save romantic date ideas, restaurants to try, places to travel, and gift ideas.
              </p>
              <p>
                You can assign target dates, edit plans anytime, or mark them as completed once enjoyed.
              </p>
            </div>
          </div>

          {/* Guide 6: Account Deletion */}
          <div className="p-5 bg-white/90 rounded-2xl border border-rose-200 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-luvmee-burgundy flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-luvmee-rose" />
              <span>6. Account & Data Deletion</span>
            </h2>
            <div className="text-xs text-luvmee-burgundy-soft space-y-2">
              <p>
                To permanently delete your account, open the app, go to <strong>Profile → Preferences & Account → Permanently Delete Account</strong>.
              </p>
              <p>
                If you no longer have access to the app, you can submit an external deletion request through our{' '}
                <Link href="/delete-account" className="text-luvmee-rose underline font-semibold">
                  Account Deletion Page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Contact Developer Section */}
        <section className="p-6 bg-white/95 rounded-2xl border-2 border-luvmee-rose/30 shadow-md text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3 text-2xl">
            💌
          </div>
          <h2 className="font-serif font-bold text-xl text-luvmee-burgundy mb-2">
            Need Direct Support?
          </h2>
          <p className="text-xs text-luvmee-burgundy-soft max-w-md mx-auto mb-4 leading-relaxed">
            Have questions, feedback, or need help troubleshooting? Contact our team directly and we will respond as promptly as possible.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-50 border border-luvmee-rose/30 text-xs font-bold text-luvmee-burgundy">
            <Mail className="w-4 h-4 text-luvmee-rose" />
            <span>support@eventsslot.com</span>
          </div>
          <p className="text-[10px] text-luvmee-muted mt-3">
            Developer support email is monitored during business days. For urgent account issues, include your registered account email.
          </p>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}

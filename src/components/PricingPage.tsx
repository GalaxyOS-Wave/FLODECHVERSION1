/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Building2, Music, GraduationCap, Users, ShieldCheck, Zap } from 'lucide-react';

interface PricingPageProps {
  onSubscribe: () => void;
  isLoading?: boolean;
  isLoggedIn?: boolean;
  academyName?: string;
  isDashboardView?: boolean;
}

export default function PricingPage({ 
  onSubscribe, 
  isLoading = false,
  isLoggedIn = false,
  academyName = '',
  isDashboardView = false
}: PricingPageProps) {
  const planFeatures = [
    { text: "Unlimited Students Enrollment", desc: "No caps or extra fees for growing your student rosters.", icon: <Users className="w-4 h-4 text-orange-500" /> },
    { text: "Coaching & Tuition Academy Support", desc: "Schedules, assignment boards, homework grading, and private progress books.", icon: <GraduationCap className="w-4 h-4 text-orange-500" /> },
    { text: "Music Studio & Instrumental Support", desc: "Specialized student portfolios, gallery uploads, and resource libraries.", icon: <Music className="w-4 h-4 text-orange-500" /> },
    { text: "Dance Academy & Movement Support", desc: "Visual batch tracking, timetables, notifications, parent loops, and announcements.", icon: <Building2 className="w-4 h-4 text-orange-500" /> },
    { text: "Automated Student Portfolios", desc: "Each student gets a personal, high-quality public profile showcasing progress.", icon: <Sparkles className="w-4 h-4 text-orange-500" /> },
    { text: "Live Public Academy Website", desc: "A customizable digital showcase of your academy with zero coding needed.", icon: <Zap className="w-4 h-4 text-orange-500" /> }
  ];

  return (
    <div className={`w-full ${isDashboardView ? 'py-8 bg-slate-950 text-white min-h-[calc(100vh-4rem)] flex items-center justify-center p-6' : 'py-24 bg-white text-slate-900 border-t border-slate-100'}`} id="pricing">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
        
        {/* Header Elements */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">
            <Zap className="w-3 h-3 animate-pulse" /> Pricing & Access
          </span>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${isDashboardView ? 'text-white' : 'text-slate-950'}`}>
            Simple, Transparent Subscription
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed ${isDashboardView ? 'text-slate-400' : 'text-slate-600'}`}>
            {isDashboardView 
              ? `Elevate your academy ${academyName ? `"${academyName}"` : ''} to premium status to resume complete administrative controls.`
              : "Unlock full power, unlimited administrative portals, student galleries, automatic websites, and secure logs with one honest monthly plan."
            }
          </p>
        </div>

        {/* Pricing Layout Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch w-full max-w-4xl">
          
          {/* Plan Feature Benefits card split */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <h3 className={`text-lg font-extrabold tracking-tight ${isDashboardView ? 'text-slate-200' : 'text-slate-800'}`}>
                What you get with Flodech Pro:
              </h3>
              <div className="space-y-4">
                {planFeatures.map((feat, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className={`w-6 h-6 rounded-lg ${isDashboardView ? 'bg-slate-900' : 'bg-orange-50'} flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}>
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isDashboardView ? 'text-white' : 'text-slate-900'}`}>{feat.text}</h4>
                      <p className={`text-[11px] ${isDashboardView ? 'text-slate-400' : 'text-slate-500'} leading-normal`}>{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDashboardView ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/60'}`}>
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-[11px] leading-relaxed">
                <span className={`font-bold ${isDashboardView ? 'text-slate-200' : 'text-slate-700'}`}>100% Risk Free:</span> Cancel the subscription anytime from the academy dashboard with a single click.
              </div>
            </div>
          </div>

          {/* Actual Price Card visualizer */}
          <div className="md:col-span-1" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`md:col-span-4 p-8 rounded-3xl border-2 flex flex-col justify-between relative shadow-lg ${
              isDashboardView 
                ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-orange-500/80 shadow-orange-500/5' 
                : 'bg-white border-orange-500 shadow-orange-500/10'
            }`}
          >
            {/* Pro badge decorator */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-[10px] uppercase font-extrabold tracking-widest rounded-full shadow-md shadow-orange-500/20">
              PRO ACCESS
            </div>

            <div className="text-center pt-2">
              <h4 className={`text-xs uppercase font-extrabold tracking-wider ${isDashboardView ? 'text-slate-400' : 'text-slate-500'}`}>
                Flodech Pro
              </h4>
              <div className="my-5 flex items-baseline justify-center gap-1.5">
                <span className={`text-4xl sm:text-5xl font-black tracking-tight ${isDashboardView ? 'text-white' : 'text-slate-950'}`}>
                  ₹499
                </span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDashboardView ? 'text-slate-400' : 'text-slate-500 font-mono'}`}>
                  / month
                </span>
              </div>
              <p className={`text-[10px] leading-normal font-sans italic my-4 ${isDashboardView ? 'text-slate-400' : 'text-slate-500'}`}>
                * Auto-renewal enabled. Cancel anytime instantly. No hidden commissions.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200/40 my-6">
              {[
                "Unlimited Class Batches",
                "UPI QR Code Direct Receipts",
                "Advanced PDF Reports",
                "Fully Secure cloud storage"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className={isDashboardView ? 'text-slate-300' : 'text-slate-700'}>{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onSubscribe}
              disabled={isLoading}
              className={`w-full py-4 text-xs font-extrabold uppercase tracking-widest text-white rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20 active:scale-95 duration-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>Opening Checkout...</>
              ) : (
                <>Subscribe Now</>
              )}
            </button>
          </motion.div>
          
        </div>
        
      </div>
    </div>
  );
}

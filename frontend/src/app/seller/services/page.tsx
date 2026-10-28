'use client';

import { Sparkles } from 'lucide-react';

export default function SellerServicesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      <div>
        <h1 className="font-bold text-slate-900 text-2xl sm:text-[26px] tracking-tight">
          Services
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add-on services for your brand. Browse what&apos;s available and reach out to your account manager to get started.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[380px] sm:min-h-[420px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-center text-slate-300 mb-3.5">
          <Sparkles className="w-6 h-6 stroke-[1.5] text-slate-300" />
        </div>
        <h3 className="font-semibold text-slate-800 text-base mb-1.5">
          No services yet
        </h3>
        <p className="text-sm text-slate-400 max-w-[320px] leading-relaxed">
          Check back soon, new add-on services will show up here.
        </p>
      </div>
    </div>
  );
}

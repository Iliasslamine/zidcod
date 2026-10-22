import { Sparkles } from 'lucide-react';

export default function SellerAIStudioPage() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-xl w-full border border-purple-200 shadow-sm rounded-3xl bg-white p-12 text-center flex flex-col items-center">
        
        {/* Icon Box */}
        <div className="w-14 h-14 bg-[#5b21b6] rounded-2xl flex items-center justify-center mb-6 shadow-md">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        
        {/* Upcoming Badge */}
        <div className="bg-amber-100/50 text-amber-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
          Upcoming
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
          AI Studio is on its way
        </h1>
        
        {/* Subtitle */}
        <p className="text-[15px] text-slate-500 leading-relaxed max-w-sm mx-auto">
          Something new is in the works. We'll let you know the moment it's ready.
        </p>

      </div>
    </div>
  );
}

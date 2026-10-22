'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Video, Palette, Mic, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  icon: any;
  deliveryTime: string;
}

const availableServices: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'High Converting TikTok / Reels UGC Video',
    category: 'Content Creation',
    price: 199,
    description: 'Hook-optimized 30-45s UGC style video in Moroccan Darija recorded by professional creators with subtitles.',
    icon: Video,
    deliveryTime: '48h delivery'
  },
  {
    id: 'srv-2',
    title: 'Landing Page Graphic Design Pack',
    category: 'Design',
    price: 149,
    description: 'Complete set of 5 banner ads, product benefit badges, and gif animations designed to boost CTR & conversion.',
    icon: Palette,
    deliveryTime: '24h delivery'
  },
  {
    id: 'srv-3',
    title: 'Native Darija Voice-Over & Scripting',
    category: 'Voice-Over',
    price: 99,
    description: 'Persuasive native Moroccan voice-over recording with tailored emotional selling points and call-to-action.',
    icon: Mic,
    deliveryTime: '24h delivery'
  }
];

export default function SellerServicesPage() {
  const [requested, setRequested] = useState<string[]>([]);

  const handleRequest = (service: ServiceItem) => {
    setRequested(prev => [...prev, service.id]);
    toast.success(`Service "${service.title}" requested! Our team will contact you on WhatsApp.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Add-On Services</h1>
        <p className="text-slate-400 mt-1 text-[15px]">Boost your sales with our vetted UGC creators, graphic designers, and voice talent.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableServices.map((srv) => {
          const Icon = srv.icon;
          const isReq = requested.includes(srv.id);

          return (
            <Card key={srv.id} className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5b21b6] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase">
                    {srv.category}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug mb-2">
                  {srv.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  {srv.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold">{srv.deliveryTime}</span>
                  <div className="text-xl font-black text-slate-900">{srv.price} DH</div>
                </div>

                {isReq ? (
                  <Button disabled className="h-9 px-4 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Requested
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleRequest(srv)}
                    className="h-9 px-4 rounded-xl bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold text-xs shadow-sm"
                  >
                    Request
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
}

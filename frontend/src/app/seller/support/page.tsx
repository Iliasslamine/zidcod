'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Headset, 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'Orders & Delivery',
  'Payout & Wallet',
  'Integrations',
  'Other'
];

export default function SupportPage() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTickets, setSubmittedTickets] = useState<Array<{
    id: string;
    category: string;
    orderNumber?: string;
    date: string;
    status: string;
  }>>([]);

  const whatsappUrl = "https://wa.me/212649847132?text=Hello%20ZIDCOD%20Support,%20I%20need%20assistance%20with%20my%20seller%20account";

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMsg = message.trim();
    if (trimmedMsg.length <= 10) {
      toast.error("Message must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate ticket generation and submission
      await new Promise(resolve => setTimeout(resolve, 800));

      const ticketId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

      toast.success(`Ticket #${ticketId} submitted! Support team will respond within 2 hours.`);

      // Add to local state for instant feedback
      setSubmittedTickets(prev => [
        {
          id: ticketId,
          category,
          orderNumber: orderNumber.trim() || undefined,
          date: 'Just now',
          status: 'Open'
        },
        ...prev
      ]);

      // Reset form
      setCategory(CATEGORIES[0]);
      setOrderNumber('');
      setMessage('');
    } catch (err: any) {
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Support & Help Desk</h1>
        <p className="text-slate-400 mt-1 text-[15px]">
          Need help with your orders, payouts, or store integration? Contact our dedicated support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Direct WhatsApp Contact */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <MessageCircle className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Account Manager Online</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">
              Instant WhatsApp Support
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Connect directly with your dedicated ZIDCOD account manager for fast resolution on active shipments, store synchronization, and VIP requests.
            </p>

            <Button 
              onClick={handleOpenWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-12 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat with Account Manager</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
            </Button>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operating Hours:</span>
                <span className="font-semibold text-slate-700">Mon - Sat, 9:00 - 19:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Avg. WhatsApp Response:</span>
                <span className="font-semibold text-emerald-600">&lt; 15 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned Number:</span>
                <span className="font-semibold text-slate-700">+212 649 847 132</span>
              </div>
            </div>
          </Card>

          {/* Quick Help Guidelines */}
          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-slate-900 text-white p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-purple-300" />
              </div>
              <h3 className="font-bold text-sm">Helpful Tips</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>Include order tracking numbers for delivery inquiries.</li>
              <li>Ensure your 24-digit RIB is saved in Settings before payout days.</li>
              <li>For bulk lead import issues, attach your Google Sheet URL in the ticket.</li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Submit Support Ticket */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Submit Support Ticket</h2>
                <p className="text-xs text-slate-400 mt-0.5">We track every ticket to resolution within 2 hours.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5b21b6] flex items-center justify-center">
                <Headset className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-5">
              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Subject / Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-[#5b21b6] focus:ring-2 focus:ring-purple-600/20 outline-none transition-all cursor-pointer font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Number (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Order Number</span>
                  <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <Input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORD-10293 or COD-8472"
                  className="h-11 rounded-xl border-slate-200 text-sm font-medium focus-visible:ring-[#5b21b6]"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[11px] ${message.trim().length > 10 ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    {message.trim().length} chars (min 10)
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                  placeholder="Explain your issue or question in detail so our support team can resolve it quickly..."
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#5b21b6] focus:ring-2 focus:ring-purple-600/20 outline-none transition-all resize-none font-normal"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || message.trim().length <= 10}
                className="w-full bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-bold h-12 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Ticket</span>
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Submitted Tickets in this session */}
          {submittedTickets.length > 0 && (
            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6">
              <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Submitted Tickets (Current Session)
              </h3>
              <div className="space-y-2.5">
                {submittedTickets.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700">{t.id}</span>
                        <span className="font-semibold text-slate-800">• {t.category}</span>
                      </div>
                      {t.orderNumber && (
                        <p className="text-slate-400 text-[11px] mt-0.5">Order: {t.orderNumber}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px] border border-emerald-200">
                        {t.status}
                      </span>
                      <span className="text-slate-400 text-[11px]">{t.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}

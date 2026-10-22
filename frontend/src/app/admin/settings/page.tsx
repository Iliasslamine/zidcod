'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, TrendingUp, RefreshCw, CheckCircle2, History, Database, Megaphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'activity' | 'storage' | 'announcements'>('general');
  const [syncedCitiesCount, setSyncedCitiesCount] = useState<number>(0);
  const [lastSynced, setLastSynced] = useState<string>('never synced');
  const [isSyncing, setIsSyncing] = useState(false);
  const [upsellFee, setUpsellFee] = useState<number>(5);
  const [isSavingUpsell, setIsSavingUpsell] = useState(false);

  const handleSyncCities = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncedCitiesCount(42);
      setLastSynced('just now');
      setIsSyncing(false);
      toast.success("Successfully synced 42 deliverable cities from Forcelog API!");
    }, 1200);
  };

  const handleSaveUpsell = () => {
    setIsSavingUpsell(true);
    setTimeout(() => {
      setIsSavingUpsell(false);
      toast.success("Call-center upsell fee updated successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      {/* Page Title */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-400 mt-1 text-[15px]">Configure livraison API credentials, sync deliverable cities and review the activity log.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'general'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'activity'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Activity Logs
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'storage'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Storage
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'announcements'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Announcements
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Deliverable Cities Card */}
          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#5b21b6]">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Deliverable Cities</h3>
            </div>
            
            <p className="text-slate-500 text-[13.5px] max-w-2xl mb-6">
              Pull the list of cities Forcelog delivers to (with delivery fees). These drive the city dropdowns and auto delivery fees across the platform.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div>
                <div className="text-3xl font-black text-slate-900">{syncedCitiesCount}</div>
                <div className="text-xs text-slate-400 mt-0.5">cities synced · {lastSynced}</div>
              </div>
              
              <Button 
                onClick={handleSyncCities}
                disabled={isSyncing}
                className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold rounded-xl px-5 h-10 shadow-sm flex items-center gap-2 self-start sm:self-auto"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sync cities
              </Button>
            </div>
          </Card>

          {/* Call-Center Upsell Fee Card */}
          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#5b21b6]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Call-Center Upsell Fee</h3>
            </div>
            
            <p className="text-slate-500 text-[13.5px] max-w-3xl mb-6">
              Default fee ZIDCOD charges per unit when an agent upsells a product mid-call. Applies to every seller unless they have their own negotiated upsell fee set (Sellers → seller detail → Products).
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={upsellFee}
                  onChange={(e) => setUpsellFee(Number(e.target.value))}
                  className="w-28 h-10 rounded-xl border-slate-200 font-bold text-slate-900 text-center"
                />
                <span className="text-sm font-medium text-slate-600">DH per unit</span>
              </div>
              
              <Button 
                onClick={handleSaveUpsell}
                disabled={isSavingUpsell}
                className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold rounded-xl px-6 h-10 shadow-sm self-start sm:self-auto"
              >
                {isSavingUpsell ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900">System Activity Logs</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl text-xs">
              <span className="font-semibold text-slate-700">Database synchronization with 83 winning products</span>
              <span className="text-slate-400">Today, 04:35</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl text-xs">
              <span className="font-semibold text-slate-700">Admin credentials verified (Yassine Dradar)</span>
              <span className="text-slate-400">Today, 02:15</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl text-xs">
              <span className="font-semibold text-slate-700">Platform rebranded to ZIDCOD</span>
              <span className="text-slate-400">Yesterday</span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'storage' && (
        <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900">Storage & Media Buckets</h3>
          </div>
          <p className="text-slate-500 text-sm">Product images and shipping label templates are hosted via Supabase public storage bucket `product-images`.</p>
        </Card>
      )}

      {activeTab === 'announcements' && (
        <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900">Platform Announcements</h3>
          </div>
          <p className="text-slate-500 text-sm">Broadcast notices to seller dashboards regarding logistics updates or holiday shipping schedules.</p>
        </Card>
      )}

    </div>
  );
}

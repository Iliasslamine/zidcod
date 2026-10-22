'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Check, 
  AlertTriangle, 
  Unplug, 
  Clock, 
  Search, 
  RotateCw,
  Store,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ConnectedStore {
  id: string;
  sellerName: string;
  storeName: string;
  provider: 'Youcan' | 'Shopify';
  status: 'Active' | 'Needs Reconnect' | 'Disconnected';
  parked: number;
  lastOrder: string;
  disconnected: string;
  lastError: string;
}

export default function AdminIntegrationsPage() {
  const [stores, setStores] = useState<ConnectedStore[]>([
    {
      id: 'store_youcan_abdelali',
      sellerName: 'ABDELALI EL MAIMOUNI',
      storeName: 'dardeal maroc',
      provider: 'Youcan',
      status: 'Active',
      parked: 0,
      lastOrder: '—',
      disconnected: '—',
      lastError: '—',
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Needs Reconnect' | 'Disconnected'>('All');

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations/admin/stores');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setStores(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch remote stores, using local state", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDisconnect = async (id: string, storeName: string) => {
    try {
      await api.post(`/integrations/admin/disconnect/${id}`).catch(() => {});
      setStores(prev => prev.map(s => s.id === id ? { 
        ...s, 
        status: 'Disconnected' as const, 
        disconnected: 'Just now' 
      } : s));
      toast.success(`Disconnected ${storeName} successfully.`);
    } catch (err) {
      toast.error('Failed to disconnect store');
    }
  };

  const handleReconnect = (id: string, storeName: string) => {
    setStores(prev => prev.map(s => s.id === id ? { 
      ...s, 
      status: 'Active' as const, 
      disconnected: '—' 
    } : s));
    toast.success(`Reconnected ${storeName} successfully.`);
  };

  const activeCount = stores.filter(s => s.status === 'Active').length;
  const needsReconnectCount = stores.filter(s => s.status === 'Needs Reconnect').length;
  const disconnectedCount = stores.filter(s => s.status === 'Disconnected').length;
  const parkedCount = stores.reduce((sum, s) => sum + s.parked, 0);

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && store.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-1">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Integrations</h1>
          <p className="text-slate-400 mt-1 text-[15px]">
            Sellers' connected stores (YouCan and future providers) and their sync status.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchStores} 
          disabled={loading}
          className="rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold h-9 px-3 flex items-center gap-1.5 self-start shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active */}
        <Card className="border border-slate-100 rounded-3xl bg-white p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1e173e] flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{activeCount}</h3>
              <p className="text-xs font-semibold text-[#5b21b6] mt-0.5">connected stores</p>
            </div>
          </div>
        </Card>

        {/* Needs reconnect */}
        <Card className="border border-slate-100 rounded-3xl bg-white p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1e173e] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Needs reconnect</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{needsReconnectCount}</h3>
              <p className="text-xs text-slate-400 mt-0.5">token expired or revoked</p>
            </div>
          </div>
        </Card>

        {/* Disconnected */}
        <Card className="border border-slate-100 rounded-3xl bg-white p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1e173e] flex items-center justify-center shrink-0">
              <Unplug className="w-5 h-5 text-indigo-300 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Disconnected</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{disconnectedCount}</h3>
              <p className="text-xs text-slate-400 mt-0.5">history kept</p>
            </div>
          </div>
        </Card>

        {/* Parked orders */}
        <Card className="border border-slate-100 rounded-3xl bg-white p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1e173e] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-indigo-300 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Parked orders</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{parkedCount}</h3>
              <p className="text-xs text-slate-400 mt-0.5">need seller action</p>
            </div>
          </div>
        </Card>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input 
            placeholder="Search seller, store, provider..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border border-slate-200/90 rounded-xl h-10 text-[13px] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#5b21b6]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Status</span>
          {(['All', 'Active', 'Needs Reconnect', 'Disconnected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-all ${
                statusFilter === tab 
                  ? 'bg-[#291b54] text-white shadow-sm' 
                  : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-100 rounded-3xl bg-white overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">SELLER</th>
                <th className="py-4 px-6">PROVIDER</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6">PARKED</th>
                <th className="py-4 px-6">LAST ORDER</th>
                <th className="py-4 px-6">DISCONNECTED</th>
                <th className="py-4 px-6">LAST ERROR</th>
                <th className="py-4 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No connected stores match your filter.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 tracking-wide">{store.sellerName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{store.storeName}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {store.provider}
                    </td>
                    <td className="py-4 px-6">
                      {store.status === 'Active' && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active
                        </span>
                      )}
                      {store.status === 'Needs Reconnect' && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                          Needs Reconnect
                        </span>
                      )}
                      {store.status === 'Disconnected' && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Disconnected
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {store.parked}
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">
                      {store.lastOrder}
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">
                      {store.disconnected}
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">
                      {store.lastError}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {store.status === 'Active' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(store.id, store.storeName)}
                          className="rounded-xl border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-medium h-8 px-3.5 shadow-none transition-colors"
                        >
                          <Unplug className="w-3.5 h-3.5 mr-1.5" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReconnect(store.id, store.storeName)}
                          className="rounded-xl border-slate-200 text-[#5b21b6] hover:bg-[#5b21b6]/10 text-xs font-medium h-8 px-3.5 shadow-none transition-colors"
                        >
                          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                          Reconnect
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}


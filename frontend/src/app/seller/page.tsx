'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, PackageX, TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const ProgressRing = ({ value, max, color, size = 56, strokeWidth = 5 }: { value: number, max: number, color: string, size?: number, strokeWidth?: number }) => {
  const safeMax = max > 0 ? max : 1;
  const safeValue = isNaN(value) ? 0 : Math.min(value, safeMax);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (safeValue / safeMax) * circumference;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
    </div>
  );
};

export default function SellerDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    confirmed: 0,
    delivered: 0,
    returned: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await api.get('/analytics/seller');
        setMetrics({
          totalLeads: data.totalLeads || 0,
          confirmed: data.confirmed || 0,
          delivered: data.delivered || 0,
          returned: data.returned || 0,
          revenue: data.revenue || 0
        });
      } catch (error) {
        toast.error('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const confRate = metrics.totalLeads > 0 ? Math.round((metrics.confirmed / metrics.totalLeads) * 100) : 0;
  const delivRate = metrics.confirmed > 0 ? Math.round((metrics.delivered / metrics.confirmed) * 100) : 0;
  const retRate = metrics.confirmed > 0 ? Math.round((metrics.returned / metrics.confirmed) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-slate-900">Welcome back, ILIASS 👋</h1>
        <p className="text-slate-500 mt-1.5 text-[15px]">Here is what's happening with your business today...</p>
      </div>

      {/* 4 Pill-shaped Metric Cards Horizontal */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Leads Pill */}
        <div className="bg-white rounded-full p-2 pr-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-50 rounded-full p-1 shrink-0">
            <ProgressRing value={metrics.totalLeads} max={metrics.totalLeads} color="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{loading ? '-' : metrics.totalLeads}</span>
              <span className="text-xs text-blue-600 font-medium">total</span>
            </div>
          </div>
        </div>

        {/* Confirmed Pill */}
        <div className="bg-white rounded-full p-2 pr-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-amber-50 rounded-full p-1 shrink-0">
            <ProgressRing value={confRate} max={100} color="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{loading ? '-' : metrics.confirmed}</span>
              <span className="text-xs text-amber-600 font-medium">{confRate}% rate</span>
            </div>
          </div>
        </div>

        {/* Delivered Pill */}
        <div className="bg-white rounded-full p-2 pr-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 rounded-full p-1 shrink-0">
            <ProgressRing value={delivRate} max={100} color="text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivered</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{loading ? '-' : metrics.delivered}</span>
              <span className="text-xs text-emerald-600 font-medium">{delivRate}% rate</span>
            </div>
          </div>
        </div>

        {/* Returned Pill */}
        <div className="bg-white rounded-full p-2 pr-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-rose-50 rounded-full p-1 shrink-0">
            <ProgressRing value={retRate} max={100} color="text-rose-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Returned</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{loading ? '-' : metrics.returned}</span>
              <span className="text-xs text-rose-600 font-medium">{retRate}% rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <button className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl p-6 transition-all shadow-md group">
          <div className="text-left">
            <h3 className="text-xl font-bold">Create Lead</h3>
            <p className="text-indigo-100 mt-1 text-sm">Manually push a new order to fulfillment.</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
            <PlusCircle className="w-8 h-8" />
          </div>
        </button>

        <button className="flex items-center justify-between bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-6 transition-all shadow-sm group">
          <div className="text-left">
            <h3 className="text-xl font-bold">Browse Products</h3>
            <p className="text-slate-500 mt-1 text-sm">Find winning products in the marketplace.</p>
          </div>
          <div className="bg-slate-100 p-3 rounded-full group-hover:scale-110 transition-transform">
            <Search className="w-8 h-8 text-slate-600" />
          </div>
        </button>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900">Performance</h3>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium">View Details</Button>
          </div>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Delivery Rate</p>
                    <p className="text-xs text-slate-500 mt-0.5">Successful orders vs shipped</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">{delivRate}%</p>
                  <p className="text-xs font-medium text-emerald-600">Healthy</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Return Rate</p>
                    <p className="text-xs text-slate-500 mt-0.5">Failed or rejected orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">{retRate}%</p>
                  <p className="text-xs font-medium text-amber-600">Needs attention</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-lg text-slate-900">Top Products</h3>
          </div>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
              <PackageX className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-[15px] font-semibold text-slate-700">No products yet</p>
            <p className="text-sm text-slate-400 mt-1 max-w-[250px]">Sell your first product to see your best performers here.</p>
            <Button variant="outline" className="mt-6 border-slate-200 text-indigo-600 hover:bg-indigo-50 font-semibold shadow-sm">
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

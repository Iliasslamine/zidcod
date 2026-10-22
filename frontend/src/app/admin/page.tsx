'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Users, CheckCircle2, Truck, DollarSign, AlertTriangle, Package, Headphones, TrendingUp } from 'lucide-react';

const defaultData = [
  { name: 'Sep 28', leads: 0, delivered: 0, confirmed: 0 },
  { name: 'Sep 29', leads: 0, delivered: 0, confirmed: 0 },
  { name: 'Sep 30', leads: 0, delivered: 0, confirmed: 0 },
  { name: 'Oct 1', leads: 0, delivered: 0, confirmed: 0 },
  { name: 'Oct 2', leads: 0, delivered: 0, confirmed: 0 },
  { name: 'Oct 3', leads: 0, delivered: 0, confirmed: 0 },
  { name: 'Oct 4', leads: 0, delivered: 0, confirmed: 0 },
];

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    confirmed: 0,
    delivered: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await api.get('/analytics/admin');
        setMetrics({
          totalLeads: data.totalLeads || 0,
          confirmed: data.confirmed || 0,
          delivered: data.delivered || 0,
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

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="text-slate-400 mt-1 text-[15px]">Monitor your business performance and track key metrics.</p>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* New Leads */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl bg-white overflow-hidden p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="bg-[#fb3958] p-3.5 rounded-full text-white shrink-0 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-400 mb-0.5">New Leads</p>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {loading ? '-' : metrics.totalLeads.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] font-bold text-purple-600">0.0%</span>
              <span className="text-[11px] font-medium text-slate-400">vs yesterday</span>
            </div>
          </div>
        </Card>

        {/* Confirmed */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl bg-white overflow-hidden p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="bg-[#6b21a8] p-3.5 rounded-full text-white shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-400 mb-0.5">Confirmed</p>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {loading ? '-' : metrics.confirmed.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] font-bold text-purple-600">0.0%</span>
              <span className="text-[11px] font-medium text-slate-400">vs yesterday</span>
            </div>
          </div>
        </Card>

        {/* Delivered */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl bg-white overflow-hidden p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="bg-[#f97316] p-3.5 rounded-full text-white shrink-0 shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-400 mb-0.5">Delivered</p>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {loading ? '-' : metrics.delivered.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] font-bold text-purple-600">0.0%</span>
              <span className="text-[11px] font-medium text-slate-400">vs yesterday</span>
            </div>
          </div>
        </Card>

        {/* Revenue */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl bg-white overflow-hidden p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="bg-[#f04b32] p-3.5 rounded-full text-white shrink-0 shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-400 mb-0.5">Revenue</p>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {loading ? '-' : Number(metrics.revenue).toLocaleString()} <span className="text-[16px] text-slate-600">DH</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] font-bold text-purple-600">0.0%</span>
              <span className="text-[11px] font-medium text-slate-400">vs yesterday</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3 Mini Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-lg text-red-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-bold text-slate-700">Need Confirmation</span>
          </div>
          <div className="bg-red-50 text-red-500 font-bold text-[13px] px-2.5 py-0.5 rounded-full">0</div>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-bold text-slate-700">Ready to Ship</span>
          </div>
          <div className="bg-purple-50 text-purple-600 font-bold text-[13px] px-2.5 py-0.5 rounded-full">0</div>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-lg text-red-500">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-bold text-slate-700">Open Complaints</span>
          </div>
          <div className="bg-red-50 text-red-500 font-bold text-[13px] px-2.5 py-0.5 rounded-full">0</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Performance Funnel */}
        <Card className="col-span-12 lg:col-span-4 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl bg-white">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-[15px] text-slate-900">Performance Funnel</h3>
            <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100">All time</span>
          </div>
          <CardContent className="p-5 flex items-center justify-center min-h-[300px]">
            <div className="text-center text-slate-400 text-sm">
              [Funnel Chart Visualization]
            </div>
          </CardContent>
        </Card>

        {/* Leads & Orders Chart */}
        <Card className="col-span-12 lg:col-span-8 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl bg-white">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-[15px] text-slate-900">Leads & Orders</h3>
            <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100">Last 7 days</span>
          </div>
          <CardContent className="p-5 min-h-[300px]">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={defaultData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Line type="monotone" dataKey="leads" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="confirmed" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3, fill: '#7c3aed' }} />
                  <Line type="monotone" dataKey="delivered" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

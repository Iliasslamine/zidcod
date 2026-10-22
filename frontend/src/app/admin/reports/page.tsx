'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, BarChart3, PieChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Generate and export detailed business reports.</p>
        </div>
        <Button className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-5 rounded-xl">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Report Card */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold">Generate</Button>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Sales Performance</h3>
          <p className="text-sm text-slate-500">Comprehensive overview of revenue, conversion rates, and order volume over time.</p>
        </Card>

        {/* Seller Performance Card */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold">Generate</Button>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Seller Metrics</h3>
          <p className="text-sm text-slate-500">Breakdown of top-performing sellers, their conversion rates, and total generated revenue.</p>
        </Card>

        {/* Product Analytics Card */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <PieChart className="w-6 h-6" />
            </div>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold">Generate</Button>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Product Analytics</h3>
          <p className="text-sm text-slate-500">Insights into which products are being sold the most, return rates, and margins.</p>
        </Card>

        {/* Financial Summary Card */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold">Generate</Button>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Financial Summary</h3>
          <p className="text-sm text-slate-500">Consolidated report of payouts, platform fees, operational costs, and net profit.</p>
        </Card>
      </div>

    </div>
  );
}

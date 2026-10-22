'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Headset, CheckCircle2, Clock, AlertTriangle, MessageSquare, Filter } from 'lucide-react';

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState('All');
  
  const tabs = ['All', 'Open', 'In Progress', 'Resolved'];
  
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Complaints</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Manage and resolve seller complaints and support tickets.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Open Complaints</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">0</p>
          </div>
        </Card>
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">In Progress</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">0</p>
          </div>
        </Card>
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Resolved (30d)</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">0</p>
          </div>
        </Card>
      </div>

      <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white overflow-hidden">
        
        {/* Filters */}
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-white text-[#5b21b6] shadow-sm border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Search ticket ID or seller..." 
                className="pl-9 bg-white border-slate-200 rounded-xl h-10 shadow-sm font-medium text-[13px]"
              />
            </div>
            <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm h-10 px-3 rounded-xl shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Headset className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No complaints found</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">There are no complaints matching your current filters. Everything is running smoothly!</p>
        </div>

      </Card>
    </div>
  );
}

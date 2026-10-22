'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Save, Lock, Shield, CreditCard } from 'lucide-react';

export default function SellerSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Manage your account settings and preferences.</p>
        </div>
        <Button className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-5 rounded-xl">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar for Settings */}
        <div className="lg:col-span-3 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 text-[#5b21b6] font-semibold text-[14px]">
            <User className="w-4 h-4" />
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium text-[14px] transition-colors">
            <Lock className="w-4 h-4" />
            Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium text-[14px] transition-colors">
            <CreditCard className="w-4 h-4" />
            Billing Details
          </button>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-9 space-y-6">
          
          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 md:p-8">
            <h3 className="text-[15px] font-bold text-slate-900 mb-6">Personal Information</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">First Name</label>
                  <Input defaultValue="ILIASS" className="h-11 rounded-xl border-slate-200 shadow-sm font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Last Name</label>
                  <Input defaultValue="Seller" className="h-11 rounded-xl border-slate-200 shadow-sm font-medium" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700">Email Address</label>
                <Input defaultValue="ilyasslamine@gmail.com" disabled className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500 shadow-sm font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700">Phone Number</label>
                <Input placeholder="+212..." className="h-11 rounded-xl border-slate-200 shadow-sm font-medium" />
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

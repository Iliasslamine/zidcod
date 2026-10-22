'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Image as ImageIcon, Upload, X, Sparkles } from 'lucide-react';

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Services</h1>
        <p className="text-slate-400 mt-1 text-[15px]">Manage the add-on services catalog sellers can browse (design, UGC, voice-over, etc).</p>
      </div>

      {/* Catalog Card */}
      <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm">
            <Sparkles className="w-6 h-6 text-[#7c3aed]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Services catalog</h2>
            <p className="text-sm font-medium text-slate-400 mt-0.5">0 categories · 0 services</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-5 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Service
        </Button>
      </Card>

      {/* Empty State Card */}
      <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-12 flex flex-col items-center justify-center min-h-[400px]">
         <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-slate-300" />
         </div>
         <h3 className="text-lg font-bold text-slate-900 mb-1">No services yet</h3>
         <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">Create your first service to start offering add-ons like UGC, design, or voice-overs to your sellers.</p>
         <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-10 px-5 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Service
          </Button>
      </Card>


      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-[17px] font-bold text-slate-900">New Service</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700">Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-slate-600 font-semibold bg-white hover:bg-slate-50 shadow-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700">Name</label>
                <Input placeholder="UGC AI 1" className="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-purple-500 font-medium" />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Category</label>
                  <Input placeholder="New category name" className="h-11 rounded-xl border-purple-500 ring-4 ring-purple-500/10 shadow-sm font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Price (DH)</label>
                  <Input type="number" placeholder="165.00" className="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-purple-500 font-medium" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700">Description</label>
                <Textarea 
                  placeholder="What's included, who it's for..." 
                  className="min-h-[100px] resize-none rounded-xl border-slate-200 shadow-sm focus-visible:ring-purple-500 font-medium p-3"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex ${isActive ? 'bg-[#5b21b6]' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <span className="text-[14px] font-semibold text-slate-700">Active (visible to sellers)</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="h-11 px-6 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-6 rounded-xl"
              >
                Create
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

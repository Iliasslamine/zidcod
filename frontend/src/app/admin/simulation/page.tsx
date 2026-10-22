'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Save, Link2, Users, Percent, Package, Tag, CheckCircle2, Box, Truck, Wallet, FileText, CircleDollarSign, Coins, Filter } from 'lucide-react';

export default function SimulationPage() {
  const [params, setParams] = useState({
    costPerLead: 0,
    leadsCount: 0,
    confRate: 0,
    delivRate: 0,
    prodCost: 0,
    sellingPrice: 0,
    opCostConf: 0,
    opCostPack: 0,
    opCostDeliv: 0
  });

  const updateParam = (key: keyof typeof params, value: string) => {
    setParams(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const resetParams = () => {
    setParams({
      costPerLead: 0,
      leadsCount: 0,
      confRate: 0,
      delivRate: 0,
      prodCost: 0,
      sellingPrice: 0,
      opCostConf: 0,
      opCostPack: 0,
      opCostDeliv: 0
    });
  };

  // Calculations
  const leads = params.leadsCount;
  const adSpend = params.costPerLead * leads;
  const confirmed = Math.round(leads * (params.confRate / 100));
  const delivered = Math.round(confirmed * (params.delivRate / 100));
  
  const totalSalesRevenue = delivered * params.sellingPrice;
  const totalProductCost = delivered * params.prodCost;
  const totalOpCost = (leads * params.opCostConf) + (confirmed * params.opCostPack) + (delivered * params.opCostDeliv);
  
  const netProfit = totalSalesRevenue - totalProductCost - adSpend - totalOpCost;
  const roi = adSpend > 0 ? (netProfit / adSpend) * 100 : 0;
  
  const profitPerUnit = delivered > 0 ? netProfit / delivered : 0;
  const costPerDelivered = delivered > 0 ? (totalOpCost + adSpend) / delivered : 0;

  const getBarWidth = (value: number, max: number) => {
    if (max === 0) return '0%';
    return `${Math.min(100, Math.max(0, (value / max) * 100))}%`;
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Product Simulation</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Real-time calculator for e-commerce profitability and unit economics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={resetParams} variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm h-11 px-5 rounded-xl">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-5 rounded-xl">
            <Save className="w-4 h-4 mr-2" />
            Save Scenario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameters */}
        <div className="lg:col-span-5">
          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white overflow-hidden p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-6">SIMULATION PARAMETERS</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">COST PER LEAD (DH)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Link2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input type="number" value={params.costPerLead || ''} onChange={e => updateParam('costPerLead', e.target.value)} placeholder="0" className="pl-10 bg-white border-slate-200 rounded-2xl h-12 shadow-sm font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">LEADS COUNT</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input type="number" value={params.leadsCount || ''} onChange={e => updateParam('leadsCount', e.target.value)} placeholder="0" className="pl-10 bg-white border-slate-200 rounded-2xl h-12 shadow-sm font-medium" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CONF. RATE (%)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input type="number" value={params.confRate || ''} onChange={e => updateParam('confRate', e.target.value)} placeholder="0" className="pl-10 bg-white border-slate-200 rounded-2xl h-12 shadow-sm font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">DELIV. RATE (%)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Truck className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input type="number" value={params.delivRate || ''} onChange={e => updateParam('delivRate', e.target.value)} placeholder="0" className="pl-10 bg-white border-slate-200 rounded-2xl h-12 shadow-sm font-medium" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PROD. COST (DH)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Package className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input type="number" value={params.prodCost || ''} onChange={e => updateParam('prodCost', e.target.value)} placeholder="0" className="pl-10 bg-white border-slate-200 rounded-2xl h-12 shadow-sm font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SELLING PRICE (DH)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Tag className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input type="number" value={params.sellingPrice || ''} onChange={e => updateParam('sellingPrice', e.target.value)} placeholder="0" className="pl-10 bg-white border-slate-200 rounded-2xl h-12 shadow-sm font-medium" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">OPERATIONAL COSTS (DH/UNIT)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CheckCircle2 className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input type="number" value={params.opCostConf || ''} onChange={e => updateParam('opCostConf', e.target.value)} placeholder="0" className="pl-9 bg-white border-slate-200 rounded-2xl h-11 shadow-sm font-medium" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase text-center">CONF.</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Box className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input type="number" value={params.opCostPack || ''} onChange={e => updateParam('opCostPack', e.target.value)} placeholder="0" className="pl-9 bg-white border-slate-200 rounded-2xl h-11 shadow-sm font-medium" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase text-center">PACK.</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Truck className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input type="number" value={params.opCostDeliv || ''} onChange={e => updateParam('opCostDeliv', e.target.value)} placeholder="0" className="pl-9 bg-white border-slate-200 rounded-2xl h-11 shadow-sm font-medium" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase text-center">DELIV.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-indigo-950 rounded-lg flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">NET PROFIT ESTIMATION</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{netProfit.toFixed(0)} DH</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="bg-slate-100 text-slate-500 font-semibold text-[11px] px-2.5 py-1 rounded-md">
                    ROI {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                  </span>
                  <span className="bg-slate-100 text-slate-500 font-semibold text-[11px] px-2.5 py-1 rounded-md">
                    AD: {adSpend.toFixed(0)} DH
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-indigo-950 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SALES REVENUE</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{totalSalesRevenue.toFixed(0)} DH</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="bg-slate-100 text-slate-500 font-semibold text-[11px] px-2.5 py-1 rounded-md">
                    {delivered} Units
                  </span>
                  <span className="bg-slate-100 text-slate-500 font-semibold text-[11px] px-2.5 py-1 rounded-md">
                    {params.sellingPrice} DH / unit
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-950 rounded-lg flex items-center justify-center">
                  <CircleDollarSign className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PROFIT / UNIT</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{profitPerUnit.toFixed(0)} DH</p>
            </Card>

            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-950 rounded-lg flex items-center justify-center">
                  <Coins className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">COST / DELIVERED</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{costPerDelivered.toFixed(0)} DH</p>
            </Card>
          </div>

          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 text-[#7c3aed]" />
              </div>
              <h2 className="text-[16px] font-bold text-slate-900">Conversion Funnel</h2>
            </div>
            
            <style jsx>{`
              input[type=range] {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                background: transparent;
                cursor: pointer;
              }
              input[type=range]:focus {
                outline: none;
              }
              input[type=range]::-webkit-slider-runnable-track {
                width: 100%;
                height: 10px;
                border-radius: 9999px;
              }
              input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #ffffff;
                margin-top: -5px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              
              /* Leads Slider */
              input[type=range].slider-leads::-webkit-slider-thumb { border: 3px solid #94a3b8; }
              /* Confirmed Slider */
              input[type=range].slider-conf::-webkit-slider-thumb { border: 3px solid #6366f1; }
              /* Delivered Slider */
              input[type=range].slider-deliv::-webkit-slider-thumb { border: 3px solid #22c55e; }
            `}</style>
            
            <div className="space-y-6">
              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" /> LEADS <span className="font-medium lowercase text-[10px]">(CPL: {params.costPerLead || 0} DH)</span>
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{leads}</span>
                </div>
                <div className="relative w-full h-2.5 rounded-full bg-slate-100 flex items-center">
                  <div className="absolute left-0 top-0 h-full bg-slate-400 rounded-full" style={{ width: getBarWidth(leads, 1000) }}></div>
                  <input 
                    type="range" 
                    min="0" max="1000" 
                    value={leads} 
                    onChange={e => updateParam('leadsCount', e.target.value)}
                    className="absolute w-full h-full opacity-100 z-10 slider-leads" 
                    style={{ background: 'transparent' }}
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" /> CONFIRMED <span className="font-medium lowercase text-slate-400 text-[10px]">({params.confRate || 0}% of leads)</span>
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{confirmed}</span>
                </div>
                <div className="relative w-full h-2.5 rounded-full bg-slate-100 flex items-center">
                  <div className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full" style={{ width: getBarWidth(params.confRate, 100) }}></div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={params.confRate} 
                    onChange={e => updateParam('confRate', e.target.value)}
                    className="absolute w-full h-full opacity-100 z-10 slider-conf" 
                    style={{ background: 'transparent' }}
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-500" /> DELIVERED <span className="font-medium lowercase text-slate-400 text-[10px]">({params.delivRate || 0}% of confirmed)</span>
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{delivered}</span>
                </div>
                <div className="relative w-full h-2.5 rounded-full bg-slate-100 flex items-center">
                  <div className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full" style={{ width: getBarWidth(params.delivRate, 100) }}></div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={params.delivRate} 
                    onChange={e => updateParam('delivRate', e.target.value)}
                    className="absolute w-full h-full opacity-100 z-10 slider-deliv" 
                    style={{ background: 'transparent' }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

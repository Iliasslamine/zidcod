'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, DollarSign, CheckCircle2, Clock, Download, Plus, 
  ArrowUpRight, Building2, Check, X, Search, Filter 
} from 'lucide-react';

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payouts'>('invoices');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([
    {
      id: 'po-1',
      seller: 'ILIASS LAMINE (RUVANO)',
      rib: '230 780 4567890123456789 12 (CIH Bank)',
      amount: 1450,
      status: 'pending',
      requestedAt: '16 oct. 2026'
    }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      {/* Top Tab Switcher */}
      <div className="flex items-center">
        <div className="inline-flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'invoices'
                ? 'bg-[#2b1464] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'payouts'
                ? 'bg-[#2b1464] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payouts
          </button>
        </div>
      </div>

      {activeTab === 'invoices' ? (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Invoices</h1>
              <p className="text-slate-400 mt-1 text-[15px]">Create invoices from delivered orders, download PDFs.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm h-11 px-4 rounded-xl">
                <Download className="w-4 h-4 mr-2 text-slate-400" />
                Export
              </Button>
              <Button className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-5 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </div>
          </div>

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Invoices */}
            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Total Invoices</p>
                <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">0</h3>
                <p className="text-[12px] text-slate-400 font-medium mt-1">all time</p>
              </div>
            </Card>

            {/* Total Amount */}
            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0 shadow-sm">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Total Amount</p>
                <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">0 DH</h3>
                <p className="text-[12px] text-slate-400 font-medium mt-1">invoiced</p>
              </div>
            </Card>

            {/* Paid */}
            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Paid</p>
                <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">0 DH</h3>
                <p className="text-[12px] text-indigo-600 font-medium mt-1">settled</p>
              </div>
            </Card>

            {/* To Invoice */}
            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">To Invoice</p>
                <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">0</h3>
                <p className="text-[12px] text-amber-600 font-medium mt-1">uninvoiced</p>
              </div>
            </Card>
          </div>

          {/* Main Invoices Container */}
          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white min-h-[420px] flex flex-col items-center justify-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No invoices yet</h3>
            <p className="text-slate-400 text-sm max-w-sm text-center">
              Generate your first invoice from delivered orders.
            </p>
          </Card>
        </>
      ) : (
        <>
          {/* Payouts Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Seller Payouts</h1>
              <p className="text-slate-400 mt-1 text-[15px]">Review seller withdrawal requests and process bank transfers.</p>
            </div>
            <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm h-11 px-4 rounded-xl">
              <Download className="w-4 h-4 mr-2 text-slate-400" />
              Export Payouts
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Total Payouts</p>
                <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">1,450 DH</h3>
                <p className="text-[12px] text-slate-400 font-medium mt-1">all time</p>
              </div>
            </Card>

            <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Pending Requests</p>
                <h3 className="text-2xl font-black text-amber-600 leading-none mt-1">1</h3>
                <p className="text-[12px] text-amber-600 font-medium mt-1">awaiting wire</p>
              </div>
            </Card>

            <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Settled Payouts</p>
                <h3 className="text-2xl font-black text-emerald-600 leading-none mt-1">0 DH</h3>
                <p className="text-[12px] text-slate-400 font-medium mt-1">completed transfers</p>
              </div>
            </Card>
          </div>

          <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Payout Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Seller</th>
                    <th className="px-6 py-4">Bank RIB</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payouts.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{po.seller}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{po.rib}</td>
                      <td className="px-6 py-4 font-black text-slate-900">{po.amount} DH</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{po.requestedAt}</td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase">
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl h-8 px-3">
                          <Check className="w-3.5 h-3.5 mr-1" /> Mark Paid
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, Plus, Receipt } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function WalletPage() {
  const [wallet, setWallet] = useState({ availableBalance: 0, pendingBalance: 0, transactions: [] });

  useEffect(() => {
    api.get('/ledger/wallet').then(res => setWallet(res.data)).catch(console.error);
  }, []);

  const handlePayoutRequest = async () => {
    try {
      await api.post('/ledger/request-payout');
      toast.success('Payout requested successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request payout');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Wallet</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Manage your balance, payouts, and financial transactions.</p>
        </div>
        <Button onClick={handlePayoutRequest} className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-5 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Request Payout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Balance */}
        <Card className="md:col-span-2 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-slate-900 p-8 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Available Balance</h2>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <span className="text-5xl font-bold">{wallet.availableBalance?.toFixed(2) || '0.00'}</span>
                <span className="text-2xl font-medium text-slate-400 ml-2">DH</span>
              </div>
              <Button onClick={handlePayoutRequest} className="bg-white hover:bg-slate-50 text-slate-900 font-bold shadow-md h-11 px-6 rounded-xl">
                Withdraw
              </Button>
            </div>
          </div>
        </Card>

        {/* Pending Clearance */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Pending Clearance</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{wallet.pendingBalance?.toFixed(2) || '0.00'} <span className="text-xl font-medium text-slate-400">DH</span></p>
          </div>
          <p className="text-sm text-slate-500 mt-4">Funds from recent delivered orders waiting to clear.</p>
        </Card>

      </div>

      {/* Transaction History */}
      <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-400" />
            Recent Transactions
          </h3>
        </div>
        
        <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No transactions yet</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">Your transaction history will appear here once you start generating sales or making withdrawals.</p>
        </div>
      </Card>

    </div>
  );
}

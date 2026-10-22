'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Users, UserCheck, Clock, UserX, MoreVertical, Edit, Trash, Ban, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SellersPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const token = (session as any)?.accessToken;
        if (!token) return;
        setLoading(true);
        const res = await axios.get('http://localhost:4000/users/sellers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSellers(res.data);
      } catch (err) {
        console.error("Failed to fetch sellers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, [session]);

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-600';
    if (status === 'SUSPENDED') return 'bg-red-50 text-red-500';
    return 'bg-amber-50 text-amber-500';
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Sellers</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Activate or suspend seller accounts and view per seller performance stats.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm h-10 px-4 rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sellers', value: sellers.length.toString(), sub: '+0 this month', color: 'bg-indigo-950', icon: Users, subColor: 'text-purple-600' },
          { label: 'Active', value: sellers.filter((s:any) => s.sellerProfile?.status === 'ACTIVE').length.toString(), sub: 'active stores', color: 'bg-indigo-950', icon: UserCheck, subColor: 'text-purple-600' },
          { label: 'Pending', value: sellers.filter((s:any) => s.sellerProfile?.status === 'PENDING').length.toString(), sub: 'awaiting review', color: 'bg-indigo-950', icon: Clock, subColor: 'text-orange-500' },
          { label: 'Suspended', value: sellers.filter((s:any) => s.sellerProfile?.status === 'SUSPENDED').length.toString(), sub: 'suspended accounts', color: 'bg-indigo-950', icon: UserX, subColor: 'text-red-500' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl bg-white overflow-hidden p-5">
              <div className="flex flex-col">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-[52px] h-[52px] ${stat.color} rounded-full flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-400 leading-tight mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</p>
                  </div>
                </div>
                <p className={`text-[12px] font-semibold ${stat.subColor} mt-1 ml-[68px]`}>{stat.sub}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {[
          { name: 'All', count: sellers.length },
          { name: 'Pending', count: sellers.filter((s:any) => s.sellerProfile?.status === 'PENDING').length },
          { name: 'Active', count: sellers.filter((s:any) => s.sellerProfile?.status === 'ACTIVE').length },
          { name: 'Suspended', count: sellers.filter((s:any) => s.sellerProfile?.status === 'SUSPENDED').length }
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-3 font-semibold text-[15px] relative transition-colors whitespace-nowrap ${
              activeTab === tab.name ? 'text-[#7c3aed]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.name}
            <span className={`ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab.name ? 'bg-purple-100 text-[#7c3aed]' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7c3aed] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input placeholder="Search name, store or phone..." className="pl-9 bg-white border-slate-200 rounded-xl h-10 shadow-sm" />
        </div>
        
        <select className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-600 outline-none shadow-sm min-w-[140px]">
          <option>Most Leads</option>
        </select>
        
        <div className="flex items-center gap-2">
          <select className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-600 outline-none shadow-sm w-[130px]">
            <option>Last 30 days</option>
          </select>
          <Input type="text" placeholder="05/09/2026" className="w-[130px] h-10 bg-white rounded-xl shadow-sm text-sm" />
          <span className="text-slate-400">-</span>
          <Input type="text" placeholder="04/10/2026" className="w-[130px] h-10 bg-white rounded-xl shadow-sm text-sm" />
          <button className="text-sm font-medium text-slate-400 hover:text-slate-600 ml-2">Clear</button>
        </div>
      </div>

      {/* Table */}
      <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl bg-white overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-[300px]">Loading sellers...</div>
        ) : sellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] bg-transparent">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No sellers yet</h3>
            <p className="text-slate-500 mt-1 text-[15px]">When sellers register, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Seller</th>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sellers.map((seller: any, i) => (
                  <tr key={seller.id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                          {seller.email?.substring(0,2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-[14px] leading-tight mb-0.5">{seller.email}</span>
                          <span className="text-[12px] font-medium text-slate-400">{seller.sellerProfile?.contact || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-semibold text-slate-700">{seller.sellerProfile?.storeName || 'My Store'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold ${getStatusColor(seller.sellerProfile?.status || 'PENDING')}`}>
                        {seller.sellerProfile?.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-slate-500">{new Date(seller.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-xl h-8 w-8 border border-slate-200 hover:bg-slate-100 transition-colors focus:outline-none">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl p-1">
                          <DropdownMenuItem className="cursor-pointer font-medium text-slate-700 py-2.5 px-3 rounded-lg hover:bg-slate-50 focus:bg-slate-50 flex items-center gap-2">
                            <Edit className="w-4 h-4 text-slate-400" />
                            View Details
                          </DropdownMenuItem>
                          
                          {seller.sellerProfile?.status !== 'ACTIVE' && (
                            <DropdownMenuItem className="cursor-pointer font-medium text-emerald-600 py-2.5 px-3 rounded-lg hover:bg-emerald-50 focus:bg-emerald-50 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Activate Account
                            </DropdownMenuItem>
                          )}
                          
                          {seller.sellerProfile?.status !== 'SUSPENDED' && (
                            <DropdownMenuItem className="cursor-pointer font-medium text-amber-600 py-2.5 px-3 rounded-lg hover:bg-amber-50 focus:bg-amber-50 flex items-center gap-2">
                              <Ban className="w-4 h-4" />
                              Suspend Account
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem className="cursor-pointer font-medium text-red-600 py-2.5 px-3 rounded-lg hover:bg-red-50 focus:bg-red-50 flex items-center gap-2 mt-1 border-t border-slate-100">
                            <Trash className="w-4 h-4" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

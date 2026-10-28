'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Shield, Headphones, Plus, Search, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface InternalUser {
  id: string;
  name: string;
  isYou?: boolean;
  role: 'Admin' | 'Agent' | 'Packaging';
  isOwner?: boolean;
  phone: string;
  status: 'Active' | 'Inactive';
  joined: string;
  initials: string;
}

const mockStaff: InternalUser[] = [
  {
    id: 'u-1',
    name: 'Iliass Lamine Developer',
    role: 'Admin',
    isOwner: true,
    phone: '+212649847132',
    status: 'Active',
    joined: '13 sept. 2026',
    initials: 'IL'
  },
  {
    id: 'u-2',
    name: 'Yassine Dradar',
    isYou: true,
    role: 'Admin',
    isOwner: true,
    phone: '—',
    status: 'Active',
    joined: '14 août 2026',
    initials: 'YD'
  }
];

export default function UsersRolesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'admins' | 'agents' | 'packaging'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [staff, setStaff] = useState<InternalUser[]>(mockStaff);

  const filteredStaff = staff.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery);
    if (!matchesSearch) return false;
    if (activeTab === 'admins') return u.role === 'Admin';
    if (activeTab === 'agents') return u.role === 'Agent';
    if (activeTab === 'packaging') return u.role === 'Packaging';
    return true;
  });

  const adminsCount = staff.filter(u => u.role === 'Admin').length;
  const agentsCount = staff.filter(u => u.role === 'Agent').length;
  const packagingCount = staff.filter(u => u.role === 'Packaging').length;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      {/* Title & Add User */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Users & Roles</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Create and manage admin accounts and call center agent logins.</p>
        </div>
        <Button className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-5 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* 3 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Users */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">{staff.length}</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-1">accounts</p>
          </div>
        </Card>

        {/* Admins */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Admins</p>
            <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">{adminsCount}</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-1">full access</p>
          </div>
        </Card>

        {/* Agents */}
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1e1338] text-white flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Agents</p>
            <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">{agentsCount}</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-1">call center</p>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white overflow-hidden">
        
        {/* Tabs & Search */}
        <div className="p-5 border-b border-slate-50 space-y-4">
          <div className="flex border-b border-slate-100 gap-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'all'
                  ? 'border-[#5b21b6] text-[#5b21b6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All <span className="bg-purple-100 text-[#5b21b6] text-[11px] font-bold px-2 py-0.5 rounded-full">{staff.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'admins'
                  ? 'border-[#5b21b6] text-[#5b21b6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Admins <span className="text-slate-400 text-xs font-medium">{adminsCount}</span>
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'agents'
                  ? 'border-[#5b21b6] text-[#5b21b6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Agents <span className="text-slate-400 text-xs font-medium">{agentsCount}</span>
            </button>
            <button
              onClick={() => setActiveTab('packaging')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'packaging'
                  ? 'border-[#5b21b6] text-[#5b21b6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Packaging <span className="text-slate-400 text-xs font-medium">{packagingCount}</span>
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl border-slate-200 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">USER</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4">PHONE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">JOINED</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStaff.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5b21b6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {u.initials}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{u.name}</span>
                        {u.isYou && <span className="text-slate-400 text-xs ml-1.5 font-medium">(you)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-[#5b21b6] text-xs font-bold px-2.5 py-0.5 rounded-full">
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                      {u.isOwner && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          Owner
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {u.phone}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    {u.joined}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white rounded-xl shadow-lg border-slate-100 p-1">
                        <DropdownMenuItem className="cursor-pointer font-medium text-slate-700 hover:bg-slate-50 rounded-lg text-xs">
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium text-red-600 hover:bg-red-50 rounded-lg text-xs">
                          Revoke Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing 1 to {filteredStaff.length} of {filteredStaff.length} users
          </div>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 h-7 rounded-lg bg-[#5b21b6] text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <select className="ml-2 border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 font-medium">
              <option>8 per page</option>
              <option>20 per page</option>
            </select>
          </div>
        </div>

      </Card>

    </div>
  );
}

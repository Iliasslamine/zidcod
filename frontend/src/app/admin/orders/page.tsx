'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, RefreshCcw, Search, PackageX } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('Confirmation');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = (session as any)?.accessToken;
        if (!token) return;
        setLoading(true);
        const res = await axios.get('http://localhost:4000/orders/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [session]);

  const tabs = [
    { name: 'New', count: 0 },
    { name: 'Confirmation', count: 0 },
    { name: 'Confirmed', count: 0 },
    { name: 'Fulfillment', count: 0 },
    { name: 'Shipping', count: 0 },
    { name: 'Delivered', count: 0 },
    { name: 'Issues', count: 0 },
    { name: 'All', count: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="text-slate-400 mt-1 text-[15px]">All orders by status confirm leads, dispatch for livraison, track delivery .</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm h-10 px-4 rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm h-10 px-4 rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All Tracking
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm h-10 px-4 rounded-xl">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-3 font-semibold text-[15px] relative transition-colors whitespace-nowrap ${
              activeTab === tab.name ? 'text-[#7c3aed]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.name}
            <span className={`ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab.name ? 'bg-[#7c3aed] text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7c3aed] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters Container */}
      <div className="space-y-3 mt-4">
        {/* Row 1 Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input placeholder="Search order #, customer or phone..." className="pl-9 bg-white border-slate-200 rounded-xl h-10 shadow-sm text-[14px]" />
          </div>
          <select className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-[14px] font-medium text-slate-600 outline-none shadow-sm min-w-[140px]">
            <option>All statuses</option>
          </select>
          <select className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-[14px] font-medium text-slate-600 outline-none shadow-sm min-w-[140px]">
            <option>All sellers</option>
          </select>
          <select className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-[14px] font-medium text-slate-600 outline-none shadow-sm min-w-[140px]">
            <option>All agents</option>
          </select>
          <select className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-[14px] font-medium text-slate-600 outline-none shadow-sm min-w-[140px]">
            <option>All cities</option>
          </select>
        </div>

        {/* Row 2 Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select className="flex-1 min-w-[280px] h-10 bg-white border border-slate-200 rounded-xl px-3 text-[14px] font-medium text-slate-600 outline-none shadow-sm">
            <option>All products</option>
          </select>
          <select className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-[14px] font-medium text-slate-600 outline-none shadow-sm min-w-[140px]">
            <option>Oldest First</option>
          </select>
          <select className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-[14px] font-medium text-slate-600 outline-none shadow-sm min-w-[140px]">
            <option>All Types</option>
          </select>
        </div>

        {/* Row 3 Date Picker & No Answer */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="h-10 bg-white border border-slate-200 rounded-xl px-3 flex items-center shadow-sm hover:bg-slate-50 transition-colors">
            <span className="text-slate-400 text-sm mr-2 flex items-center justify-center">
              <PackageX className="w-4 h-4" />
            </span>
            <span className="text-slate-600 text-[14px] font-medium">No-answer =</span>
          </button>
          <select className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-[14px] font-medium text-slate-600 outline-none shadow-sm min-w-[130px]">
            <option>All time</option>
          </select>
          <div className="flex items-center gap-2">
            <Input type="text" placeholder="05/09/2026" className="w-[130px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-[14px]" />
            <span className="text-slate-400 font-medium">-</span>
            <Input type="text" placeholder="04/10/2026" className="w-[130px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-[14px]" />
            <button className="text-[14px] font-medium text-[#7c3aed] hover:text-[#6d28d9] ml-2">Clear</button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mt-6">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-transparent">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
              <PackageX className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No orders here</h3>
            <p className="text-slate-500 mt-1 text-[15px]">Nothing matches this tab or filters yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-[14px]">#{order.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-600 text-[14px]">{order.product?.name || 'Unknown Product'}</div>
                      <div className="text-[12px] text-slate-400">{order.price} DH</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700 text-[14px]">{order.customerName}</div>
                      <div className="text-[12px] text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-600' :
                        order.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                       <Button variant="ghost" className="h-8 text-[13px] font-medium text-[#7c3aed] hover:bg-purple-50">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  PackageX, 
  Download, 
  ExternalLink, 
  Phone, 
  MapPin, 
  FileText, 
  Calendar, 
  Tag, 
  ShoppingBag,
  MessageCircle,
  X,
  Trash2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState('New');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: session } = useSession();

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected lead(s)?`)) return;
    try {
      const token = (session as any)?.accessToken;
      await axios.post('http://localhost:4000/orders/bulk-delete', 
        { orderIds: selectedIds }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${selectedIds.length} lead(s) deleted successfully`);
      setOrders(prev => prev.filter(o => !selectedIds.includes(o.id)));
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete selected leads');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      const token = (session as any)?.accessToken;
      await axios.delete(`http://localhost:4000/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Lead deleted successfully');
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedIds(prev => prev.filter(id => id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const handleDeleteAllOrders = async () => {
    if (!window.confirm(`Are you sure you want to delete all ${orders.length} leads? This cannot be undone.`)) return;
    try {
      const token = (session as any)?.accessToken;
      await axios.delete(`http://localhost:4000/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('All leads deleted successfully');
      setOrders([]);
      setSelectedIds([]);
      setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete all leads');
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = (session as any)?.accessToken;
        if (!token) return;
        setLoading(true);
        const res = await axios.get('http://localhost:4000/orders/seller', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [session]);

  // Compute dynamic counts per status
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      New: 0,
      Confirmation: 0,
      Confirmed: 0,
      Fulfillment: 0,
      Shipping: 0,
      Delivered: 0,
      Issues: 0,
      All: orders.length,
    };

    orders.forEach((o) => {
      const s = (o.status || '').toUpperCase();
      if (s === 'NEW') map.New++;
      else if (s === 'CONFIRMATION') map.Confirmation++;
      else if (s === 'CONFIRMED') map.Confirmed++;
      else if (s === 'FULFILLMENT') map.Fulfillment++;
      else if (s === 'SHIPPED') map.Shipping++;
      else if (s === 'DELIVERED') map.Delivered++;
      else if (s === 'CANCELLED' || s === 'RETURNED' || s === 'ISSUES') map.Issues++;
    });

    return map;
  }, [orders]);

  const tabs = [
    { name: 'New', count: counts.New },
    { name: 'Confirmation', count: counts.Confirmation },
    { name: 'Confirmed', count: counts.Confirmed },
    { name: 'Fulfillment', count: counts.Fulfillment },
    { name: 'Shipping', count: counts.Shipping },
    { name: 'Delivered', count: counts.Delivered },
    { name: 'Issues', count: counts.Issues },
    { name: 'All', count: counts.All },
  ];

  // Distinct cities from customerInfo
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      const c = o.customerInfo?.city;
      if (c && typeof c === 'string' && c.trim()) {
        set.add(c.trim());
      }
    });
    return Array.from(set).sort();
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Tab filter
      const s = (order.status || '').toUpperCase();
      if (activeTab === 'New' && s !== 'NEW') return false;
      if (activeTab === 'Confirmation' && s !== 'CONFIRMATION') return false;
      if (activeTab === 'Confirmed' && s !== 'CONFIRMED') return false;
      if (activeTab === 'Fulfillment' && s !== 'FULFILLMENT') return false;
      if (activeTab === 'Shipping' && s !== 'SHIPPED') return false;
      if (activeTab === 'Delivered' && s !== 'DELIVERED') return false;
      if (activeTab === 'Issues' && s !== 'CANCELLED' && s !== 'RETURNED' && s !== 'ISSUES') return false;

      // 2. City filter
      if (selectedCity !== 'All') {
        const orderCity = (order.customerInfo?.city || '').toLowerCase();
        if (orderCity !== selectedCity.toLowerCase()) return false;
      }

      // 3. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const custName = (order.customerInfo?.name || order.customerName || '').toLowerCase();
        const custPhone = (order.customerInfo?.phone || order.customerPhone || '').toLowerCase();
        const prodName = (order.product?.name || '').toLowerCase();
        const orderId = (order.id || '').toLowerCase();
        if (!custName.includes(q) && !custPhone.includes(q) && !prodName.includes(q) && !orderId.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, selectedCity, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Date', 'Status', 'Product SKU', 'Product Name', 'Price (DH)', 'Customer Name', 'Phone', 'City', 'Address', 'Notes', 'Source'];
    const rows = filteredOrders.map((o) => {
      const info = o.customerInfo || {};
      return [
        `"${o.id}"`,
        `"${new Date(o.createdAt).toLocaleDateString()}"`,
        `"${o.status}"`,
        `"${o.product?.sku || ''}"`,
        `"${(o.product?.name || '').replace(/"/g, '""')}"`,
        `"${o.totalPrice ?? o.price ?? 0}"`,
        `"${(info.name || '').replace(/"/g, '""')}"`,
        `"${info.phone || ''}"`,
        `"${(info.city || '').replace(/"/g, '""')}"`,
        `"${(info.address || '').replace(/"/g, '""')}"`,
        `"${(info.notes || info.note || '').replace(/"/g, '""')}"`,
        `"${info.source || 'MANUAL'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zidcod_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      {/* Header + Export */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Your leads by status: pending confirmation, in delivery, delivered and returned.</p>
        </div>
        <div className="flex items-center gap-3">
          {orders.length > 0 && (
            <Button 
              onClick={handleDeleteAllOrders}
              variant="outline" 
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold shadow-sm h-10 px-3.5 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              Delete All ({orders.length})
            </Button>
          )}
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm h-10 px-4 rounded-xl flex items-center gap-2 text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export ({filteredOrders.length})
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 overflow-x-auto scrollbar-none mt-2">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-3 font-semibold text-[15px] relative transition-colors whitespace-nowrap ${
              activeTab === tab.name ? 'text-[#7c3aed]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.name}
            <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${
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
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, or product..." 
              className="pl-9 bg-white border-slate-200 rounded-xl h-11 text-[14px]" 
            />
          </div>

          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="h-11 bg-white border border-slate-200 rounded-xl px-4 text-[14px] font-medium text-slate-600 outline-none shadow-sm min-w-[160px]"
          >
            <option value="All">All Cities</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {selectedIds.length > 0 && (
            <Button
              onClick={handleDeleteSelected}
              className="h-11 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 text-sm shadow-md transition-all animate-in zoom-in-95"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedIds.length})
            </Button>
          )}

          {orders.length > 0 && (
            <Button
              onClick={handleDeleteAllOrders}
              variant="outline"
              className="h-11 px-4 border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold rounded-xl flex items-center gap-2 text-sm shadow-xs transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              Delete All Leads ({orders.length})
            </Button>
          )}

          {(searchQuery || selectedCity !== 'All') && (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCity('All'); }}
              className="text-[13px] font-semibold text-purple-600 hover:text-purple-700 px-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mt-6">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[380px] bg-transparent p-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
              <PackageX className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No orders here</h3>
            <p className="text-slate-500 mt-1 text-[15px]">Nothing matches this status tab or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="w-10 px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: any) => {
                  const customer = order.customerInfo || {};
                  const customerName = order.customerInfo?.name || order.customerName || 'Customer';
                  const customerPhone = order.customerInfo?.phone || order.customerPhone || '—';
                  const customerCity = order.customerInfo?.city;
                  const price = order.totalPrice ?? order.price ?? 0;
                  const isChecked = selectedIds.includes(order.id);

                  return (
                    <tr key={order.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-purple-50/30' : ''}`}>
                      <td className="w-10 px-4 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(order.id)}
                          className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-[14px]">#{order.id.slice(0, 8)}</div>
                        {customer.source && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                            {customer.source}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {customer.isPack ? (
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-purple-900 text-[14px] line-clamp-1 max-w-[260px]">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-700 uppercase tracking-wider">
                                Pack
                              </span>
                              <span>{customer.packName || 'Pack Bundle'}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {customer.packSku || 'PACK'} • {(customer.packItems || []).length} items
                            </div>
                          </div>
                        ) : (
                          <div className="font-medium text-slate-700 text-[14px] line-clamp-1 max-w-[260px]">
                            {order.product?.name || 'Unknown Product'}
                          </div>
                        )}
                        <div className="text-[12px] font-semibold text-slate-900 mt-0.5">
                          {price} DH
                          {customer.quantity && customer.quantity > 1 && !customer.isPack && (
                            <span className="text-slate-400 font-normal ml-1.5">× {customer.quantity}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 text-[14px]">
                          {customerName} {customerCity && <span className="text-slate-400 text-xs font-normal">({customerCity})</span>}
                        </div>
                        <div className="text-[12px] text-slate-400 font-mono mt-0.5">
                          {customerPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          order.status === 'CONFIRMED' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                          order.status === 'NEW' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          order.status === 'CANCELLED' || order.status === 'RETURNED' ? 'bg-red-50 text-red-600 border border-red-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            onClick={() => setSelectedOrder(order)}
                            variant="ghost" 
                            className="h-8 text-[13px] font-medium text-[#7c3aed] hover:bg-purple-50"
                          >
                            View Details
                          </Button>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                            variant="outline" 
                            className="h-8 px-2.5 text-xs font-semibold text-red-600 border-red-200 bg-red-50/50 hover:bg-red-100 hover:text-red-700 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal (Self-Contained Overlay) */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Order Details #{selectedOrder.id.slice(0, 8)}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Created on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                  selectedOrder.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  selectedOrder.status === 'NEW' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-purple-50 text-purple-600 border border-purple-200'
                }`}>
                  {selectedOrder.status}
                </span>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="py-4 space-y-5">
              {/* Product Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-600" /> 
                  {selectedOrder.customerInfo?.isPack ? 'Pack Bundle Information' : 'Product Information'}
                </div>

                {selectedOrder.customerInfo?.isPack ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded bg-purple-100 text-purple-700 uppercase">Pack</span>
                          <h4 className="font-bold text-slate-900 text-sm">{selectedOrder.customerInfo.packName}</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {selectedOrder.customerInfo.packSku || 'PACK'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">
                          {selectedOrder.totalPrice ?? selectedOrder.price ?? 0} DH
                        </div>
                      </div>
                    </div>
                    {/* Items inside pack */}
                    <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pack Contents:</span>
                      {(selectedOrder.customerInfo.packItems || []).map((it: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200/50">
                          <span className="font-medium">{it.productName || 'Product item'}</span>
                          <span className="font-mono text-purple-700 font-bold">× {it.quantity || 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedOrder.product?.name || 'Unknown Product'}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {selectedOrder.product?.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">
                        {selectedOrder.totalPrice ?? selectedOrder.price ?? 0} DH
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Qty: {selectedOrder.customerInfo?.quantity || selectedOrder.customerInfo?.qty || 1}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-600" /> Customer & Delivery Details
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Customer Name:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.customerInfo?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Phone Number:</span>
                    <p className="font-bold text-slate-900 mt-0.5 font-mono">{selectedOrder.customerInfo?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">City:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.customerInfo?.city || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Import Source:</span>
                    <p className="font-bold text-purple-600 mt-0.5 uppercase">{selectedOrder.customerInfo?.source || 'MANUAL'}</p>
                  </div>
                </div>

                {selectedOrder.customerInfo?.address && (
                  <div className="pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400 font-medium">Full Address:</span>
                    <p className="text-slate-800 font-medium mt-0.5">{selectedOrder.customerInfo.address}</p>
                  </div>
                )}

                {selectedOrder.customerInfo?.notes && (
                  <div className="pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400 font-medium">Customer / Internal Notes:</span>
                    <p className="text-slate-800 italic mt-0.5">{selectedOrder.customerInfo.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions footer */}
              <div className="pt-2 flex flex-wrap gap-3">
                {selectedOrder.customerInfo?.phone && (
                  <a 
                    href={`https://wa.me/${selectedOrder.customerInfo.phone.replace(/\D/g, '')}?text=Bonjour%20${encodeURIComponent(selectedOrder.customerInfo?.name || '')},%20concernant%20votre%20commande%20de%20${encodeURIComponent(selectedOrder.product?.name || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[200px]"
                  >
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 flex items-center justify-center gap-2 shadow-sm">
                      <MessageCircle className="w-4 h-4" />
                      Chat Customer on WhatsApp
                    </Button>
                  </a>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl h-11 px-4 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Lead
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedOrder(null)}
                  className="border-slate-200 rounded-xl h-11 px-5"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

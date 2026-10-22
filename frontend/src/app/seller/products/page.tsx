'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Package, Star, ExternalLink, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Input } from "@/components/ui/input";
import api from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/my');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch seller products:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.offerStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">My Products</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Manage the products in your catalog, track stock, and selling permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/seller/marketplace">
            <Button className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-5 rounded-xl">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved & Ready</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {products.filter(p => p.offerStatus === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {products.filter(p => p.offerStatus === 'PENDING').length}
          </p>
        </div>
      </div>

      <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white overflow-hidden">
        
        {/* Filters */}
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3 w-full md:w-[320px]">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Search products by name or SKU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-slate-200 rounded-xl h-10 shadow-sm font-medium text-[13px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-medium">Loading your products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {products.length === 0 ? "No products in your catalog yet" : "No products match your search"}
            </h3>
            <p className="text-slate-500 text-sm text-center max-w-sm mb-6">
              {products.length === 0 
                ? "Browse our catalog of verified winning products and click 'Add to Store' to start selling immediately."
                : "Try clearing filters or search terms."}
            </p>
            <Link href="/seller/marketplace">
              <Button className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white shadow-sm font-semibold rounded-xl h-10 px-6">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">PRODUCT</th>
                  <th className="px-5 py-3.5">CATEGORY</th>
                  <th className="px-5 py-3.5">SOURCING COST</th>
                  <th className="px-5 py-3.5">MIN SELLING PRICE</th>
                  <th className="px-5 py-3.5">STOCK</th>
                  <th className="px-5 py-3.5">APPROVAL</th>
                  <th className="px-5 py-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((p) => {
                  const sourcing = p.adminCosts || 35;
                  const minPrice = p.sellerMinimumPrice || (sourcing + 45);
                  const isApproved = p.offerStatus === 'APPROVED';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug line-clamp-1">{p.name}</p>
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-slate-600 uppercase">
                          {p.category || 'WINNING PRODUCTS'}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {sourcing} DH
                      </td>

                      <td className="px-5 py-4 font-black text-emerald-600">
                        {minPrice} DH
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800 text-xs">
                        {p.stockLevel || 1000}
                      </td>

                      <td className="px-5 py-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending Review
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link href={`/seller/marketplace/${p.id}`}>
                          <Button variant="outline" className="border-slate-200 text-slate-700 hover:text-purple-600 h-9 px-3 rounded-xl text-xs font-semibold">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </Card>
    </div>
  );
}

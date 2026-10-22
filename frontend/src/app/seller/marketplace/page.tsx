'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, Package, Eye, Lock, Check, Clock, ChevronLeft, ChevronRight, 
  ArrowRight, Sparkles, Filter
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import api from '@/lib/api';

export default function SellerMarketplacePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'browse' | 'white_label' | 'my_performance'>('browse');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedStock, setSelectedStock] = useState('ALL');
  const [sortBy, setSortBy] = useState('APPROVED_FIRST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchMarketplaceProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/marketplace');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch marketplace products:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      fetchMarketplaceProducts();
    }
  }, [status, fetchMarketplaceProducts]);

  useEffect(() => {
    const handleFocus = () => {
      if (status === 'authenticated') {
        fetchMarketplaceProducts();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status, fetchMarketplaceProducts]);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;

    const offerStatus = product.sellerOffer?.approvedStatus;
    let matchesStatus = true;
    if (selectedStatus === 'APPROVED') {
      matchesStatus = offerStatus === 'APPROVED';
    } else if (selectedStatus === 'PENDING') {
      matchesStatus = offerStatus === 'PENDING';
    } else if (selectedStatus === 'NOT_REQUESTED') {
      matchesStatus = !offerStatus;
    }

    let matchesStock = true;
    const stock = product.stockLevel ?? 1000;
    if (selectedStock === 'IN_STOCK') {
      matchesStock = stock > 50;
    } else if (selectedStock === 'LOW_STOCK') {
      matchesStock = stock <= 50;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  }).sort((a, b) => {
    if (sortBy === 'APPROVED_FIRST') {
      const aApproved = a.sellerOffer?.approvedStatus === 'APPROVED' ? 1 : 0;
      const bApproved = b.sellerOffer?.approvedStatus === 'APPROVED' ? 1 : 0;
      if (bApproved !== aApproved) return bApproved - aApproved;
    } else if (sortBy === 'PRICE_ASC') {
      const priceA = a.costPrice || a.adminCosts || 0;
      const priceB = b.costPrice || b.adminCosts || 0;
      return priceA - priceB;
    } else if (sortBy === 'PRICE_DESC') {
      const priceA = a.costPrice || a.adminCosts || 0;
      const priceB = b.costPrice || b.adminCosts || 0;
      return priceB - priceA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPaginationItems = (currentPage: number, totalPages: number): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1440px] mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Marketplace</h1>
        <p className="text-slate-400 mt-1 text-[15px]">
          Request access to products, set your selling price and start creating leads.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'browse'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab('white_label')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'white_label'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          White Label
        </button>
        <button
          onClick={() => setActiveTab('my_performance')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'my_performance'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Performance
        </button>
      </div>

      {activeTab === 'browse' && (
        <>
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input 
                type="text" 
                placeholder="Search by product name... (Enter)" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-10 rounded-xl border-slate-200 text-xs shadow-xs bg-white font-medium placeholder:text-slate-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c: any) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="NOT_REQUESTED">Not Requested</option>
            </select>

            <select
              value={selectedStock}
              onChange={(e) => {
                setSelectedStock(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs"
            >
              <option value="ALL">All Stock</option>
              <option value="IN_STOCK">In Stock (&gt;50)</option>
              <option value="LOW_STOCK">Low Stock (&le;50)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs"
            >
              <option value="APPROVED_FIRST">Approved First</option>
              <option value="NEWEST">Newest</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>

            <div className="text-xs font-semibold text-slate-500 pl-2 ml-auto">
              {filteredProducts.length} products
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#5b21b6] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-slate-400 text-xs font-semibold">Loading marketplace products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-xs">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No products match the selected criteria. Try resetting search or category filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => {
                const sourcingCost = product.costPrice || product.adminCosts || 30;
                const stock = product.stockLevel ?? 1000;
                const offerStatus = product.sellerOffer?.approvedStatus;
                const isApproved = offerStatus === 'APPROVED';
                const isPending = offerStatus === 'PENDING';

                return (
                  <Card 
                    key={product.id} 
                    className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Image Area with Badge & Centered Hover Button */}
                    <Link 
                      href={`/seller/marketplace/${product.id}`}
                      className="aspect-[4/3] bg-slate-50 relative border-b border-slate-100 flex items-center justify-center overflow-hidden block"
                    >
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <Package className="w-12 h-12 text-slate-200" />
                      )}

                      {/* Top-Left Badge */}
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs border border-slate-100/80">
                        {product.category || 'WINNING PRODUCTS'}
                      </span>

                      {/* Center Hover Pill */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform">
                          <Eye className="w-3.5 h-3.5" />
                          View details
                        </span>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <Link href={`/seller/marketplace/${product.id}`}>
                        <h3 
                          className="font-bold text-slate-900 leading-snug text-[13.5px] line-clamp-1 hover:text-[#5b21b6] transition-colors" 
                          title={product.name}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price & Stock Row */}
                      <div className="flex items-center justify-between mt-3 mb-4">
                        <span className="text-base font-black text-slate-900">
                          {sourcingCost} DH
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          {stock} left
                        </span>
                      </div>

                      {/* Action Button: Start Selling / Request Access */}
                      <div className="mt-auto">
                        {isApproved ? (
                          <Link href={`/seller/leads/create?productId=${product.id}`} className="block w-full">
                            <Button 
                              className="w-full bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-bold h-10 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Start Selling
                            </Button>
                          </Link>
                        ) : isPending ? (
                          <Link href={`/seller/marketplace/${product.id}`} className="block w-full">
                            <Button 
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              Pending Approval
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/seller/marketplace/${product.id}`} className="block w-full">
                            <Button 
                              className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold h-10 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Request Access
                            </Button>
                          </Link>
                        )}
                      </div>

                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {getPaginationItems(currentPage, totalPages).map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none">
                        ...
                      </span>
                    );
                  }
                  const page = item as number;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        currentPage === page 
                          ? 'bg-[#5b21b6] text-white shadow-xs' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab: White Label */}
      {activeTab === 'white_label' && (
        <Card className="border border-slate-100 shadow-xs rounded-3xl bg-white p-12 text-center">
          <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">White Label Solutions</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Custom formulas, branded packaging, and exclusive sourcing contracts for top-performing sellers.
          </p>
        </Card>
      )}

      {/* Tab: My Performance */}
      {activeTab === 'my_performance' && (
        <Card className="border border-slate-100 shadow-xs rounded-3xl bg-white p-12 text-center">
          <Package className="w-12 h-12 text-purple-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">My Marketplace Performance</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Track lead conversion and delivery rates for products you source from the marketplace.
          </p>
        </Card>
      )}

    </div>
  );
}

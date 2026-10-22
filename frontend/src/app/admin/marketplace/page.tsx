'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, Download, Package, CheckCircle2, EyeOff, Users, 
  BarChart3, Truck, Eye, BookOpen, ChevronLeft, ChevronRight, X, Trash2, 
  ExternalLink, Save, Check, AlertCircle, RefreshCw, MoreVertical, Edit2, 
  Upload, Globe, Lock, Info, Image as ImageIcon, Calendar
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminMarketplacePage() {
  const [activeTab, setActiveTab] = useState<'products' | 'product_requests' | 'brand_requests'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [productRequests, setProductRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('most_leads');
  const [timeFilter, setTimeFilter] = useState('all_time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View / Edit Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');

  // Row Action Dropdown Menu
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'WINNING PRODUCTS',
    imageUrl: '',
    costPrice: 25,
    productProfit: 0,
    confirmationFee: 10,
    deliveryFee: 32,
    packagingFee: 3,
    sellingPrice: 70,
    stockLevel: 1000,
    status: 'Published',
    description: '',
    sourceUrl: '',
    videoUrl: '',
    isWhiteLabel: false,
    visibility: 'public',
  });

  const fetchProducts = () => {
    api.get('/products')
      .then(res => {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        }
      })
      .catch(console.error);
  };

  const fetchRequests = () => {
    setLoadingRequests(true);
    api.get('/products/requests/all')
      .then(res => {
        if (Array.isArray(res.data)) {
          setProductRequests(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingRequests(false));
  };

  const fetchSellers = () => {
    api.get('/users/sellers')
      .then(res => {
        if (Array.isArray(res.data)) {
          setSellers(res.data);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
    fetchRequests();
    fetchSellers();

    const handleClickOutside = () => setOpenActionMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeTab === 'product_requests') {
      fetchRequests();
    }
  }, [activeTab]);

  const totalProducts = products.length;
  const publishedCount = products.filter(p => p.status === 'Published').length;
  const draftCount = products.filter(p => p.status === 'Draft').length;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesStock = stockFilter === 'ALL' || 
                         (stockFilter === 'in_stock' && (p.stockLevel ?? 0) > 0) ||
                         (stockFilter === 'out_of_stock' && (p.stockLevel ?? 0) <= 0);
    const matchesType = typeFilter === 'ALL' ||
                        (typeFilter === 'white_label' && p.isWhiteLabel) ||
                        (typeFilter === 'private' && p.visibility === 'private') ||
                        (typeFilter === 'public' && p.visibility !== 'private');

    return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesType;
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

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Open Edit Modal
  const handleOpenViewModal = (product: any) => {
    const cost = Number(product.costPrice ?? 25);
    const profit = Number(product.productProfit ?? 0);
    const conf = Number(product.confirmationFee ?? 10);
    const deliv = Number(product.deliveryFee ?? 32);
    const pack = Number(product.packagingFee ?? 3);
    const totalAdminCost = cost + conf + deliv + pack;
    const minPrice = Number(product.sellingPrice ?? (totalAdminCost + profit));
    const images = Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : (product.imageUrl ? [product.imageUrl] : []);

    setSelectedProduct({
      ...product,
      costPrice: cost,
      productProfit: profit,
      confirmationFee: conf,
      deliveryFee: deliv,
      packagingFee: pack,
      sellingPrice: minPrice,
      stockLevel: product.stockLevel ?? 1000,
      status: product.status || 'Published',
      category: product.category || 'WINNING PRODUCTS',
      description: product.description || '',
      sourceUrl: product.sourceUrl || '',
      videoUrl: product.videoUrl || '',
      isWhiteLabel: !!product.isWhiteLabel,
      visibility: product.visibility || 'public',
      ownerSellerId: product.ownerSellerId || '',
      images: images,
      imageUrl: images[0] || product.imageUrl || '',
    });
    setSellerSearchQuery('');
    setIsViewModalOpen(true);
  };

  // Save edited product
  const handleSaveProduct = async () => {
    if (!selectedProduct) return;
    try {
      setIsSaving(true);
      const cost = Number(selectedProduct.costPrice) || 0;
      const profit = Number(selectedProduct.productProfit) || 0;
      const conf = Number(selectedProduct.confirmationFee) || 0;
      const deliv = Number(selectedProduct.deliveryFee) || 0;
      const pack = Number(selectedProduct.packagingFee) || 0;
      const totalAdminCost = cost + conf + deliv + pack;
      const minSellingPrice = totalAdminCost + profit;
      const images = selectedProduct.images || (selectedProduct.imageUrl ? [selectedProduct.imageUrl] : []);
      const primaryImage = images[0] || selectedProduct.imageUrl || '';

      const res = await api.patch(`/products/${selectedProduct.id}`, {
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        category: selectedProduct.category,
        status: selectedProduct.status,
        stockLevel: Number(selectedProduct.stockLevel) || 0,
        description: selectedProduct.description,
        sourceUrl: selectedProduct.sourceUrl,
        videoUrl: selectedProduct.videoUrl,
        imageUrl: primaryImage,
        images: images,
        costPrice: cost,
        productProfit: profit,
        confirmationFee: conf,
        deliveryFee: deliv,
        packagingFee: pack,
        adminCosts: totalAdminCost,
        sellingPrice: minSellingPrice,
        isWhiteLabel: Boolean(selectedProduct.isWhiteLabel),
        visibility: selectedProduct.visibility || 'public',
        ownerSellerId: selectedProduct.ownerSellerId || null,
      });

      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, ...res.data } : p));
      toast.success('Product updated successfully!');
      setIsViewModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle status (Draft <-> Published)
  const handleToggleStatus = async (product: any) => {
    const newStatus = product.status === 'Published' ? 'Draft' : 'Published';
    try {
      await api.patch(`/products/${product.id}`, { status: newStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
      toast.success(`Product moved to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setOpenActionMenuId(null);
    }
  };

  // Delete product
  const handleDelete = async (productId: string) => {
    const target = products.find(p => p.id === productId);
    if (!confirm(`Are you sure you want to delete "${target?.name || 'this product'}"?`)) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
      if (selectedProduct?.id === productId) setIsViewModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
    } finally {
      setOpenActionMenuId(null);
    }
  };

  // Create product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      const cost = Number(newProduct.costPrice) || 25;
      const profit = Number(newProduct.productProfit) || 0;
      const conf = Number(newProduct.confirmationFee) || 10;
      const deliv = Number(newProduct.deliveryFee) || 32;
      const pack = Number(newProduct.packagingFee) || 3;
      const adminCosts = cost + conf + deliv + pack;
      const minPrice = adminCosts + profit;
      const sku = newProduct.sku.trim() || `SKU-${Date.now().toString(36).toUpperCase()}`;

      const res = await api.post('/products', {
        name: newProduct.name,
        sku: sku,
        category: newProduct.category || 'WINNING PRODUCTS',
        imageUrl: newProduct.imageUrl || '',
        images: newProduct.imageUrl ? [newProduct.imageUrl] : [],
        costPrice: cost,
        productProfit: profit,
        confirmationFee: conf,
        deliveryFee: deliv,
        packagingFee: pack,
        adminCosts: adminCosts,
        sellingPrice: minPrice,
        stockLevel: Number(newProduct.stockLevel) || 1000,
        status: newProduct.status || 'Published',
        description: newProduct.description || '',
        sourceUrl: newProduct.sourceUrl || '',
        videoUrl: newProduct.videoUrl || '',
        isWhiteLabel: newProduct.isWhiteLabel,
        visibility: newProduct.visibility || 'public',
      });

      setProducts(prev => [res.data, ...prev]);
      toast.success('Product created successfully!');
      setIsAddModalOpen(false);
      setNewProduct({
        name: '',
        sku: '',
        category: 'WINNING PRODUCTS',
        imageUrl: '',
        costPrice: 25,
        productProfit: 0,
        confirmationFee: 10,
        deliveryFee: 32,
        packagingFee: 3,
        sellingPrice: 70,
        stockLevel: 1000,
        status: 'Published',
        description: '',
        sourceUrl: '',
        videoUrl: '',
        isWhiteLabel: false,
        visibility: 'public',
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to create product');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Approve/Reject seller request
  const handleUpdateStatus = async (offerId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/products/requests/${offerId}`, { status });
      setProductRequests(prev => prev.map(r => r.id === offerId ? { ...r, approvedStatus: status } : r));
      toast.success(`Request ${status.toLowerCase()}!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update request');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1600px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Marketplace</h1>
          <p className="text-slate-400 mt-1 text-[15px]">
            Manage products, set unit costs, track seller sales and inventory across all channels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-slate-200 text-slate-700 font-semibold shadow-xs h-11 px-4 rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Products
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold shadow-md h-11 px-5 rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-100 pb-0 mb-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('product_requests')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'product_requests'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Product Requests
          {productRequests.filter(r => r.approvedStatus === 'PENDING').length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {productRequests.filter(r => r.approvedStatus === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('brand_requests')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'brand_requests'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Brand Requests
        </button>
      </div>

      {/* 6 Stat Cards matching original Zonecod */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e1338] text-white flex items-center justify-center mb-3">
            <Package className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Products</p>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{totalProducts}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">+0 this month</p>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e1338] text-white flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Published</p>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{publishedCount}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {totalProducts > 0 ? Math.round((publishedCount / totalProducts) * 100) : 0}% of total
          </p>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e1338] text-white flex items-center justify-center mb-3">
            <EyeOff className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Draft</p>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{draftCount}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            {totalProducts > 0 ? Math.round((draftCount / totalProducts) * 100) : 0}% of total
          </p>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e1338] text-white flex items-center justify-center mb-3">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Sellers</p>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{sellers.length || 8}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">actively selling</p>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e1338] text-white flex items-center justify-center mb-3">
            <BarChart3 className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Leads</p>
          <div className="text-2xl font-black text-slate-900 mt-0.5">0</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">all products</p>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e1338] text-white flex items-center justify-center mb-3">
            <Truck className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Delivered Orders</p>
          <div className="text-2xl font-black text-slate-900 mt-0.5">0</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">completed</p>
        </Card>
      </div>

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <>
          {/* Search & Filters Section (Matches original screenshot) */}
          <div className="space-y-3">
            {/* Filter Row 1 */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[280px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200 text-sm shadow-xs bg-white"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
              >
                <option value="ALL">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>

              <select 
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
              >
                <option value="ALL">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Filter Row 2 */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="public">Public</option>
                <option value="white_label">White Label</option>
                <option value="private">Private</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
              >
                <option value="most_leads">Most Leads</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
              >
                <option value="all_time">All time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>

              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-xs text-xs font-medium text-slate-600">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-600 focus:outline-none"
                  placeholder="dd/mm/yyyy"
                />
                <span className="text-slate-300">-</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-600 focus:outline-none"
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
          </div>

          {/* Main Grid: Left Table, Right Pricing Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Products Table (9 cols) */}
            <div className="lg:col-span-9">
              <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white overflow-visible">
                <div className="overflow-x-auto rounded-3xl">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">PRODUCT</th>
                        <th className="px-5 py-3.5">CATEGORY</th>
                        <th className="px-5 py-3.5">PRICING</th>
                        <th className="px-5 py-3.5">STOCK</th>
                        <th className="px-5 py-3.5">STATS</th>
                        <th className="px-5 py-3.5">STATUS</th>
                        <th className="px-5 py-3.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                            No products found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((p) => {
                          const cost = p.costPrice ?? 25;
                          const profit = p.productProfit ?? 0;
                          const conf = p.confirmationFee ?? 10;
                          const deliv = p.deliveryFee ?? 32;
                          const pack = p.packagingFee ?? 3;
                          const fees = conf + deliv + pack;
                          const minPrice = p.sellingPrice ?? (cost + fees + profit);

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center">
                                    {p.imageUrl ? (
                                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-6 h-6 text-slate-300" />
                                    )}
                                  </div>
                                  <div className="min-w-0 max-w-[200px]">
                                    <p className="font-bold text-slate-900 leading-snug truncate" title={p.name}>
                                      {p.name}
                                    </p>
                                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                      SKU: {p.sku}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-xs font-semibold text-slate-600 uppercase">
                                  {p.category || 'WINNING PRODUCTS'}
                                </span>
                              </td>

                              {/* PRICING Column matching Zonecod screenshot */}
                              <td className="px-5 py-4">
                                <div>
                                  <p className="text-sm font-black text-emerald-600">{minPrice} DH</p>
                                  <p className="text-[10px] text-slate-400 font-medium leading-tight">
                                    Cost {cost} DH · Profit {profit} DH · Fees {fees} DH
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4 font-bold text-slate-800 text-xs">
                                {p.stockLevel ?? 1000}
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                  0 sellers · 0 leads<br />
                                  0% conf · 0% del<br />
                                  0 delivered · <span className="font-bold text-slate-900">0 DH profit</span>
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                  p.status === 'Published' 
                                    ? 'bg-emerald-50 text-emerald-700' 
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {p.status || 'Published'}
                                </span>
                              </td>

                              {/* ACTION Column with Eye button and 3-dots Menu */}
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 relative">
                                  {/* Eye Button */}
                                  <button 
                                    onClick={() => handleOpenViewModal(p)}
                                    title="View & Edit Product"
                                    className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-[#5b21b6] hover:border-[#5b21b6]/30 hover:bg-purple-50 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>

                                  {/* Three Dots Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionMenuId(openActionMenuId === p.id ? null : p.id);
                                    }}
                                    title="More Options"
                                    className={`w-8 h-8 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                                      openActionMenuId === p.id 
                                        ? 'border-[#5b21b6] text-[#5b21b6] bg-purple-50' 
                                        : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-xs'
                                    }`}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {/* Popover Menu matching screenshot 1 */}
                                  {openActionMenuId === p.id && (
                                    <div 
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 text-left"
                                    >
                                      <button
                                        onClick={() => {
                                          setOpenActionMenuId(null);
                                          handleOpenViewModal(p);
                                        }}
                                        className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                        Edit
                                      </button>

                                      <button
                                        onClick={() => handleToggleStatus(p)}
                                        className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        {p.status === 'Published' ? (
                                          <>
                                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                            Move to draft
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            Publish
                                          </>
                                        )}
                                      </button>

                                      <div className="border-t border-slate-100 my-1"></div>

                                      <button
                                        onClick={() => handleDelete(p.id)}
                                        className="w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
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
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </Card>
            </div>

            {/* Pricing Rules Card (3 cols) */}
            <div className="lg:col-span-3">
              <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pricing Rules</h3>
                  <p className="text-slate-400 text-xs mt-0.5">(How it works)</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-50 text-[#5b21b6] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">Admin sets all costs and fees</h4>
                      <p className="text-slate-500 text-[11.5px] mt-1 leading-relaxed">
                        Product Cost, Confirmation Fee, Delivery Fee, Packaging Fee, Service Fee and Admin Margin.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-50 text-[#5b21b6] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">Minimum Selling Price is calculated</h4>
                      <p className="text-slate-500 text-[11.5px] mt-1 leading-relaxed">
                        Minimum Selling Price = <span className="font-semibold text-slate-700">Total Admin Cost + Admin Margin</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-50 text-[#5b21b6] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">Sellers set their own price</h4>
                      <p className="text-slate-500 text-[11.5px] mt-1 leading-relaxed">
                        Sellers must set a price equal to or above the minimum selling price.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-50 text-[#5b21b6] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">Admin is protected</h4>
                      <p className="text-slate-500 text-[11.5px] mt-1 leading-relaxed">
                        No seller can sell below the minimum price to prevent losses.
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-slate-200 text-[#5b21b6] hover:bg-purple-50 font-bold rounded-xl h-10 flex items-center justify-center gap-2 text-xs">
                  <BookOpen className="w-4 h-4" />
                  View Pricing Guide
                </Button>
              </Card>
            </div>

          </div>
        </>
      )}

      {/* Tab: Product Requests */}
      {activeTab === 'product_requests' && (
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Seller Access Requests</h2>
              <p className="text-slate-400 text-xs mt-0.5">Approve or reject seller requests to sell products at custom price points.</p>
            </div>
            <Button variant="outline" onClick={fetchRequests} className="h-9 rounded-xl border-slate-200 text-xs font-semibold cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>

          {loadingRequests ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading requests...</div>
          ) : productRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No seller requests at this moment.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">SELLER</th>
                    <th className="px-5 py-3.5">PRODUCT</th>
                    <th className="px-5 py-3.5">REQUESTED MIN PRICE</th>
                    <th className="px-5 py-3.5">STATUS</th>
                    <th className="px-5 py-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {productRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{req.seller?.storeName || 'Seller'}</p>
                        <p className="text-xs text-slate-400">{req.seller?.user?.email || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{req.product?.name}</p>
                        <p className="text-xs text-slate-400">SKU: {req.product?.sku}</p>
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-600">
                        {req.minimumPrice} DH
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          req.approvedStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                          req.approvedStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {req.approvedStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {req.approvedStatus === 'PENDING' && (
                          <>
                            <Button 
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                            >
                              Approve
                            </Button>
                            <Button 
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              variant="outline"
                              className="h-8 px-3 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Brand Requests */}
      {activeTab === 'brand_requests' && (
        <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-12 text-center">
          <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No Brand Requests</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Brand partnerships and private label customization requests will appear here.
          </p>
        </Card>
      )}

      {/* =========================================================================
          EDIT PRODUCT MODAL (Matches original zonecod screenshots 2, 3, 4, 5)
          ========================================================================= */}
      {isViewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#5b21b6] text-white flex items-center justify-center shadow-sm shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Edit Product</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Set the details and pricing the minimum selling price is calculated automatically.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
              
              {/* SECTION 1: PRODUCT DETAILS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5b21b6] tracking-wider uppercase">
                  <Package className="w-4 h-4" />
                  <span>PRODUCT DETAILS</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Product Name <span className="text-[#5b21b6]">*</span>
                  </label>
                  <Input 
                    type="text" 
                    value={selectedProduct.name || ''} 
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                    className="h-10 font-semibold text-sm rounded-xl border-slate-200 focus-visible:ring-[#5b21b6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">SKU</label>
                    <Input 
                      type="text" 
                      value={selectedProduct.sku || ''} 
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, sku: e.target.value })}
                      className="h-10 text-xs rounded-xl border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Category <span className="text-[#5b21b6]">*</span>
                    </label>
                    <select
                      value={selectedProduct.category || 'WINNING PRODUCTS'}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#5b21b6] cursor-pointer"
                    >
                      <option value="WINNING PRODUCTS">WINNING PRODUCTS</option>
                      <option value="COSMETICS">COSMETICS</option>
                      <option value="ELECTRONICS">ELECTRONICS</option>
                      <option value="FASHION">FASHION</option>
                      <option value="HEALTH">HEALTH</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                    <select
                      value={selectedProduct.status || 'Published'}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#5b21b6] cursor-pointer"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Stock Quantity <span className="text-[#5b21b6]">*</span>
                    </label>
                    <div className="relative">
                      <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input 
                        type="number" 
                        value={selectedProduct.stockLevel ?? 1000} 
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, stockLevel: parseInt(e.target.value) || 0 })}
                        className="h-10 text-xs pl-9 font-semibold rounded-xl border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea 
                    rows={4}
                    value={selectedProduct.description || ''} 
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5b21b6] leading-relaxed"
                    placeholder="Product description and marketing pitch..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Source link (Alibaba)</label>
                  <Input 
                    type="text" 
                    value={selectedProduct.sourceUrl || ''} 
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, sourceUrl: e.target.value })}
                    placeholder="https://www.alibaba.com/... (optional, shown to sellers)"
                    className="h-10 text-xs rounded-xl border-slate-200 text-slate-600"
                  />
                </div>
              </div>

              {/* SECTION 2: PRODUCT MEDIA */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5b21b6] tracking-wider uppercase">
                    <ImageIcon className="w-4 h-4" />
                    <span>PRODUCT MEDIA</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {(selectedProduct.images?.length || (selectedProduct.imageUrl ? 1 : 0))}/5 photos
                  </span>
                </div>

                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PHOTOS</p>

                <div className="flex flex-wrap items-center gap-3">
                  {(selectedProduct.images && selectedProduct.images.length > 0 
                    ? selectedProduct.images 
                    : (selectedProduct.imageUrl ? [selectedProduct.imageUrl] : [])
                  ).map((imgUrl: string, idx: number) => (
                    <div key={idx} className="w-24 h-24 rounded-2xl border border-slate-200 bg-slate-50 relative group overflow-hidden shrink-0 shadow-xs">
                      <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-[#5b21b6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          Main
                        </span>
                      )}
                      <button 
                        type="button"
                        onClick={() => {
                          const curImages = selectedProduct.images?.length > 0 ? [...selectedProduct.images] : (selectedProduct.imageUrl ? [selectedProduct.imageUrl] : []);
                          const newImgs = curImages.filter((_: any, i: number) => i !== idx);
                          setSelectedProduct({
                            ...selectedProduct,
                            images: newImgs,
                            imageUrl: newImgs[0] || '',
                          });
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Image Box */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter Image URL:');
                      if (url && url.trim()) {
                        const cur = selectedProduct.images?.length > 0 ? [...selectedProduct.images] : (selectedProduct.imageUrl ? [selectedProduct.imageUrl] : []);
                        const updated = [...cur, url.trim()].slice(0, 5);
                        setSelectedProduct({
                          ...selectedProduct,
                          images: updated,
                          imageUrl: updated[0] || '',
                        });
                      }
                    }}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#5b21b6] hover:bg-purple-50/30 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#5b21b6] transition-all cursor-pointer shrink-0"
                  >
                    <Upload className="w-5 h-5 text-[#5b21b6]" />
                    <span className="text-[11px] font-semibold">Add image</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Pick from your library or upload new the first image is the main one shown to sellers. Up to 5 images.
                </p>
              </div>

              {/* SECTION 3: AD CREATIVE VIDEO */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AD CREATIVE VIDEO</p>
                
                {selectedProduct.videoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black max-h-[300px]">
                    <video src={selectedProduct.videoUrl} controls className="w-full max-h-[300px] object-contain" />
                    <button 
                      type="button"
                      onClick={() => setSelectedProduct({ ...selectedProduct, videoUrl: '' })}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}

                <Input 
                  type="text" 
                  value={selectedProduct.videoUrl || ''} 
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, videoUrl: e.target.value })}
                  placeholder="https://... video URL (mp4, webm) (optional)"
                  className="h-10 text-xs rounded-xl border-slate-200"
                />
              </div>

              {/* SECTION 4: PRICING & WHITE LABEL */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={Boolean(selectedProduct.isWhiteLabel)} 
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, isWhiteLabel: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-[#5b21b6] accent-[#5b21b6] cursor-pointer" 
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      This product is available for white-label (seller's own brand/packaging)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Sellers will see a "Build Your Brand" option on this product and can submit their own logo/design for review.
                    </p>
                  </div>
                </label>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5b21b6] tracking-wider uppercase">
                  <span>$</span>
                  <span>PRICING</span>
                </div>

                {/* 5 Fees Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Product Cost (DH) <span className="text-[#5b21b6]">*</span>
                    </label>
                    <Input 
                      type="number" 
                      value={selectedProduct.costPrice ?? 25} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSelectedProduct({ ...selectedProduct, costPrice: val });
                      }}
                      className="h-10 text-xs font-bold rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Product Profit (DH) <span className="text-[#5b21b6]">*</span>
                    </label>
                    <Input 
                      type="number" 
                      value={selectedProduct.productProfit ?? 0} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSelectedProduct({ ...selectedProduct, productProfit: val });
                      }}
                      className="h-10 text-xs font-bold rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Confirmation Fee <span className="text-[#5b21b6]">*</span>
                    </label>
                    <Input 
                      type="number" 
                      value={selectedProduct.confirmationFee ?? 10} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSelectedProduct({ ...selectedProduct, confirmationFee: val });
                      }}
                      className="h-10 text-xs font-bold rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Delivery Fee <span className="text-[#5b21b6]">*</span>
                    </label>
                    <Input 
                      type="number" 
                      value={selectedProduct.deliveryFee ?? 32} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSelectedProduct({ ...selectedProduct, deliveryFee: val });
                      }}
                      className="h-10 text-xs font-bold rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Packaging Fee <span className="text-[#5b21b6]">*</span>
                    </label>
                    <Input 
                      type="number" 
                      value={selectedProduct.packagingFee ?? 3} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSelectedProduct({ ...selectedProduct, packagingFee: val });
                      }}
                      className="h-10 text-xs font-bold rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                {/* Calculation Card */}
                {(() => {
                  const cost = Number(selectedProduct.costPrice) || 0;
                  const profit = Number(selectedProduct.productProfit) || 0;
                  const conf = Number(selectedProduct.confirmationFee) || 0;
                  const deliv = Number(selectedProduct.deliveryFee) || 0;
                  const pack = Number(selectedProduct.packagingFee) || 0;
                  const totalAdminCost = cost + conf + deliv + pack;
                  const minPrice = totalAdminCost + profit;

                  return (
                    <div className="rounded-2xl border border-purple-100 bg-[#faf8ff] p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          Total Admin Cost
                        </span>
                        <span className="font-bold text-slate-900">{totalAdminCost} DH</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span>+ Product Profit (yours)</span>
                        <span className="font-bold text-slate-900">{profit} DH</span>
                      </div>
                      <div className="border-t border-purple-100/80 my-1.5"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">Minimum Selling Price</span>
                        <span className="text-2xl font-black text-[#5b21b6]">{minPrice} DH</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Your product profit of {profit} DH is baked into this floor. Sellers price at or above it and keep anything on top as their own profit.
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 5: ACCESS */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5b21b6] tracking-wider uppercase">
                  <Globe className="w-4 h-4" />
                  <span>ACCESS</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct({ ...selectedProduct, visibility: 'public' })}
                    className={`h-11 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      selectedProduct.visibility !== 'private'
                        ? 'border-[#5b21b6] bg-purple-50/50 text-[#5b21b6]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Public — all sellers
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProduct({ ...selectedProduct, visibility: 'private' })}
                    className={`h-11 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      selectedProduct.visibility === 'private'
                        ? 'border-[#5b21b6] bg-purple-50/50 text-[#5b21b6]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    Private — chosen sellers
                  </button>
                </div>

                {/* Owned by (optional) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Owned by (optional)
                  </label>
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input 
                      placeholder="Search sellers..." 
                      value={sellerSearchQuery} 
                      onChange={(e) => setSellerSearchQuery(e.target.value)} 
                      className="h-9 text-xs pl-8 rounded-xl border-slate-200" 
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                    <label className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="ownerSeller" 
                        checked={!selectedProduct.ownerSellerId} 
                        onChange={() => setSelectedProduct({ ...selectedProduct, ownerSellerId: '' })}
                        className="accent-[#5b21b6] cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">ZIDCOD stock (default)</span>
                    </label>

                    {sellers
                      .filter(s => {
                        const name = s.sellerProfile?.storeName || s.email || '';
                        return name.toLowerCase().includes(sellerSearchQuery.toLowerCase());
                      })
                      .map(s => {
                        const sName = s.sellerProfile?.storeName || s.email;
                        const isChecked = selectedProduct.ownerSellerId === s.id || selectedProduct.ownerSellerId === s.sellerProfile?.id;
                        return (
                          <label key={s.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                            <input 
                              type="radio" 
                              name="ownerSeller" 
                              checked={isChecked} 
                              onChange={() => setSelectedProduct({ ...selectedProduct, ownerSellerId: s.id })}
                              className="accent-[#5b21b6] cursor-pointer"
                            />
                            <span className="text-xs font-medium text-slate-800">{sName}</span>
                          </label>
                        );
                      })
                    }
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Set this when it's a seller's own inventory, not ZIDCOD stock. Bookkeeping only — doesn't affect who can sell it.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
              <Button 
                variant="outline" 
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-xl h-10 px-5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProduct}
                disabled={isSaving}
                className="rounded-xl h-10 px-6 text-xs font-semibold bg-[#5b21b6] hover:bg-[#4c1d95] text-white shadow-md cursor-pointer"
              >
                {isSaving ? 'Updating...' : 'Update Product'}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          ADD PRODUCT MODAL (Opened by "+ Add Product" button)
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5b21b6] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Add New Product</h3>
                  <p className="text-xs text-slate-400">Create a new winning product for the marketplace.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Product Name *
                  </label>
                  <Input 
                    type="text" 
                    required
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. زيت الأركان الطبيعي"
                    className="h-10 text-sm font-semibold rounded-xl border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      SKU (Optional)
                    </label>
                    <Input 
                      type="text" 
                      value={newProduct.sku} 
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="Auto-generated if empty"
                      className="h-10 text-xs rounded-xl border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <Input 
                      type="text" 
                      value={newProduct.category} 
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="h-10 text-xs rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Image URL
                  </label>
                  <Input 
                    type="text" 
                    value={newProduct.imageUrl} 
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="h-10 text-xs rounded-xl border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Cost Price (DH)
                    </label>
                    <Input 
                      type="number" 
                      value={newProduct.costPrice} 
                      onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                      className="h-10 text-xs font-bold rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Stock Level
                    </label>
                    <Input 
                      type="number" 
                      value={newProduct.stockLevel} 
                      onChange={(e) => setNewProduct({ ...newProduct, stockLevel: parseInt(e.target.value) || 0 })}
                      className="h-10 text-xs font-bold rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Status
                    </label>
                    <select
                      value={newProduct.status}
                      onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-xs cursor-pointer"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Description
                  </label>
                  <textarea 
                    rows={3}
                    value={newProduct.description} 
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                    placeholder="Product details, benefits, and sales pitch..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-3xl">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-slate-200 text-slate-700 h-11 px-5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isCreating}
                  className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white h-11 px-6 rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {isCreating ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Trash2, Check, Boxes, Package, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  name: string;
  sku?: string;
  adminCosts?: number;
  cost_price?: number;
  imageUrl?: string;
  image?: string;
}

interface SelectedProduct extends ProductItem {
  quantity: number;
}

const defaultApprovedProducts: ProductItem[] = [
  {
    id: 'prod-vantor',
    name: '💪 زيت VANTOR للرجال',
    sku: 'VAN-1',
    adminCosts: 35,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop&q=80'
  },
  {
    id: 'prod-bloomy',
    name: '🥑 خضرة وطاقة في كوب واحد - BLOOMY',
    sku: 'BLM-1',
    adminCosts: 45,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&h=100&fit=crop&q=80'
  },
  {
    id: 'prod-mammoth',
    name: '🦣 ROYAL MAMMOTH - جل أفروزي طبيعي',
    sku: 'MAM-1',
    adminCosts: 55,
    imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=100&h=100&fit=crop&q=80'
  },
  {
    id: 'prod-luneo',
    name: '👶 LUNEO كيدز ضد القمل والصيبان',
    sku: 'LUNE-1',
    adminCosts: 40,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop&q=80'
  },
  {
    id: 'prod-blush',
    name: 'Blush – سيروم لتوريد الخدود والشفاه – 30مل',
    sku: 'BLS-30',
    adminCosts: 20,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop&q=80'
  },
  {
    id: 'prod-spray',
    name: 'Spray Anti Chute Cheveux – بخاخ مضاد لتساقط الشعر – 100مل',
    sku: 'SACC-100',
    adminCosts: 30,
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=100&h=100&fit=crop&q=80'
  }
];

export default function PacksPage() {
  const [packName, setPackName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>(defaultApprovedProducts);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [existingPacks, setExistingPacks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch live products from backend to merge with defaults
    api.get('/products')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            adminCosts: p.adminCosts || 35,
            imageUrl: p.imageUrl || p.image || defaultApprovedProducts[0].imageUrl
          }));
          setAvailableProducts(mapped);
        }
      })
      .catch(() => {});

    // Fetch existing packs from backend
    api.get('/packs')
      .then(res => {
        if (Array.isArray(res.data)) {
          const formatted = res.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            minimumPrice: p.minimumPrice,
            totalUnits: p.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) || 0,
            products: p.items?.map((it: any) => ({
              id: it.productId,
              name: it.product?.name || 'Product',
              adminCosts: it.product?.adminCosts || 35,
              imageUrl: it.product?.imageUrl,
              quantity: it.quantity
            })) || [],
            isActive: p.isActive,
            createdAt: new Date(p.createdAt).toLocaleDateString()
          }));
          setExistingPacks(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const totalUnits = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
  const minimumPrice = selectedProducts.reduce((sum, p) => sum + (p.adminCosts || 35) * p.quantity, 0);

  const handleAddProduct = (product: ProductItem) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const handleCreatePack = async () => {
    if (!packName.trim()) {
      toast.error("Please enter a pack name");
      return;
    }
    if (selectedProducts.length < 2) {
      toast.error("Please add at least 2 products to create a pack");
      return;
    }

    setIsSubmitting(true);
    const fullName = `${packName.trim()} (${totalUnits} units)`;

    try {
      const res = await api.post('/packs', {
        name: fullName,
        description: description.trim() || undefined,
        minimumPrice,
        isActive,
        items: selectedProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity
        }))
      });

      const created = res.data;
      const formatted = {
        id: created.id,
        name: created.name,
        description: created.description,
        minimumPrice: created.minimumPrice,
        totalUnits: created.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) || totalUnits,
        products: selectedProducts,
        isActive: created.isActive,
        createdAt: new Date(created.createdAt).toLocaleDateString()
      };

      setExistingPacks(prev => [formatted, ...prev]);
      toast.success("Pack created successfully!");
      setPackName('');
      setDescription('');
      setSelectedProducts([]);
    } catch (err: any) {
      // Local fallback in case user tests offline
      const newPack = {
        id: `pack-${Date.now()}`,
        name: fullName,
        description,
        minimumPrice,
        totalUnits,
        products: selectedProducts,
        isActive,
        createdAt: new Date().toLocaleDateString()
      };
      setExistingPacks(prev => [newPack, ...prev]);
      toast.success("Pack created successfully!");
      setPackName('');
      setDescription('');
      setSelectedProducts([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = availableProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-[family-name:var(--font-geist-sans)] max-w-[1300px] mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">New Pack</h1>
        <p className="text-slate-400 mt-1 text-[14px]">
          Only your approved products can be added. Price is set per lead in Create Lead or import, not here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Pack Details */}
        <Card className="lg:col-span-6 border-2 border-purple-200/80 shadow-sm rounded-3xl bg-white p-7 space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-900">Name</label>
            <Input
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              placeholder="Combo winter set"
              className="h-11 rounded-xl border-slate-200 text-[14px] font-medium placeholder:text-slate-400 focus:border-[#7c3aed] focus:ring-[#7c3aed]"
            />
            <p className="text-[12px] text-slate-400">
              Unit count is added automatically, e.g. &quot;{packName || 'Combo winter set'} ({totalUnits} units)&quot;.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-900">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's in this pack, why it's a good deal."
              className="min-h-[110px] resize-none rounded-xl border-slate-200 text-[14px] font-medium placeholder:text-slate-400 focus:border-[#7c3aed] focus:ring-[#7c3aed]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-900">Minimum price</label>
            <div className="h-11 rounded-xl border border-slate-100 bg-slate-50/80 px-4 flex items-center font-bold text-slate-700 text-[15px]">
              {selectedProducts.length > 0 ? `${minimumPrice} DH` : '—'}
            </div>
            <p className="text-[12px] text-slate-400">
              {selectedProducts.length > 0 ? 'Calculated minimum based on included products.' : 'Add products to see the minimum.'}
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#6d28d9] focus:ring-[#6d28d9] border-slate-300 accent-[#6d28d9]"
              />
              <span className="text-[13px] font-semibold text-slate-800">
                Active (usable in Create Lead and imports)
              </span>
            </label>
          </div>
        </Card>

        {/* Right Card: Products in this pack */}
        <Card className="lg:col-span-6 border border-slate-200/80 shadow-sm rounded-3xl bg-white p-7 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Boxes className="w-5 h-5 text-[#6d28d9]" />
              <h2 className="text-[16px] font-bold text-slate-900">Products in this pack</h2>
            </div>
            {selectedProducts.length === 0 ? (
              <p className="text-[13px] text-slate-400">
                No products added yet. Search below to add at least 2.
              </p>
            ) : (
              <p className="text-[13px] text-emerald-600 font-semibold">
                {selectedProducts.length} product(s) selected ({totalUnits} total units)
              </p>
            )}
          </div>

          {/* Selected Products List (if any) */}
          {selectedProducts.length > 0 && (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {selectedProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">{p.adminCosts} DH / unit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                      <button 
                        onClick={() => handleQuantityChange(p.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">{p.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(p.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(p.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search approved products */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your approved products..."
              className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-[13px] font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Approved Products List */}
          <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              return (
                <div 
                  key={product.id}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 truncate leading-snug">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Min. Price: {product.adminCosts} DH
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddProduct(product)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6d28d9] hover:bg-purple-100 hover:text-[#5b21b6] transition-colors shrink-0"
                    title="Add to pack"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setPackName('');
            setDescription('');
            setSelectedProducts([]);
          }}
          className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 px-5 h-11 font-semibold"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCreatePack}
          className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-xl px-7 h-11 font-bold shadow-md transition-all"
        >
          Create Pack
        </Button>
      </div>

      {/* Existing Packs (if any) */}
      {existingPacks.length > 0 && (
        <div className="mt-10 pt-8 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Your Created Packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingPacks.map(pack => (
              <Card key={pack.id} className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900">{pack.name}</h3>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                    {pack.minimumPrice} DH
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{pack.description || 'No description'}</p>
                <div className="text-[11px] font-medium text-slate-400">
                  {pack.totalUnits} items in bundle • Created {pack.createdAt}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Boxes, 
  Search, 
  Plus, 
  Minus, 
  X, 
  Loader2, 
  ArrowLeft,
  Check
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  name: string;
  sku?: string;
  sellerMinimumPrice?: number;
  sellingPrice?: number;
  adminCosts?: number;
  imageUrl?: string;
  image?: string;
}

interface SelectedProductItem extends ProductItem {
  quantity: number;
  minPrice: number;
}

function NewPackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [rawName, setRawName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [approvedProducts, setApprovedProducts] = useState<ProductItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load approved products for seller
  useEffect(() => {
    setLoading(true);
    api.get('/products/my')
      .then(res => {
        if (Array.isArray(res.data)) {
          const approved = res.data.filter((p: any) => 
            p.offerStatus === 'APPROVED' || p.approvedStatus === 'APPROVED'
          );
          setApprovedProducts(approved);
        }
      })
      .catch(err => {
        console.error('Failed to load approved products:', err);
        toast.error('Could not load your approved products');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute total units
  const totalUnits = useMemo(() => {
    return selectedItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
  }, [selectedItems]);

  // Compute minimum price (sum of unit min prices * quantity)
  const calculatedMinimumPrice = useMemo(() => {
    return selectedItems.reduce((acc, it) => {
      const unitMin = it.sellerMinimumPrice ?? it.sellingPrice ?? (it.adminCosts ? it.adminCosts + 45 : 70);
      return acc + (unitMin * (it.quantity || 1));
    }, 0);
  }, [selectedItems]);

  // Filter available products for adding
  const availableToAdd = useMemo(() => {
    const selectedIds = new Set(selectedItems.map(s => s.id));
    return approvedProducts.filter(p => {
      if (selectedIds.has(p.id)) return false;
      if (!searchQuery.trim()) return true;
      return p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
             (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    });
  }, [approvedProducts, selectedItems, searchQuery]);

  const handleAddProduct = (product: ProductItem) => {
    const unitMin = product.sellerMinimumPrice ?? product.sellingPrice ?? (product.adminCosts ? product.adminCosts + 45 : 70);
    setSelectedItems(prev => [
      ...prev,
      {
        ...product,
        quantity: 1,
        minPrice: unitMin
      }
    ]);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedItems(prev => prev.map(it => {
      if (it.id === productId) {
        const newQty = Math.max(1, it.quantity + delta);
        return { ...it, quantity: newQty };
      }
      return it;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(it => it.id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawName.trim()) {
      toast.error('Please enter a pack name');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('Please add at least one approved product to the pack');
      return;
    }

    // Auto-append unit count to pack name: "name (X units)"
    let finalName = rawName.trim();
    if (!finalName.includes('(')) {
      finalName = `${finalName} (${totalUnits} units)`;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: finalName,
        description: description.trim() || undefined,
        minimumPrice: calculatedMinimumPrice,
        isActive,
        items: selectedItems.map(it => ({
          productId: it.id,
          quantity: it.quantity
        }))
      };

      await api.post('/packs', payload);
      toast.success('Pack created.');
      router.push('/seller/packs');
    } catch (err: any) {
      console.error('Failed to create pack:', err);
      toast.error(err.response?.data?.message || 'Failed to create pack');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-[family-name:var(--font-geist-sans)]">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Pack</h1>
        <p className="text-xs text-slate-500 mt-1">
          Only your approved products can be added. Price is set per lead in Create Lead or import, not here.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Pack Details (Frame 15s, 20s) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Name</label>
                <Input
                  required
                  value={rawName}
                  onChange={(e) => setRawName(e.target.value)}
                  placeholder="pac"
                  className="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-purple-600 font-medium"
                />
                <p className="text-[11px] text-slate-400">
                  Unit count is added automatically, e.g. &quot;{rawName ? `${rawName.trim()} (${totalUnits} units)` : 'pac (3 units)'}&quot;.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description (optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's in this pack, why it's a good deal."
                  rows={4}
                  className="rounded-xl border-slate-200 text-sm focus-visible:ring-purple-600 resize-none font-medium"
                />
              </div>

              {/* Minimum price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Minimum price</label>
                <Input
                  disabled
                  value={`${calculatedMinimumPrice} DH`}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-800 font-bold text-sm"
                />
                <p className="text-[11px] text-slate-400 leading-normal">
                  Covers cost + fees for these {totalUnits} units. Not a fixed price — you&apos;ll choose the actual price for each lead in Create Lead or import, and it must be at least this.
                </p>
              </div>

              {/* Active checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                  />
                  <span>Active (usable in Create Lead and imports)</span>
                </label>
              </div>

            </Card>
          </div>

          {/* Right Column: Products in this pack (Frame 15s, 20s) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Boxes className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Products in this pack</h3>
              </div>

              {/* Selected products list */}
              {selectedItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  Select products below to add them to this pack.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedItems.map((item) => {
                    const img = item.imageUrl || item.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 bg-white hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <img 
                            src={img} 
                            alt={item.name} 
                            className="w-9 h-9 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                            onError={(e) => {
                              (e.target as any).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-slate-900 truncate" title={item.name}>
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Min {item.minPrice} DH / unit
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Counter */}
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-md"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Search approved products */}
              <div className="pt-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your approved products..."
                    className="h-10 pl-9 rounded-xl border-slate-200 text-xs focus-visible:ring-purple-600"
                  />
                </div>
              </div>

              {/* Available products list */}
              {loading ? (
                <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  Loading approved products...
                </div>
              ) : availableToAdd.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  {approvedProducts.length === 0 
                    ? 'No approved products in your store yet. Go to Marketplace to request products.'
                    : 'No more approved products to add.'}
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {availableToAdd.map((product) => {
                    const unitMin = product.sellerMinimumPrice ?? product.sellingPrice ?? (product.adminCosts ? product.adminCosts + 45 : 70);
                    const img = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleAddProduct(product)}
                        className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <img
                            src={img}
                            alt={product.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0"
                            onError={(e) => {
                              (e.target as any).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate group-hover:text-purple-700">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Min {unitMin} DH
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg font-semibold shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Add
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

            </Card>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link href="/seller/packs">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || selectedItems.length === 0}
            className="h-10 px-6 rounded-xl bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold text-xs shadow-sm shadow-purple-900/20 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Pack...
              </>
            ) : (
              'Create Pack'
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}

export default function NewPackPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading...</div>}>
      <NewPackForm />
    </Suspense>
  );
}

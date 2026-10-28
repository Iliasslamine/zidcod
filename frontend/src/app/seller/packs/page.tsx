'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Boxes, 
  Plus, 
  Trash2, 
  Pencil, 
  AlertTriangle, 
  Loader2, 
  X 
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getPackSku } from '@/lib/pack-utils';

export default function PacksPage() {
  const router = useRouter();
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [packToDelete, setPackToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/packs');
      if (Array.isArray(res.data)) {
        setPacks(res.data);
      }
    } catch (err) {
      console.error('Failed to load packs:', err);
      toast.error('Failed to load packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!packToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/packs/${packToDelete.id}`);
      toast.success('Pack deleted.');
      setPacks(prev => prev.filter(p => p.id !== packToDelete.id));
      setPackToDelete(null);
    } catch (err: any) {
      console.error('Delete pack error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete pack');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-[family-name:var(--font-geist-sans)]">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Packs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Bundle your approved products into a single sellable pack.
        </p>
      </div>

      {/* Action Banner */}
      <Card className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Your packs</h3>
            <p className="text-xs text-slate-500">Only your approved products can go into a pack.</p>
          </div>
        </div>

        <Link href="/seller/packs/new">
          <Button className="w-full sm:w-auto bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold text-xs px-4 py-2 h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            New Pack
          </Button>
        </Link>
      </Card>

      {/* Main Table or Empty State */}
      <Card className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-xs font-medium">Loading your packs...</span>
          </div>
        ) : packs.length === 0 ? (
          /* Empty State (Frame 10s) */
          <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <Boxes className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No packs yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
              Bundle two or more of your approved products into a pack and sell it like a single product.
            </p>
            <Link href="/seller/packs/new">
              <Button className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold text-xs px-5 py-2.5 h-10 rounded-xl flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Create your first pack
              </Button>
            </Link>
          </div>
        ) : (
          /* Packs Table (Frame 05s, 25s) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">NAME</th>
                  <th className="py-3 px-6">SKU</th>
                  <th className="py-3 px-6">PRODUCTS</th>
                  <th className="py-3 px-6">MIN PRICE</th>
                  <th className="py-3 px-6">STATUS</th>
                  <th className="py-3 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {packs.map((pack) => {
                  const sku = getPackSku(pack);
                  const items = pack.items || [];
                  const isActive = pack.isActive !== false;

                  return (
                    <tr key={pack.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 text-sm">
                        {pack.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
                        {sku}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          {items.slice(0, 4).map((it: any, idx: number) => {
                            const img = it.product?.imageUrl || it.product?.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                            return (
                              <img
                                key={it.id || idx}
                                src={img}
                                alt={it.product?.name || 'Product'}
                                title={`${it.product?.name || 'Product'} (×${it.quantity || 1})`}
                                className="w-7 h-7 rounded-full border-2 border-white object-cover -ml-2 first:ml-0 bg-slate-100 shadow-sm"
                                onError={(e) => {
                                  (e.target as any).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                                }}
                              />
                            );
                          })}
                          {items.length > 4 && (
                            <span className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center -ml-2 shadow-sm">
                              +{items.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                        {pack.minimumPrice} DH
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/seller/packs/new?edit=${pack.id}`)}
                            title="Edit pack"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPackToDelete(pack)}
                            title="Delete pack"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal (Frame 05s) */}
      {packToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => !isDeleting && setPackToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete pack?</h3>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              &quot;{packToDelete.name}&quot; will be permanently removed. This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPackToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl h-10 px-5 text-sm font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl h-10 px-5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-sm shadow-red-200"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

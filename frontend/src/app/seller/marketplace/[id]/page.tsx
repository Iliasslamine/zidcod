'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Download, ExternalLink, Info, AlertCircle, ChevronLeft, 
  CheckCircle2, Clock, Check, Lock, Sparkles, Package, ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function SellerProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(0);

  const fetchProductDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      const baseCost = res.data.costPrice ?? res.data.adminCosts ?? 25;
      const fees = (res.data.confirmationFee ?? 10) + (res.data.deliveryFee ?? 32) + (res.data.packagingFee ?? 3);
      const minPrice = Math.max(res.data.sellingPrice || 0, baseCost + fees);
      setCustomPrice(res.data.sellerOffer?.minimumPrice || minPrice);
    } catch (e) {
      console.error('Error fetching product:', e);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (status !== 'loading' && id) {
      fetchProductDetails();
    }
  }, [status, id, fetchProductDetails]);

  useEffect(() => {
    const handleFocus = () => {
      if (status === 'authenticated' && id) {
        fetchProductDetails();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status, id, fetchProductDetails]);

  const baseCost = product?.costPrice ?? product?.adminCosts ?? 25;
  const confFee = product?.confirmationFee ?? 10;
  const delivFee = product?.deliveryFee ?? 32;
  const packFee = product?.packagingFee ?? 3;
  const totalFees = confFee + delivFee + packFee;
  const calculatedMinPrice = product ? Math.max(product.sellingPrice || 0, baseCost + totalFees) : 0;

  const handleRequestAccess = async () => {
    if (!product) return;
    if (customPrice < calculatedMinPrice) {
      toast.error(`Planned price must be at least ${calculatedMinPrice} DH`);
      return;
    }
    try {
      setRequesting(true);
      const res = await api.post(`/products/${product.id}/request`, {
        minimumPrice: Number(customPrice),
      });

      setProduct((prev: any) => ({
        ...prev,
        sellerOffer: res.data || { approvedStatus: 'PENDING', minimumPrice: customPrice }
      }));

      toast.success('Access requested! Your request was sent to admin for approval.');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to request access.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#5b21b6] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-xs font-semibold">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>Product not found.</p>
        <Button onClick={() => router.push('/seller/marketplace')} className="mt-4">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const offer = product.sellerOffer;
  const isApproved = offer?.approvedStatus === 'APPROVED';
  const isPending = offer?.approvedStatus === 'PENDING';
  const isRejected = offer?.approvedStatus === 'REJECTED';

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 font-[family-name:var(--font-geist-sans)] animate-in fade-in zoom-in duration-500 pb-16">
      
      {/* Back button */}
      <button 
        onClick={() => router.push('/seller/marketplace')}
        className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Marketplace
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Product Image */}
        <div className="w-full lg:w-1/2 aspect-[4/5] bg-slate-50 relative rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex items-center justify-center">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <Package className="w-20 h-20 text-slate-200" />
          )}

          <Button 
            variant="outline" 
            onClick={() => {
              if (product.imageUrl) window.open(product.imageUrl, '_blank');
            }}
            className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm border-0 shadow-md hover:bg-white text-xs font-bold rounded-xl h-10 px-4 cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Photo
          </Button>
        </div>
        
        {/* Right Side: Details & Actions */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          <div className="bg-purple-100 text-purple-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start inline-flex">
            {product.category || 'WINNING PRODUCTS'}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
            {product.name}
          </h1>
          
          {/* Min Selling Price & Stock Highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-center">
              <p className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>🏷️</span> MIN. SELLING PRICE
              </p>
              <p className="text-3xl font-black text-[#5b21b6]">{calculatedMinPrice} DH</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Your price must be &ge; this amount</p>
            </div>

            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-center">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>📦</span> STOCK
              </p>
              <p className="text-3xl font-black text-emerald-600">{product.stockLevel ?? 1000}</p>
              <p className="text-xs text-emerald-600/70 mt-1 font-medium">Units available in warehouse</p>
            </div>
          </div>

          {/* Meta specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">SKU</p>
              <p className="text-xs font-mono font-bold text-slate-700 truncate">{product.sku}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">REFERENCE</p>
              <p className="text-xs font-bold text-slate-700">PRD-{product.id.substring(0,8).toUpperCase()}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">CATEGORY</p>
              <p className="text-xs font-bold text-slate-700 truncate">{product.category || 'WINNING'}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">PHOTOS</p>
              <p className="text-xs font-bold text-slate-700">1 High-Res</p>
            </div>
          </div>

          {/* How Minimum Price is Calculated Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 text-[11px]">💰</span>
              How the minimum price is calculated
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Product sourcing cost</span>
                <span className="font-bold text-slate-800">{baseCost} DH</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Call Center confirmation fee</span>
                <span className="font-bold text-slate-800">{confFee} DH</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping &amp; delivery fee</span>
                <span className="font-bold text-slate-800">{delivFee} DH</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Packaging &amp; handling fee</span>
                <span className="font-bold text-slate-800">{packFee} DH</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between font-extrabold text-slate-900 text-base">
                <span>Min. Selling Price</span>
                <span className="text-[#5b21b6]">{calculatedMinPrice} DH</span>
              </div>
            </div>

            <div className="bg-amber-50 text-amber-800 p-3.5 rounded-xl text-xs font-medium border border-amber-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <p>Fees are only deducted when the order is <span className="font-bold">delivered</span>. Nothing is cut until delivery is confirmed.</p>
            </div>
          </div>

          {/* REQUEST ACCESS & START SELLING ACTION CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
            {isApproved ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Access Approved by Admin</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      You are authorized to sell this product at or above {offer.minimumPrice} DH.
                    </p>
                  </div>
                </div>
                <Link href={`/seller/leads/create?productId=${product.id}`} className="block w-full">
                  <Button 
                    className="w-full bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-bold h-12 rounded-xl text-base shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-5 h-5" />
                    Start Creating Leads
                  </Button>
                </Link>
              </div>
            ) : isPending ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Access Request Pending Review</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Your request has been submitted to the admin team for approval. Once approved, you can start selling immediately.
                    </p>
                  </div>
                </div>
                <Button 
                  disabled 
                  className="w-full bg-amber-500 text-white font-bold h-12 rounded-xl text-base opacity-90 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  Request Pending Admin Approval
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {isRejected && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Previous Request Declined</p>
                      <p className="text-xs text-rose-700 mt-0.5">
                        The admin was unable to approve your previous price point. You can submit an updated planned selling price below.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-bold text-slate-800">Ready to sell this product?</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Request access from the admin team. Once approved, you can set your selling price and begin pushing orders.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Your Planned Minimum Selling Price (DH)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      value={customPrice || ''}
                      onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                      className="h-11 rounded-xl text-sm font-bold border-slate-200"
                    />
                    <span className="font-black text-slate-700 text-sm">DH</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Must be at least {calculatedMinPrice} DH to cover sourcing &amp; fulfillment.
                  </p>
                </div>

                <Button 
                  onClick={handleRequestAccess}
                  disabled={requesting || customPrice < calculatedMinPrice}
                  className="w-full bg-[#5b21b6] hover:bg-[#4c1d95] text-white rounded-xl shadow-md font-bold h-12 text-base cursor-pointer"
                >
                  {requesting ? 'Sending Request...' : isRejected ? 'Re-submit Access Request' : 'Request Access'}
                </Button>
              </div>
            )}
          </div>

          {/* Canva Link */}
          {product.canvaLink && (
            <a 
              href={product.canvaLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between group hover:border-purple-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7c3aed] flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors">
                    Design on Canva 
                    <span className="text-slate-400 font-normal ml-1.5 text-xs">(create ad creatives &amp; posts)</span>
                  </p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400 rotate-180" />
            </a>
          )}

          {/* Description */}
          {product.description && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                Description
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap" dir="auto">
                {product.description}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, 
  Boxes, 
  Package, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  Loader2, 
  User, 
  Phone, 
  MapPin, 
  Sparkles,
  Search
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getPackSku } from '@/lib/pack-utils';

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 
  'Meknes', 'Oujda', 'Kenitra', 'Tetouan', 'Sale', 'Temara', 
  'Mohammedia', 'El Jadida', 'Nador', 'Safi', 'Beni Mellal', 
  'Khouribga', 'Taza', 'Khemisset', 'Guelmim', 'Berrechid', 
  'Taourirt', 'Errachidia', 'Taroudant', 'Ouarzazate', 'Larache'
];

function CreateLeadWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('productId');

  // Wizard Step: 1 = Product, 2 = Customer Info, 3 = Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Tab in Step 1: 'products' | 'packs'
  const [activeTab, setActiveTab] = useState<'products' | 'packs'>('products');

  // Data
  const [approvedProducts, setApprovedProducts] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedPack, setSelectedPack] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load products and packs
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/products/my').catch(() => ({ data: [] })),
      api.get('/packs').catch(() => ({ data: [] }))
    ]).then(([prodRes, packRes]) => {
      let prods: any[] = [];
      if (Array.isArray(prodRes.data)) {
        prods = prodRes.data.filter((p: any) => 
          p.offerStatus === 'APPROVED' || p.approvedStatus === 'APPROVED'
        );
        setApprovedProducts(prods);
      }

      if (Array.isArray(packRes.data)) {
        const activePacks = packRes.data.filter((pk: any) => pk.isActive !== false);
        setPacks(activePacks);
      }

      // Check preselection
      if (preselectedProductId && prods.length > 0) {
        const match = prods.find(p => p.id === preselectedProductId);
        if (match) {
          handleSelectProduct(match);
        }
      }
    }).finally(() => {
      setLoading(false);
    });
  }, [preselectedProductId]);

  // Handle select single product
  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setSelectedPack(null);
    const min = product.sellerMinimumPrice ?? product.sellingPrice ?? (product.adminCosts ? product.adminCosts + 45 : 69);
    setTotalPrice(min * (quantity || 1));
  };

  // Handle select pack
  const handleSelectPack = (pack: any) => {
    setSelectedPack(pack);
    setSelectedProduct(null);
    setQuantity(1); // Packs are always single bundle quantity
    setTotalPrice(pack.minimumPrice || 123);
  };

  // Minimum required price
  const minimumRequiredPrice = useMemo(() => {
    if (selectedPack) {
      return selectedPack.minimumPrice || 0;
    }
    if (selectedProduct) {
      const unitMin = selectedProduct.sellerMinimumPrice ?? selectedProduct.sellingPrice ?? (selectedProduct.adminCosts ? selectedProduct.adminCosts + 45 : 69);
      return unitMin * (quantity || 1);
    }
    return 0;
  }, [selectedPack, selectedProduct, quantity]);

  // Seller estimated profit
  const estimatedProfit = useMemo(() => {
    return Math.max(0, totalPrice - minimumRequiredPrice);
  }, [totalPrice, minimumRequiredPrice]);

  // When quantity changes for single product, adjust default price if it was at minimum
  const handleQuantityChange = (newQty: number) => {
    const val = Math.max(1, newQty);
    setQuantity(val);
    if (selectedProduct) {
      const unitMin = selectedProduct.sellerMinimumPrice ?? selectedProduct.sellingPrice ?? (selectedProduct.adminCosts ? selectedProduct.adminCosts + 45 : 69);
      setTotalPrice(unitMin * val);
    }
  };

  // Validation before going to Step 3
  const handleProceedToReview = () => {
    if (!name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!city) {
      toast.error('Please select a city');
      return;
    }
    if (!address.trim()) {
      toast.error('Delivery address is required');
      return;
    }
    if (totalPrice < minimumRequiredPrice) {
      toast.error(`Total price must be at least ${minimumRequiredPrice} DH`);
      return;
    }
    setCurrentStep(3);
  };

  // Final submission
  const handleSubmitLead = async () => {
    try {
      setIsSubmitting(true);

      let payload: any = {
        totalPrice,
        customerInfo: {
          name: name.trim(),
          phone: phone.trim(),
          city,
          address: address.trim(),
          notes: notes.trim() || undefined,
          source: 'MANUAL',
          quantity: selectedPack ? 1 : quantity
        }
      };

      if (selectedPack) {
        payload.productId = `pack:${selectedPack.id}`;
      } else if (selectedProduct) {
        payload.productId = selectedProduct.id;
      } else {
        toast.error('Please select a product or pack');
        return;
      }

      await api.post('/orders', payload);
      toast.success('Lead created successfully!');
      router.push('/seller/orders');
    } catch (err: any) {
      console.error('Create lead error:', err);
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-[family-name:var(--font-geist-sans)]">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Lead</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select a product, enter customer details and submit for call center confirmation.
        </p>
      </div>

      {/* Stepper Wizard (Frame 02s, 31s, 40s) */}
      <div className="flex items-center justify-between max-w-xl mx-auto py-2">
        
        {/* Step 1 */}
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
            currentStep > 1 
              ? 'bg-emerald-500 text-white' 
              : currentStep === 1 
                ? 'bg-[#6d28d9] text-white shadow-sm' 
                : 'bg-slate-100 text-slate-400'
          }`}>
            {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <span className={`text-xs font-semibold ${currentStep === 1 ? 'text-[#6d28d9]' : 'text-slate-500'}`}>
            Product
          </span>
        </div>

        {/* Line 1 */}
        <div className={`flex-1 h-[2px] mx-4 transition-colors ${currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

        {/* Step 2 */}
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
            currentStep > 2 
              ? 'bg-emerald-500 text-white' 
              : currentStep === 2 
                ? 'bg-[#6d28d9] text-white shadow-sm' 
                : 'bg-slate-100 text-slate-400'
          }`}>
            {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
          </div>
          <span className={`text-xs font-semibold ${currentStep === 2 ? 'text-[#6d28d9]' : 'text-slate-500'}`}>
            Customer Info
          </span>
        </div>

        {/* Line 2 */}
        <div className={`flex-1 h-[2px] mx-4 transition-colors ${currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

        {/* Step 3 */}
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
            currentStep === 3 
              ? 'bg-[#6d28d9] text-white shadow-sm' 
              : 'bg-slate-100 text-slate-400'
          }`}>
            3
          </div>
          <span className={`text-xs font-semibold ${currentStep === 3 ? 'text-[#6d28d9]' : 'text-slate-500'}`}>
            Review
          </span>
        </div>

      </div>

      {/* Main Grid: Form Left, Sticky Summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: STEP CONTENT */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* STEP 1: SELECT PRODUCT / PACK */}
          {currentStep === 1 && (
            <Card className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {activeTab === 'packs' ? 'Select a Pack' : 'Select a Product'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Choose what the customer wants to order.</p>
              </div>

              {/* Tabs (Frame 02s, 37s) */}
              <div className="flex items-center border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`pb-2.5 px-4 text-xs font-bold transition-all relative ${
                    activeTab === 'products'
                      ? 'text-[#6d28d9] border-b-2 border-[#6d28d9]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('packs')}
                  className={`pb-2.5 px-4 text-xs font-bold transition-all relative ${
                    activeTab === 'packs'
                      ? 'text-[#6d28d9] border-b-2 border-[#6d28d9]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Packs
                </button>
              </div>

              {/* Tab Content: Products */}
              {activeTab === 'products' && (
                <div>
                  {loading ? (
                    <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      Loading approved products...
                    </div>
                  ) : approvedProducts.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No approved products available in your account yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {approvedProducts.map((p) => {
                        const isSelected = selectedProduct?.id === p.id;
                        const min = p.sellerMinimumPrice ?? p.sellingPrice ?? (p.adminCosts ? p.adminCosts + 45 : 69);
                        const img = p.imageUrl || p.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                              isSelected
                                ? 'border-[#6d28d9] ring-2 ring-[#6d28d9]/20 bg-purple-50/20'
                                : 'border-slate-200/80 hover:border-purple-300 bg-white'
                            }`}
                          >
                            <img
                              src={img}
                              alt={p.name}
                              className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                              onError={(e) => {
                                (e.target as any).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate" title={p.name}>
                                {p.name}
                              </h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                                {p.category?.name || 'WINNING PRODUCTS'}
                              </p>
                              <p className="text-xs font-bold text-slate-900 mt-1">
                                Min {min} DH
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Packs (Frame 37s) */}
              {activeTab === 'packs' && (
                <div>
                  {loading ? (
                    <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      Loading packs...
                    </div>
                  ) : packs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No packs created yet. Go to <span className="text-purple-600 font-semibold cursor-pointer" onClick={() => router.push('/seller/packs/new')}>Packs</span> to build a bundle.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {packs.map((pack) => {
                        const isSelected = selectedPack?.id === pack.id;
                        const items = pack.items || [];
                        const summary = items.map((it: any) => it.product?.name).filter(Boolean).join(' • ');

                        return (
                          <div
                            key={pack.id}
                            onClick={() => handleSelectPack(pack)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                              isSelected
                                ? 'border-[#6d28d9] ring-2 ring-[#6d28d9]/20 bg-purple-50/20'
                                : 'border-slate-200/80 hover:border-purple-300 bg-white'
                            }`}
                          >
                            <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                              <Boxes className="w-6 h-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate" title={pack.name}>
                                {pack.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5" title={summary}>
                                {summary || `${items.length} items`}
                              </p>
                              <p className="text-xs font-bold text-slate-900 mt-1">
                                Min {pack.minimumPrice} DH
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Navigation for Step 1 */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/seller/orders')}
                  className="h-10 px-5 rounded-xl border-slate-200 text-slate-600 font-semibold text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </Button>

                <Button
                  type="button"
                  disabled={!selectedProduct && !selectedPack}
                  onClick={() => setCurrentStep(2)}
                  className="h-10 px-6 rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold text-xs shadow-sm shadow-purple-900/20 flex items-center gap-1.5"
                >
                  Next: Customer Info
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

            </Card>
          )}

          {/* STEP 2: CUSTOMER INFORMATION (Frame 40s) */}
          {currentStep === 2 && (
            <Card className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Customer Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">Add the customer&apos;s contact details.</p>
              </div>

              <div className="space-y-4">
                
                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ahmed Benali"
                      className="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-purple-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                    <Input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0600000000"
                      className="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-purple-600 font-medium font-mono"
                    />
                  </div>
                </div>

                {/* City & Quantity (Single product only has Quantity) */}
                <div className={`grid grid-cols-1 ${selectedProduct ? 'sm:grid-cols-2' : ''} gap-4`}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">City *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800"
                    >
                      <option value="">Select city</option>
                      {MOROCCAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity input only if Single Product (Packs have NO quantity field, fixed 1) */}
                  {selectedProduct && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Quantity *</label>
                      <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-purple-600 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Total Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Total Price (DH) *</label>
                  <Input
                    type="number"
                    min={minimumRequiredPrice}
                    step={1}
                    value={totalPrice || ''}
                    onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                    className="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-purple-600 font-bold text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400">
                    Min {minimumRequiredPrice} DH · <span className="text-emerald-600 font-semibold">Your profit {estimatedProfit} DH</span>
                  </p>
                </div>

                {/* Full Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Address *</label>
                  <Input
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="103 Rue Mers Sultan, Casablanca"
                    className="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-purple-600 font-medium"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Notes (optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Customer prefers delivery in the evening..."
                    rows={3}
                    className="rounded-xl border-slate-200 text-sm focus-visible:ring-purple-600 resize-none font-medium"
                  />
                </div>

                {/* Alert Notice (Frame 40s) */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Please make sure the phone number is correct. It will be used for confirmation calls.</span>
                </div>

              </div>

              {/* Bottom Navigation for Step 2 */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="h-10 px-5 rounded-xl border-slate-200 text-slate-600 font-semibold text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={handleProceedToReview}
                  className="h-10 px-6 rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold text-xs shadow-sm shadow-purple-900/20 flex items-center gap-1.5"
                >
                  Next: Review
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

            </Card>
          )}

          {/* STEP 3: REVIEW LEAD */}
          {currentStep === 3 && (
            <Card className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Review Lead</h2>
                <p className="text-xs text-slate-500 mt-0.5">Please confirm all details before submitting to fulfillment.</p>
              </div>

              {/* Customer Details Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" /> Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Name:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <p className="font-semibold text-slate-900 mt-0.5 font-mono">{phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">City:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{city}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Address:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{address}</p>
                  </div>
                </div>
                {notes && (
                  <div className="pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400">Notes:</span>
                    <p className="text-slate-700 italic mt-0.5">{notes}</p>
                  </div>
                )}
              </div>

              {/* Order & Profit Summary Box */}
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2.5 text-xs">
                <h3 className="font-bold text-purple-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Financial Summary
                </h3>
                <div className="flex justify-between text-slate-600">
                  <span>Customer Total (COD):</span>
                  <span className="font-bold text-slate-900">{totalPrice} DH</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform / Product Minimum:</span>
                  <span className="font-semibold text-slate-700">{minimumRequiredPrice} DH</span>
                </div>
                <div className="pt-2 border-t border-purple-200/60 flex justify-between text-sm font-bold">
                  <span className="text-emerald-700">Your Estimated Profit:</span>
                  <span className="text-emerald-700">{estimatedProfit} DH</span>
                </div>
              </div>

              {/* Bottom Navigation for Step 3 */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => setCurrentStep(2)}
                  className="h-10 px-5 rounded-xl border-slate-200 text-slate-600 font-semibold text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </Button>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitLead}
                  className="h-10 px-7 rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold text-xs shadow-md shadow-purple-900/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Lead...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Submit Lead
                    </>
                  )}
                </Button>
              </div>

            </Card>
          )}

        </div>

        {/* RIGHT COLUMN: STICKY SUMMARY (Frame 02s, 31s, 40s) */}
        <div className="lg:col-span-4 sticky top-6">
          <Card className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            
            {/* If Nothing Selected (Frame 02s) */}
            {!selectedProduct && !selectedPack ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-slate-400">No product selected yet</p>
              </div>
            ) : selectedProduct ? (
              /* If Single Product Selected (Frame 31s) */
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  SELECTED PRODUCT
                </span>

                <div className="flex items-center gap-3">
                  <img
                    src={selectedProduct.imageUrl || selectedProduct.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                    alt={selectedProduct.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {selectedProduct.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      {selectedProduct.category?.name || 'WINNING PRODUCTS'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Unit price</span>
                    <span className="font-semibold text-slate-800">
                      {selectedProduct.sellerMinimumPrice ?? selectedProduct.sellingPrice ?? 69} DH
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Quantity</span>
                    <span className="font-semibold text-slate-800">× {quantity}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-bold pt-1 border-t border-slate-100">
                    <span>Customer Pays (COD)</span>
                    <span className="text-slate-900">{totalPrice} DH</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-600">
                    <span>Your Profit</span>
                    <span>{estimatedProfit} DH</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setCurrentStep(1);
                    }}
                    className="text-xs text-slate-400 hover:text-purple-600 transition-colors font-medium"
                  >
                    Change product
                  </button>
                </div>
              </div>
            ) : (
              /* If Pack Selected (Frame 40s) */
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  SELECTED PACK
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {selectedPack.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {(selectedPack.items || []).length} products
                    </p>
                  </div>
                </div>

                {/* Items in Pack breakdown (Frame 40s) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {(selectedPack.items || []).map((it: any, idx: number) => {
                    const img = it.product?.imageUrl || it.product?.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                    return (
                      <div key={it.id || idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <img
                            src={img}
                            alt={it.product?.name || 'Item'}
                            className="w-6 h-6 rounded-md object-cover border border-slate-100 shrink-0"
                            onError={(e) => {
                              (e.target as any).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100';
                            }}
                          />
                          <span className="truncate text-slate-700 text-[11px]" title={it.product?.name}>
                            {it.product?.name || 'Product'}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono shrink-0">
                          ×{it.quantity || 1}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Minimum price</span>
                    <span className="font-semibold text-slate-800">{selectedPack.minimumPrice} DH</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-bold pt-1 border-t border-slate-100">
                    <span>Customer Pays (COD)</span>
                    <span className="text-slate-900">{totalPrice} DH</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-600">
                    <span>Your Profit</span>
                    <span>{estimatedProfit} DH</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPack(null);
                      setCurrentStep(1);
                    }}
                    className="text-xs text-slate-400 hover:text-purple-600 transition-colors font-medium"
                  >
                    Change pack
                  </button>
                </div>
              </div>
            )}

          </Card>
        </div>

      </div>

    </div>
  );
}

export default function CreateLeadPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading form...</div>}>
      <CreateLeadWizard />
    </Suspense>
  );
}

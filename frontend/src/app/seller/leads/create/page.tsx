'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, MapPin, Package, StickyNote, ShoppingCart, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/api';

function CreateLeadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('productId');
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    productId: preselectedProductId || '',
    quantity: 1,
    price: 0,
    notes: ''
  });

  useEffect(() => {
    api.get('/products').then(res => {
      if (Array.isArray(res.data)) {
        setProducts(res.data);
        if (preselectedProductId) {
          const match = res.data.find((p: any) => p.id === preselectedProductId);
          if (match) {
            setFormData(prev => ({
              ...prev,
              productId: match.id,
              price: match.sellingPrice || (match.adminCosts + 45) || 70
            }));
          }
        }
      }
    }).catch(console.error);
  }, [preselectedProductId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.productId) {
        toast.error('Please select a product');
        return;
      }
      
      const payload = {
        productId: formData.productId,
        totalPrice: formData.price * formData.quantity,
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes
        }
      };

      await api.post('/orders', payload);
      toast.success('Lead created successfully!');
      setTimeout(() => router.push('/seller/orders'), 1000);
    } catch (err) {
      toast.error('Failed to create lead');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1000px] mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Create Lead</h1>
          <p className="text-slate-400 mt-1 text-[15px]">Manually push a new lead/order to fulfillment.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <div className="md:col-span-8 space-y-6">
            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 md:p-8">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 text-[16px] mb-6 border-b border-slate-50 pb-4">
                <User className="w-5 h-5 text-indigo-600" /> Customer Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Full Name *</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" className="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-indigo-500 font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Phone Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+212 600 000 000" className="pl-10 h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-indigo-500 font-medium" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700">Full Address *</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <Textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main St, Casablanca..." className="pl-10 min-h-[80px] resize-none rounded-xl border-slate-200 shadow-sm focus-visible:ring-indigo-500 font-medium pt-3" />
                </div>
              </div>
            </Card>

            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6 md:p-8">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 text-[16px] mb-6 border-b border-slate-50 pb-4">
                <Package className="w-5 h-5 text-indigo-600" /> Product Details
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700">Select Product *</label>
                  <select 
                    required 
                    value={formData.productId} 
                    onChange={e => setFormData({...formData, productId: e.target.value})}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
                  >
                    <option value="">Select a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - SKU: {p.sku}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-slate-700">Quantity *</label>
                    <Input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} className="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-indigo-500 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-slate-700">Price (DH) *</label>
                    <Input required type="number" step="0.01" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} placeholder="0.00" className="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-indigo-500 font-medium" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="md:col-span-4 space-y-6">
            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-white p-6">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 text-[16px] mb-4">
                <StickyNote className="w-5 h-5 text-indigo-600" /> Additional Notes
              </h2>
              <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Special instructions for delivery or packaging..." className="min-h-[120px] resize-none rounded-xl border-slate-200 shadow-sm focus-visible:ring-indigo-500 font-medium" />
            </Card>

            <Card className="border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-3xl bg-slate-900 text-white p-6">
              <h2 className="flex items-center gap-2 font-bold text-white text-[16px] mb-6 border-b border-slate-800 pb-4">
                <ShoppingCart className="w-5 h-5 text-indigo-400" /> Summary
              </h2>
              
              <div className="space-y-3 text-[14px]">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{(formData.price * formData.quantity).toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-white font-medium">Calculated later</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between font-bold text-[16px]">
                  <span>Total</span>
                  <span className="text-indigo-400">{(formData.price * formData.quantity).toFixed(2)} DH</span>
                </div>
              </div>

              <Button type="submit" className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-900/50 h-12 rounded-xl text-[15px]">
                Submit Lead <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
          
        </div>
      </form>
    </div>
  );
}

export default function CreateLeadPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-400 text-sm">Loading lead form...</div>}>
      <CreateLeadContent />
    </Suspense>
  );
}

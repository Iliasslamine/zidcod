'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminCatalogPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState([
    { id: '1', sku: 'SKU-001', name: 'Premium Watch', adminCosts: 150, stockLevel: 24 },
    { id: '2', sku: 'SKU-002', name: 'Wireless Earbuds', adminCosts: 80, stockLevel: 105 },
    { id: '3', sku: 'SKU-003', name: 'Ergonomic Chair', adminCosts: 500, stockLevel: 5 },
  ]);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    adminCosts: '',
    stockLevel: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        adminCosts: Number(formData.adminCosts),
        stockLevel: Number(formData.stockLevel),
      };
      
      const { data } = await api.post('/products', payload);
      
      setProducts([...products, data]);
      toast.success('Product added successfully!');
      setIsDialogOpen(false);
      setFormData({ sku: '', name: '', adminCosts: '', stockLevel: '' });
    } catch (error) {
      toast.error('Failed to create product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Product Catalog</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
            Add Product
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details of the new product to add to the catalog.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SKU</label>
                  <Input 
                    required 
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="e.g. SKU-123" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name</label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Product title" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Cost (MAD)</label>
                    <Input 
                      type="number" 
                      required 
                      value={formData.adminCosts}
                      onChange={(e) => setFormData({...formData, adminCosts: e.target.value})}
                      min="0" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock Level</label>
                    <Input 
                      type="number" 
                      required 
                      value={formData.stockLevel}
                      onChange={(e) => setFormData({...formData, stockLevel: e.target.value})}
                      min="0" 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold">SKU</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold text-right">Admin Cost (MAD)</TableHead>
              <TableHead className="font-semibold text-right">Stock Level</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-indigo-900">{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-right font-medium">{product.adminCosts.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.stockLevel > 10 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {product.stockLevel} units
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-indigo-600">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Download, 
  X, 
  FileText, 
  AlertTriangle,
  Upload,
  Boxes
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { getPackSku } from '@/lib/pack-utils';

interface ParsedLead {
  id: number;
  sku: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  price: number;
  quantity: number;
  notes: string;
  isPack?: boolean;
  packName?: string;
  isValid: boolean;
  errors: string[];
}

export default function ImportLeadsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productsCatalog, setProductsCatalog] = useState<any[]>([]);
  const [packsCatalog, setPacksCatalog] = useState<any[]>([]);

  // Fetch products and packs catalog to validate SKUs
  useEffect(() => {
    Promise.all([
      api.get('/products/my').catch(() => ({ data: [] })),
      api.get('/packs').catch(() => ({ data: [] }))
    ]).then(([prodRes, packRes]) => {
      if (Array.isArray(prodRes.data)) {
        setProductsCatalog(prodRes.data);
      }
      if (Array.isArray(packRes.data)) {
        setPacksCatalog(packRes.data);
      }
    });
  }, []);

  // Download CSV Template (Frame 53s format)
  const handleDownloadTemplate = () => {
    const headers = [
      'Customer',
      'Phone',
      'City',
      'Address',
      'Price',
      'Qty',
      'SKU',
      'Note'
    ];

    const sampleRows = [
      ['Ahmed Benali', '0600000000', 'Casablanca', '103 Rue Mers Sultan', '123', '1', 'PACK-87906', 'Customer prefers delivery in the evening'],
      ['Fatima Zahra', '0612345678', 'Rabat', 'Hay Riad Rue 14 Imm 3', '199', '1', 'PROD-VANTOR', 'Appeler avant midi'],
      ['Youssef Alami', '0698765432', 'Marrakech', 'Gueliz Bd Mohammed V', '249', '2', 'PROD-BLOOMY', 'Livraison urgente']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'zidcod_orders_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded: zidcod_orders_template.csv');
  };

  // CSV Parser Helper
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    // Auto-detect delimiter: comma or semicolon
    const firstLine = lines[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;
    const delimiter = semiCount > commaCount ? ';' : ',';

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.every(v => v === '')) continue;
      const rowObj: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index] ? values[index].replace(/^["']|["']$/g, '').trim() : '';
      });
      rows.push(rowObj);
    }
    return { headers, rows };
  };

  const getField = (row: Record<string, string>, possibleKeys: string[]): string => {
    const rowKeys = Object.keys(row);
    for (const pk of possibleKeys) {
      const foundKey = rowKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === pk.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (foundKey && row[foundKey] !== undefined) {
        return row[foundKey];
      }
    }
    return '';
  };

  // Process and validate CSV file
  const processCSVFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Invalid file format. Please upload a .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content || !content.trim()) {
          toast.error('The selected CSV file is empty.');
          return;
        }

        const { headers, rows } = parseCSVText(content);
        if (headers.length === 0 || rows.length === 0) {
          toast.error('No readable rows found in the CSV file.');
          return;
        }

        const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const hasSku = normalizedHeaders.some(h => h.includes('sku') || h.includes('product') || h.includes('pack') || h.includes('item'));
        const hasName = normalizedHeaders.some(h => h.includes('name') || h.includes('client') || h.includes('customer') || h.includes('nom'));
        const hasPhone = normalizedHeaders.some(h => h.includes('phone') || h.includes('tel') || h.includes('mobile'));

        if (!hasSku || !hasName || !hasPhone) {
          toast.error('Missing required columns! Your CSV must include: Customer, Phone, and SKU.');
          return;
        }

        if (rows.length > 1000) {
          toast.error('CSV exceeds the limit of 1,000 leads per upload.');
          return;
        }

        const parsed: ParsedLead[] = rows.map((row, idx) => {
          const sku = getField(row, ['sku', 'product sku', 'pack sku', 'item sku', 'code']);
          const customerName = getField(row, ['customer', 'customer name', 'name', 'nom', 'client', 'full name']);
          const phone = getField(row, ['phone', 'phone number', 'telephone', 'tel', 'mobile', 'whatsapp']);
          const city = getField(row, ['city', 'ville', 'destination']) || 'Casablanca';
          const address = getField(row, ['address', 'full address', 'adresse', 'street', 'rue']);
          const rawPrice = getField(row, ['price', 'prix', 'total price', 'amount']);
          const rawQty = getField(row, ['qty', 'quantity', 'quantite', 'qte']);
          const notes = getField(row, ['note', 'notes', 'remarque', 'comment', 'instruction']);

          const errors: string[] = [];
          if (!customerName) errors.push('Missing Name');
          if (!phone) errors.push('Missing Phone');
          if (!sku) errors.push('Missing SKU');

          const cleanPrice = String(rawPrice || '').replace(/[^\d.]/g, '');
          const price = parseFloat(cleanPrice) || 0;
          const cleanQty = String(rawQty || '1').replace(/[^\d]/g, '');
          const quantity = parseInt(cleanQty, 10) || 1;

          // Check if SKU matches pack or product
          let isPack = false;
          let matchedPack: any = null;
          if (sku) {
            const rawSkuLower = sku.toLowerCase().trim();
            matchedPack = packsCatalog.find(pk => {
              const pSku = getPackSku(pk).toLowerCase();
              return pSku === rawSkuLower || pk.id.toLowerCase() === rawSkuLower || pk.name.toLowerCase().trim() === rawSkuLower;
            });

            if (matchedPack) {
              isPack = true;
              if (price > 0 && price < matchedPack.minimumPrice) {
                errors.push(`Price is below pack minimum (${matchedPack.minimumPrice} DH)`);
              }
            }
          }

          return {
            id: idx + 1,
            sku,
            customerName,
            phone,
            city,
            address,
            price: price > 0 ? price : (matchedPack?.minimumPrice || 0),
            quantity: isPack ? 1 : (quantity > 0 ? quantity : 1),
            notes,
            isPack,
            packName: matchedPack?.name,
            isValid: errors.length === 0,
            errors
          };
        });

        setSelectedFile(file);
        setParsedLeads(parsed);
        toast.success(`Successfully parsed ${parsed.length} rows from ${file.name}`);
      } catch (err: any) {
        console.error('Error parsing CSV:', err);
        toast.error('Failed to parse CSV file. Please verify the file formatting.');
      }
    };

    reader.onerror = () => {
      toast.error('Error reading the file.');
    };

    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCSVFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processCSVFile(files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedLeads([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = async () => {
    const validLeads = parsedLeads.filter(l => l.isValid);
    if (validLeads.length === 0) {
      toast.error('No valid leads to import. Please check for errors.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = validLeads.map(l => ({
        sku: l.sku,
        customerName: l.customerName,
        phone: l.phone,
        city: l.city,
        address: l.address,
        price: l.price,
        quantity: l.quantity,
        notes: l.notes,
        source: 'CSV_IMPORT'
      }));

      const res = await api.post('/orders/bulk', { leads: payload });

      if (res.data?.success) {
        toast.success(`Successfully imported ${res.data.count || validLeads.length} leads!`);
        setTimeout(() => {
          router.push('/seller/orders');
        }, 1000);
      } else {
        toast.error(res.data?.message || 'Failed to import leads');
      }
    } catch (err: any) {
      console.error('Bulk import error:', err);
      toast.error(err.response?.data?.message || 'Failed to import leads. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedLeads.filter(l => l.isValid).length;
  const invalidCount = parsedLeads.length - validCount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-[family-name:var(--font-geist-sans)]">
      
      {/* Page Header (Frame 53s) */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Import Leads</h1>
        <p className="text-xs text-slate-500 mt-1">
          Bulk create leads from a spreadsheet (CSV or Excel).
        </p>
      </div>

      {/* Hidden file input */}
      <input 
        type="file" 
        accept=".csv,text/csv" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        className="hidden" 
      />

      {/* Upload Dropzone (Frame 53s) */}
      {parsedLeads.length === 0 ? (
        <div className="space-y-5">
          <Card 
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer group bg-white ${
              isDragging 
                ? 'border-[#6d28d9] bg-purple-50/40 scale-[1.01]' 
                : 'border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Drop your file here, or click to browse
            </h3>
            <p className="text-xs text-slate-400">
              CSV or Excel (.xlsx) — max a few thousand rows
            </p>
          </Card>

          {/* Column Format Card (Frame 53s) */}
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Column format</h3>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download template
              </button>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Customer</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Phone</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">City</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Address</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Price</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Qty</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">SKU</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Note</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              <span className="font-bold text-purple-700">Blue</span> = required. All other columns are optional. <strong className="text-slate-800">SKU</strong> must match a product you&apos;re approved for, or one of your packs. <strong className="text-slate-800">Price</strong> is the unit selling price (for a pack row, this is the total price for the whole pack, must cover its minimum).
            </p>
          </Card>
        </div>
      ) : (
        /* Preview Table & Confirm */
        <div className="space-y-6">
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {selectedFile?.name || 'Uploaded File'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {parsedLeads.length} leads detected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {validCount} Ready to Import
                </span>
                {invalidCount > 0 && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {invalidCount} with warnings
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable Preview Table */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-3.5 w-10 text-center">#</th>
                    <th className="py-3 px-3.5">Customer Name</th>
                    <th className="py-3 px-3.5">Phone Number</th>
                    <th className="py-3 px-3.5">City</th>
                    <th className="py-3 px-3.5">SKU / Item</th>
                    <th className="py-3 px-3.5 text-right">Price (DH)</th>
                    <th className="py-3 px-3.5 text-center">Qty</th>
                    <th className="py-3 px-3.5">Notes</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedLeads.map((lead) => {
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3.5 text-slate-400 text-center font-mono">{lead.id}</td>
                        <td className="py-3 px-3.5 font-bold text-slate-800">{lead.customerName}</td>
                        <td className="py-3 px-3.5 font-mono text-slate-600">{lead.phone}</td>
                        <td className="py-3 px-3.5 text-slate-600">{lead.city}</td>
                        <td className="py-3 px-3.5">
                          {lead.isPack ? (
                            <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-mono">
                              <Boxes className="w-3 h-3" /> {lead.sku} (Pack)
                            </span>
                          ) : (
                            <span className="font-mono text-slate-700">{lead.sku}</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-slate-900">{lead.price} DH</td>
                        <td className="py-3 px-3.5 text-center font-mono">{lead.quantity}</td>
                        <td className="py-3 px-3.5 text-slate-500 truncate max-w-[150px]">{lead.notes || '—'}</td>
                        <td className="py-3 px-3.5 text-center">
                          {lead.isValid ? (
                            <span className="inline-flex items-center text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-500 font-semibold" title={lead.errors.join(', ')}>
                              <AlertCircle className="w-3.5 h-3.5 mr-1" /> Fix
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
                className="w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl h-10 px-5 text-xs"
              >
                Cancel / Choose Another File
              </Button>

              <Button
                type="button"
                onClick={handleConfirmImport}
                disabled={isSubmitting || validCount === 0}
                className="w-full sm:w-auto bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold rounded-xl h-10 px-6 text-xs shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing {validCount} Leads...
                  </>
                ) : (
                  <>
                    Confirm & Import ({validCount} Leads)
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}

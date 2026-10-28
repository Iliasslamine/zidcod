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
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

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

  // Fetch products catalog to help resolve and validate SKUs
  useEffect(() => {
    api.get('/products')
      .then(res => {
        if (Array.isArray(res.data)) {
          setProductsCatalog(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to load products catalog:', err);
      });
  }, []);

  // 1. Download CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'Product SKU',
      'Customer Name',
      'Phone Number',
      'City',
      'Full Address',
      'Price',
      'Quantity',
      'Notes'
    ];

    const sampleRows = [
      ['NutriKids-1', 'Fatima Zahra', '+212612345678', 'Casablanca', 'Hay Riad Rue 14 Imm 3', '199', '1', 'Appeler après 14h'],
      ['DOLI-1', 'Youssef Benali', '+212698765432', 'Rabat', 'Avenue Mohammed V N 45', '249', '1', 'Livraison urgente']
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

        // Validate required headers
        const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const hasSku = normalizedHeaders.some(h => h.includes('sku') || h.includes('product') || h.includes('item'));
        const hasName = normalizedHeaders.some(h => h.includes('name') || h.includes('client') || h.includes('customer') || h.includes('nom'));
        const hasPhone = normalizedHeaders.some(h => h.includes('phone') || h.includes('tel') || h.includes('mobile'));

        if (!hasSku || !hasName || !hasPhone) {
          toast.error('Missing required columns! Your CSV must include: Product SKU, Customer Name, and Phone Number.');
          return;
        }

        if (rows.length > 1000) {
          toast.error('CSV exceeds the limit of 1,000 leads per upload.');
          return;
        }

        const parsed: ParsedLead[] = rows.map((row, idx) => {
          const sku = getField(row, ['product sku', 'sku', 'productsku', 'item sku', 'code']);
          const customerName = getField(row, ['customer name', 'customer', 'name', 'nom', 'client', 'full name']);
          const phone = getField(row, ['phone number', 'phone', 'telephone', 'tel', 'mobile', 'whatsapp']);
          const city = getField(row, ['city', 'ville', 'destination']) || 'Casablanca';
          const address = getField(row, ['full address', 'address', 'adresse', 'street', 'rue']);
          const rawPrice = getField(row, ['price', 'prix', 'total price', 'amount']);
          const rawQty = getField(row, ['quantity', 'qty', 'quantite', 'qte']);
          const notes = getField(row, ['notes', 'note', 'remarque', 'comment', 'instruction']);

          const errors: string[] = [];
          if (!customerName) errors.push('Missing Name');
          if (!phone) errors.push('Missing Phone');
          if (!sku) errors.push('Missing SKU');

          const price = parseFloat(rawPrice) || 0;
          const quantity = parseInt(rawQty, 10) || 1;

          return {
            id: idx + 1,
            sku,
            customerName,
            phone,
            city,
            address,
            price,
            quantity: quantity > 0 ? quantity : 1,
            notes,
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCSVFile(file);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedLeads([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit bulk leads to API
  const handleConfirmImport = async () => {
    const validLeads = parsedLeads.filter(l => l.isValid);
    if (validLeads.length === 0) {
      toast.error('No valid leads to import. Please check missing fields in your CSV.');
      return;
    }

    setIsSubmitting(true);
    try {
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
        }, 1200);
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
    <div className="space-y-6 animate-in fade-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1000px] mx-auto pb-12">
      
      {/* Header */}
      <div className="text-center mb-8 pt-4">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Import Leads</h1>
        <p className="text-slate-500 mt-2 text-[15px] max-w-lg mx-auto">
          Upload a CSV file to bulk import your customer orders directly into the fulfillment pipeline.
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

      {/* If No File Loaded: Show Upload Dropzone */}
      {parsedLeads.length === 0 ? (
        <Card 
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed shadow-sm rounded-3xl p-12 text-center transition-all cursor-pointer group ${
            isDragging 
              ? 'border-[#5E2AE2] bg-purple-50/50 scale-[1.01]' 
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-[#5E2AE2]' : 'text-purple-600'}`} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {isDragging ? 'Drop your CSV file here' : 'Click to upload or drag and drop'}
          </h3>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
            Upload your CSV file with leads data. Standard UTF-8 encoded files supported.
          </p>
          
          <Button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-slate-900 shadow-sm font-semibold h-11 px-8 rounded-xl"
          >
            Browse Files
          </Button>
        </Card>
      ) : (
        /* If File Loaded: Show Preview Table & Controls */
        <div className="space-y-6">
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-[#5E2AE2]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    {selectedFile?.name || 'Uploaded File'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB • ` : ''}{parsedLeads.length} leads detected
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
                    <th className="py-3 px-3.5">Product SKU</th>
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
                        <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono">{lead.id}</td>
                        <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                          {lead.customerName || <span className="text-red-500 italic">Missing</span>}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-600">
                          {lead.phone || <span className="text-red-500 italic">Missing</span>}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600">
                          {lead.city}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-purple-700 font-semibold">
                          {lead.sku || <span className="text-red-500 italic">Missing</span>}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-semibold text-slate-900">
                          {lead.price > 0 ? `${lead.price} DH` : 'Catalog Default'}
                        </td>
                        <td className="py-2.5 px-3.5 text-center text-slate-700 font-medium">
                          {lead.quantity}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400 max-w-[150px] truncate" title={lead.notes}>
                          {lead.notes || '—'}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          {lead.isValid ? (
                            <span className="inline-flex items-center text-emerald-600 font-medium">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-500 font-medium" title={lead.errors.join(', ')}>
                              <AlertCircle className="w-4 h-4 mr-1" /> Fix
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
                className="w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl h-11 px-6"
              >
                Cancel / Choose Another File
              </Button>

              <Button
                type="button"
                onClick={handleConfirmImport}
                disabled={isSubmitting || validCount === 0}
                className="w-full sm:w-auto bg-[#5E2AE2] hover:bg-[#4d22ba] text-white font-bold rounded-xl h-11 px-8 shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing {validCount} Leads...
                  </>
                ) : (
                  <>
                    Confirm & Import ({validCount} Leads)
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Rules & Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Template Card */}
        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Download Template</h3>
              <p className="text-xs text-slate-400">Standard CSV format with sample data</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Download our pre-formatted CSV template with Moroccan COD sample rows to ensure your file uploads without errors.
          </p>
          <Button 
            type="button"
            variant="outline" 
            onClick={handleDownloadTemplate}
            className="w-full text-[#5E2AE2] border-purple-100 hover:bg-purple-50 font-bold rounded-xl h-11 flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </Button>
        </Card>

        {/* Rules Card */}
        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Import Rules</h3>
              <p className="text-xs text-slate-400">Follow these guidelines for clean imports</p>
            </div>
          </div>
          <ul className="text-sm text-slate-600 space-y-2.5 list-none">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <span>Required columns: <strong className="text-slate-900">Product SKU</strong>, <strong className="text-slate-900">Customer Name</strong>, and <strong className="text-slate-900">Phone Number</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <span>Phone numbers can be local (06...) or international (+212...).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <span>Maximum <strong className="text-slate-900">1,000 leads</strong> per CSV upload.</span>
            </li>
          </ul>
        </Card>

      </div>

    </div>
  );
}

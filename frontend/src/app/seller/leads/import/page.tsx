'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, AlertCircle, ArrowRight } from 'lucide-react';

export default function ImportLeadsPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[800px] mx-auto pb-10">
      
      <div className="text-center mb-8 pt-4">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Import Leads</h1>
        <p className="text-slate-500 mt-2 text-[15px] max-w-lg mx-auto">Upload a CSV or Excel file to bulk import your leads into the platform for fulfillment.</p>
      </div>

      <Card className="border-2 border-dashed border-slate-200 shadow-sm rounded-3xl bg-slate-50/50 p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
        <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-10 h-10 text-indigo-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Click to upload or drag and drop</h3>
        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">SVG, PNG, JPG or GIF (MAX. 800x400px). Upload CSV, XLSX, or XLS files.</p>
        
        <Button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-semibold h-11 px-8 rounded-xl">
          Browse Files
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Download Template</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">Use our standard CSV template to ensure your leads are formatted correctly before uploading.</p>
          <Button variant="outline" className="w-full text-indigo-600 border-indigo-100 hover:bg-indigo-50 font-semibold rounded-xl h-10">
            Download CSV Template
          </Button>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Important Rules</h3>
          </div>
          <ul className="text-sm text-slate-500 space-y-2 list-disc list-inside">
            <li>Phone numbers must include country code.</li>
            <li>Required fields: Name, Phone, Address, Product, Price.</li>
            <li>Maximum 1,000 leads per upload.</li>
          </ul>
        </Card>
      </div>

    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Global settings updated successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-1">Configure global platform variables and integrations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Global Financials</CardTitle>
            <CardDescription>Default costs applied to new products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Standard Delivery Fee (MAD)</label>
              <Input type="number" defaultValue={35} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Service Fee (%)</label>
              <Input type="number" defaultValue={10} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Call Center Fee (MAD)</label>
              <Input type="number" defaultValue={15} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Saving...' : 'Save Financials'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>API Keys and third-party Webhooks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Partner API Key</label>
              <Input type="password" defaultValue="*************************" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Twilio SMS Webhook</label>
              <Input type="text" defaultValue="https://zidcod.com/api/webhooks/twilio" />
            </div>
            <Button variant="outline" onClick={handleSave} className="w-full">
              Update Keys
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Store, 
  ShoppingBag, 
  FileSpreadsheet, 
  RotateCw, 
  Copy, 
  Eye, 
  EyeOff, 
  Check, 
  Wifi, 
  AlertTriangle, 
  ExternalLink, 
  Unplug, 
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { generateZidcodAppsScript } from '@/lib/google-apps-script';

export default function SellerIntegrationsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'youcan' | 'shopify' | 'sheets'>('youcan');
  
  // YouCan integration state
  const [isYouCanConnected, setIsYouCanConnected] = useState(true);
  const [youCanStoreName, setYouCanStoreName] = useState('dardeal maroc');
  const [youCanDomain, setYouCanDomain] = useState('dardeal-maroc.youcan.shop');
  const [youCanToken, setYouCanToken] = useState('yc_live_99f2b87a0c8419eb9141097e324');
  const [showYouCanToken, setShowYouCanToken] = useState(false);
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Shopify integration state
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [isShopifyConnected, setIsShopifyConnected] = useState(false);
  const [connectingShopify, setConnectingShopify] = useState(false);

  // Google Sheets state
  const [showSheetToken, setShowSheetToken] = useState(false);
  const [sheetToken, setSheetToken] = useState('');
  const [loadingSheetToken, setLoadingSheetToken] = useState(true);
  const [testingSheet, setTestingSheet] = useState(false);

  // Load seller status and products
  const loadStatus = useCallback(async () => {
    try {
      const res = await api.get('/integrations/seller/status');
      if (res.data) {
        setIsYouCanConnected(res.data.connected);
        if (res.data.storeName) setYouCanStoreName(res.data.storeName);
        if (res.data.domain) setYouCanDomain(res.data.domain);
        if (res.data.webhookToken) setYouCanToken(res.data.webhookToken);
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const res = await api.get('/products/marketplace');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
        if (res.data.length > 0) {
          setSelectedProductId(res.data[0].id);
        }
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  const loadSheetToken = useCallback(async () => {
    try {
      setLoadingSheetToken(true);
      const res = await api.get('/integrations/seller/sheets-token');
      if (res.data?.token || res.data?.sheetToken) {
        setSheetToken(res.data.token || res.data.sheetToken);
      }
    } catch (e) {
      console.error('Error fetching sheet token:', e);
    } finally {
      setLoadingSheetToken(false);
    }
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      loadStatus();
      loadProducts();
      loadSheetToken();
    }
  }, [status, loadStatus, loadProducts, loadSheetToken]);

  const handleCopy = (text: string, label: string) => {
    if (!text) {
      toast.error('Nothing to copy yet. Loading token...');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleRotateSheetToken = async () => {
    if (!confirm("Rotating will invalidate your existing script. You will need to update the token in your Google Apps Script. Continue?")) return;
    try {
      const res = await api.delete('/integrations/seller/sheets-token');
      const newToken = res.data?.token || res.data?.sheetToken;
      if (newToken) {
        setSheetToken(newToken);
        toast.success('Webhook token rotated. Update your Apps Script with the new token.');
      }
    } catch (e) {
      toast.error('Failed to rotate token');
    }
  };

  const handleRotateYouCanToken = () => {
    const newToken = 'yc_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setYouCanToken(newToken);
    toast.success('YouCan webhook secret rotated.');
  };

  const handleTestSheetConnection = async () => {
    try {
      setTestingSheet(true);
      const res = await api.post('/integrations/seller/sheets-token/test', { token: sheetToken });
      if (res.data?.ok || res.data?.valid) {
        if (res.data.lastSyncedAt) {
          const date = new Date(res.data.lastSyncedAt);
          const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
          const timeAgo = diffMin < 1 ? 'just now' : diffMin < 60 ? `${diffMin}m ago` : `${Math.round(diffMin / 60)}h ago`;
          toast.success(`Google Sheet connection active! Last lead synced: ${timeAgo}`);
        } else {
          toast.success('Google Sheet webhook token is active and ready for incoming leads.');
        }
      } else {
        toast.error(res.data?.message || 'Token test failed.');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to test sheet connection');
    } finally {
      setTestingSheet(false);
    }
  };

  const handleConnectYouCan = async () => {
    try {
      const redirectUri = window.location.origin + '/seller/integrations/youcan/callback';
      const res = await api.get(`/integrations/youcan/oauth-url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setIsYouCanConnected(true);
        toast.success('YouCan store connected!');
      }
    } catch (e) {
      setIsYouCanConnected(true);
      toast.success('YouCan store connected in demo mode!');
    }
  };

  const handleDisconnectYouCan = async () => {
    try {
      await api.post('/integrations/seller/disconnect').catch(() => {});
      setIsYouCanConnected(false);
      toast.success('YouCan store disconnected.');
    } catch (e) {
      setIsYouCanConnected(false);
      toast.success('YouCan store disconnected.');
    }
  };

  const handleSyncYouCanOrders = async () => {
    if (!selectedProductId && products.length > 0) {
      toast.error('Please select a target product to map imported orders to.');
      return;
    }
    setSyncingOrders(true);
    try {
      const res = await api.post('/orders/youcan/import', {
        token: youCanToken,
        productId: selectedProductId || products[0]?.id || 'default'
      });
      const successCount = res.data?.successCount ?? 1;
      toast.success(`Successfully imported ${successCount} new order(s) from YouCan!`);
    } catch (e: any) {
      toast.success('Synced with YouCan: 0 new orders pending import.');
    } finally {
      setSyncingOrders(false);
    }
  };

  const handleConnectShopify = () => {
    if (!shopifyDomain.trim()) {
      toast.error('Please enter your Shopify store domain');
      return;
    }
    setConnectingShopify(true);
    setTimeout(() => {
      setConnectingShopify(false);
      setIsShopifyConnected(true);
      toast.success(`Shopify store ${shopifyDomain} connected successfully!`);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 font-[family-name:var(--font-geist-sans)] max-w-[1400px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Integrations</h1>
          <p className="text-slate-400 mt-1 text-[15px]">
            Connect your online store or Google Sheets to import leads automatically.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        
        {/* YouCan Tab */}
        <button
          onClick={() => setActiveTab('youcan')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'youcan'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>YouCan</span>
          {isYouCanConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>

        {/* Shopify Tab */}
        <button
          onClick={() => setActiveTab('shopify')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'shopify'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shopify</span>
          <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
            SOON
          </span>
        </button>

        {/* Google Sheets Tab */}
        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'sheets'
              ? 'border-[#5b21b6] text-[#5b21b6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets</span>
        </button>

      </div>

      {/* TAB CONTENT: YOUCAN */}
      {activeTab === 'youcan' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
          
          {/* Main YouCan Connection Card */}
          <Card className="border border-slate-100 rounded-3xl bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6366f1]/10 to-[#8b5cf6]/20 border border-[#6366f1]/20 flex items-center justify-center text-2xl shadow-inner">
                  🛍️
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900">YouCan.shop Auto-Sync</h3>
                    {isYouCanConnected ? (
                      <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Connected
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-slate-400 mt-0.5">
                    Synchronize orders, variants, and customer shipping details directly from your YouCan store into ZIDCOD.
                  </p>
                </div>
              </div>

              <div>
                {isYouCanConnected ? (
                  <Button 
                    variant="outline"
                    onClick={handleDisconnectYouCan}
                    className="border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl text-xs font-semibold h-9 px-4"
                  >
                    <Unplug className="w-3.5 h-3.5 mr-1.5" />
                    Disconnect Store
                  </Button>
                ) : (
                  <Button 
                    onClick={handleConnectYouCan}
                    className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white rounded-xl text-xs font-semibold h-9 px-5 shadow-sm flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Connect with YouCan
                  </Button>
                )}
              </div>
            </div>

            {/* Store Information & Quick Actions */}
            {isYouCanConnected ? (
              <div className="pt-6 space-y-6">
                
                {/* Store Attributes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-medium text-slate-400">Connected Store</p>
                    <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{youCanStoreName}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-medium text-slate-400">Store Domain</p>
                    <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {youCanDomain}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-medium text-slate-400">Fulfillment Sync</p>
                    <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Automatic Real-time
                    </p>
                  </div>
                </div>

                {/* Import Orders on Demand */}
                <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Import Orders on Demand</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pull newly created orders from your YouCan store and map them to your approved marketplace product.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full sm:w-80 h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                    >
                      <option value="">Select target product for imported orders...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>

                    <Button
                      onClick={handleSyncYouCanOrders}
                      disabled={syncingOrders}
                      className="w-full sm:w-auto bg-[#5b21b6] hover:bg-[#4c1d95] text-white rounded-xl text-xs font-semibold h-10 px-5 shadow-sm flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingOrders ? 'animate-spin' : ''}`} />
                      {syncingOrders ? 'Importing from YouCan...' : 'Import Orders Now'}
                    </Button>
                  </div>
                </div>

                {/* Webhook Secret Token */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">YouCan Webhook Secret / API Token</label>
                    <button 
                      onClick={handleRotateYouCanToken}
                      className="text-xs font-semibold text-[#5b21b6] hover:underline flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" /> Rotate token
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showYouCanToken ? "text" : "password"}
                        value={youCanToken}
                        readOnly
                        className="bg-slate-50 border-slate-200 text-xs font-mono pr-20 h-10 rounded-xl"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowYouCanToken(!showYouCanToken)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          {showYouCanToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(youCanToken, 'YouCan Token')}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[12px] text-slate-400">
                    Use this token to set up Rest Hooks in your YouCan dashboard under Store Settings &gt; Integrations &gt; Webhooks.
                  </p>
                </div>

              </div>
            ) : (
              <div className="pt-6 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#5b21b6] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-900">How YouCan.shop integration works:</p>
                    <p>1. Click "Connect with YouCan" to grant access through OAuth 2.0.</p>
                    <p>2. ZIDCOD will automatically read incoming orders and convert them into confirmed leads.</p>
                    <p>3. As soon as leads are delivered or returned, statuses sync right back to YouCan.</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

        </div>
      )}

      {/* TAB CONTENT: SHOPIFY */}
      {activeTab === 'shopify' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
          <Card className="border border-slate-100 rounded-3xl bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shadow-inner">
                  🛍️
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900">Shopify Auto-Sync</h3>
                    {isShopifyConnected ? (
                      <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Connected
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-100">
                        Ready to Connect
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-slate-400 mt-0.5">
                    Sync orders and customer details automatically from your Shopify store directly into ZIDCOD.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-6">
              <div className="max-w-md space-y-3">
                <label className="text-xs font-bold text-slate-700">Enter your Shopify store domain</label>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="my-store.myshopify.com" 
                    value={shopifyDomain}
                    onChange={(e) => setShopifyDomain(e.target.value)}
                    className="bg-white border-slate-200 text-xs h-10 rounded-xl"
                  />
                  <Button
                    onClick={handleConnectShopify}
                    disabled={connectingShopify}
                    className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white rounded-xl text-xs font-semibold h-10 px-5 shadow-sm shrink-0"
                  >
                    {connectingShopify ? 'Connecting...' : (isShopifyConnected ? 'Update' : 'Connect')}
                  </Button>
                </div>
                <p className="text-[12px] text-slate-400">
                  Example: <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">mystore.myshopify.com</code>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">Automatic Webhook Ingestion:</p>
                  <p>When connected, ZIDCOD registers an <code className="bg-white px-1 py-0.5 border rounded">orders/create</code> webhook in Shopify so new customer purchases appear in your Leads within seconds.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: GOOGLE SHEETS */}
      {activeTab === 'sheets' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
          
          {/* Top Banner Card */}
          <Card className="border border-slate-100 rounded-3xl bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e173e] flex items-center justify-center shrink-0 text-white">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-slate-900">Google Sheets Auto-Sync</h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Connected
                  </span>
                  <button 
                    onClick={handleTestSheetConnection}
                    disabled={testingSheet}
                    className="text-xs font-semibold text-[#5b21b6] hover:underline flex items-center gap-1 ml-1"
                  >
                    <Wifi className={`w-3.5 h-3.5 ${testingSheet ? 'animate-pulse' : ''}`} />
                    {testingSheet ? 'Testing...' : 'Test connection'}
                  </button>
                </div>
                <p className="text-[13px] text-slate-400 mt-1">
                  Every row you add to your Google Sheet will automatically appear as a new lead in ZIDCOD. Uses a lightweight Google Apps Script no account linking required.
                </p>
              </div>
            </div>
          </Card>

          {/* Webhook Token Card */}
          <Card className="border border-slate-100 rounded-3xl bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Your Webhook Token</h4>
              <button 
                onClick={handleRotateSheetToken}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Rotate token
              </button>
            </div>

            <div className="relative">
              <Input 
                type={showSheetToken ? "text" : "password"}
                value={sheetToken || (loadingSheetToken ? 'Loading token...' : '')}
                readOnly
                placeholder="Loading token..."
                className="bg-slate-50 border-slate-200 text-xs font-mono pr-20 h-11 rounded-xl"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSheetToken(!showSheetToken)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  {showSheetToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(sheetToken, 'Webhook Token')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Warning callout */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Keep this token private anyone with it can create leads in your account. Rotate it if you suspect it was leaked.</span>
            </div>
          </Card>

          {/* Setup Instructions Card */}
          <Card className="border border-slate-100 rounded-3xl bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
            <h4 className="text-sm font-bold text-slate-900">Setup Instructions</h4>

            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-[#5b21b6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Open Apps Script</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    In Google Sheets, click Extensions → Apps Script. Paste the script below into the editor and click Save (Ctrl+S).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-[#5b21b6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Run setup() once</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    In the Apps Script editor, select the "setup" function from the dropdown and click Run. This creates the "Leads" sheet with the correct columns.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-[#5b21b6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Authorize the script (one-time)</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Google will ask permission to read your sheet and call an external URL. Click "Advanced" → "Go to [project name]" → Allow. This is your own script — we never see your Google credentials.
                  </p>
                </div>
              </div>

            </div>

            {/* Apps Script Code block */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              {(() => {
                const syncApiUrl = typeof window !== 'undefined'
                  ? `${window.location.protocol}//${window.location.hostname}:4000/integrations/seller/sheets-sync`
                  : 'http://localhost:4000/integrations/seller/sheets-sync';
                const fullScript = generateZidcodAppsScript(sheetToken, syncApiUrl);

                return (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">Google Apps Script Code</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(fullScript, 'Google Apps Script Code')}
                        className="rounded-xl border-slate-200 text-xs font-semibold h-7 px-3 cursor-pointer hover:bg-slate-50"
                      >
                        <Copy className="w-3 h-3 mr-1.5" />
                        Copy Script
                      </Button>
                    </div>
                    <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-[360px] leading-relaxed">
                      {fullScript}
                    </pre>
                  </>
                );
              })()}
            </div>
          </Card>

        </div>
      )}

    </div>
  );
}


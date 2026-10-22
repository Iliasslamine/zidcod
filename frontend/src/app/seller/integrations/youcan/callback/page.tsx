'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

function YouCanCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (errorParam) {
      setStatus('error');
      setErrorMessage(errorParam);
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setErrorMessage('Missing authorization code or state.');
      return;
    }

    const exchangeCode = async () => {
      try {
        // Send the code to our backend to exchange it for an API token
        await api.post('/integrations/youcan/exchange', {
          code,
          state,
          redirect_uri: window.location.origin + '/seller/integrations/youcan/callback'
        });
        
        setStatus('success');
        toast.success('YouCan connected successfully!');
        
        // Redirect back to integrations page after a short delay
        setTimeout(() => {
          router.push('/seller/integrations');
        }, 2000);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Failed to exchange authorization code.');
      }
    };

    exchangeCode();
  }, [code, state, errorParam, router]);

  return (
    <div className="max-w-xl mx-auto mt-20 font-[family-name:var(--font-geist-sans)]">
      <Card className="border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-[#5e35b1] animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connecting to YouCan...</h2>
              <p className="text-slate-500 text-[15px]">Please wait while we secure your connection.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connection Successful!</h2>
              <p className="text-slate-500 text-[15px]">Your YouCan store is now linked. Redirecting...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connection Failed</h2>
              <p className="text-red-500 text-[15px] mb-6">{errorMessage}</p>
              <button 
                onClick={() => router.push('/seller/integrations')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl px-6 py-3 font-semibold transition-colors"
              >
                Go back to Integrations
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function YouCanCallbackPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-400 text-sm">Processing integration...</div>}>
      <YouCanCallbackContent />
    </Suspense>
  );
}

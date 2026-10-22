'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    
    if (result?.error) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen w-full font-[family-name:var(--font-geist-sans)] bg-[#fafafa]">
      {/* Left Marketing Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0c051a] relative overflow-hidden flex-col">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0 mix-blend-overlay"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-pink-600/30 to-purple-800/30 blur-[100px] z-0"></div>
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-indigo-600/20 to-purple-600/20 blur-[100px] z-0"></div>
        
        <div className="relative z-10 p-12 flex flex-col h-full justify-between">
          <div>
            <div className="font-black text-4xl tracking-widest flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600">ZID</span>
              <span className="text-white">COD</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 tracking-wider mt-1 uppercase">
              One Platform. All Solutions.
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-xl">
            <h1 className="text-white text-5xl font-bold leading-tight mb-4" dir="rtl">
              باغي تبدأ<br/>
              التجارة الإلكترونية<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">بلا رأس المال ؟</span>
            </h1>
            <p className="text-2xl text-slate-300 font-semibold mb-10" dir="rtl">
              اللي عليك هو <span className="text-pink-500">الإعلانات</span><br/>
              ونحن غادي <span className="text-orange-400">نتكلفوا</span> بالباقي
            </p>

            <div className="space-y-4" dir="rtl">
              {[
                { title: 'متجر إلكتروني', icon: '🛒' },
                { title: 'تأكيد الطلبات', icon: '🎧' },
                { title: 'التجهيز والتغليف', icon: '📦' },
                { title: 'التوصيل السريع', icon: '🚚' },
                { title: 'متابعة الطلب (Suivi)', icon: '🔄' },
                { title: 'دفع الأرباح', icon: '💰' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 px-6 max-w-sm backdrop-blur-sm">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg shrink-0">
                    {feature.icon}
                  </div>
                  <span className="text-white font-semibold text-lg">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10">
          <div className="mb-8">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-2 text-[15px]">Sign in to continue managing your business.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-slate-700">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 bg-white border-slate-200 focus-visible:ring-purple-600 rounded-xl text-[15px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-11 pr-11 h-12 bg-white border-slate-200 focus-visible:ring-purple-600 rounded-xl text-[15px] font-medium tracking-wide"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600" />
                <label htmlFor="remember" className="text-[13px] font-medium text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-[13px] font-bold text-purple-600 hover:text-purple-700 transition-colors">
                Forget password?
              </a>
            </div>

            {error && (
              <div className="text-[13px] text-rose-600 font-medium bg-rose-50 p-3 rounded-lg border border-rose-100">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[15px] rounded-xl transition-all shadow-md group mt-2"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative bg-white px-4 text-[12px] text-slate-400">or</div>
          </div>

          <div className="mt-8 text-center text-[14px]">
            <span className="text-slate-500 font-medium">New seller? </span>
            <Link href="/register" className="font-bold text-purple-600 hover:text-purple-700 transition-colors">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

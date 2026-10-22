'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  CreditCard, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tangier',
  'Fes',
  'Agadir',
  'Meknes',
  'Oujda',
  'Kenitra',
  'Tetouan',
  'Safi',
  'Mohammedia',
  'El Jadida',
  'Nador',
  'Beni Mellal',
  'Khouribga',
  'Taza',
  'Settat',
  'Larache',
  'Ksar El Kebir',
  'Guelmim',
  'Berrechid',
  'Ouarzazate',
  'Dakhla',
  'Laayoune',
  'Other'
];

const MOROCCAN_BANKS = [
  'Attijariwafa Bank',
  'Banque Populaire (BCP)',
  'Bank of Africa (BMCE)',
  'CIH Bank',
  'Société Générale Maroc',
  'Crédit du Maroc',
  'Crédit Agricole du Maroc (CAM)',
  'CFG Bank',
  'Al Barid Bank',
  'Umnia Bank',
  'Bank Assafa'
];

export default function RegisterPage() {
  const router = useRouter();
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [bankName, setBankName] = useState('');
  const [rib, setRib] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service to continue.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Clean and normalize phone
    let cleanPhone = phone.trim().replace(/\s+/g, '').replace(/[-().]/g, '');
    if (cleanPhone.startsWith('+212')) cleanPhone = '0' + cleanPhone.substring(4);
    else if (cleanPhone.startsWith('212')) cleanPhone = '0' + cleanPhone.substring(3);
    else if (/^[67]\d{8}$/.test(cleanPhone)) cleanPhone = '0' + cleanPhone;

    // Clean RIB if provided
    const cleanRib = rib.replace(/\s+/g, '');
    if (cleanRib && !/^\d{24}$/.test(cleanRib)) {
      setError('Moroccan RIB must be exactly 24 digits.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password,
        role: 'SELLER',
        fullName: fullName.trim(),
        storeName: storeName.trim() || fullName.trim(),
        contact: cleanPhone,
        city,
        bankName: bankName || undefined,
        rib: cleanRib || undefined,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Account created successfully! You can now sign in.');
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to register account');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-[family-name:var(--font-geist-sans)] bg-[#fafafa]">
      
      {/* Left Marketing Panel */}
      <div className="hidden lg:flex w-5/12 bg-[#0c051a] relative overflow-hidden flex-col justify-between p-12 shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0 mix-blend-overlay"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-pink-600/30 to-purple-800/30 blur-[100px] z-0"></div>
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-indigo-600/20 to-purple-600/20 blur-[100px] z-0"></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <div className="font-black text-4xl tracking-widest flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600">ZID</span>
              <span className="text-white">COD</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 tracking-wider mt-1 uppercase">
              One Platform. All Solutions.
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-purple-200 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Join 1,200+ Top Moroccan Sellers</span>
          </div>

          <h1 className="text-white text-4xl font-extrabold leading-tight mb-4" dir="rtl">
            ابدأ رحلتك في<br/>
            التجارة الإلكترونية<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">بأقوى منصة COD في المغرب</span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed mb-8" dir="rtl">
            منتجات رابحة، تأكيد الطلبات عبر الكول سنتر، شحن فوري بجميع المدن، وسحب أرباحك أسبوعياً بكل سهولة.
          </p>

          <div className="space-y-3.5" dir="rtl">
            {[
              { title: 'أكثر من 80+ منتج رابح في السوق المغربي', icon: '🏆' },
              { title: 'كول سنتر احترافي لرفع نسبة التأكيد لأكثر من 85%', icon: '🎧' },
              { title: 'توصيل سريع مع شحن وتخزين مجاني في مستودعاتنا', icon: '🚚' },
              { title: 'سحب سريع للأرباح إلى جميع البنوك المغربية', icon: '💳' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-2xl p-3 px-5 backdrop-blur-sm">
                <span className="text-xl">{f.icon}</span>
                <span className="text-white text-sm font-semibold">{f.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} ZIDCOD Inc.</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Secure &amp; Verified
          </span>
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[620px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-10 my-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="w-13 h-13 bg-purple-50 rounded-2xl flex items-center justify-center mb-5 text-[#5b21b6]">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Create Seller Account</h2>
            <p className="text-slate-500 mt-1.5 text-sm">
              Enter your details to launch your Moroccan COD business on ZIDCOD.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 text-sm text-rose-600 bg-rose-50/80 p-4 rounded-2xl border border-rose-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* Section 1: Personal Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <User className="w-4 h-4 text-[#5b21b6]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">1. Personal &amp; Store Info</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="e.g. Youssef Bennani"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-purple-600 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Store Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Store className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="e.g. Atlas Deals"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                      className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-purple-600 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Mail className="w-4 h-4 text-[#5b21b6]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">2. Contact Details</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-purple-600 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Phone (WhatsApp) *</label>
                    <div className="flex">
                      <span className="inline-flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 select-none">
                        <span>🇲🇦</span>
                        <span>+212</span>
                      </span>
                      <Input
                        type="tel"
                        placeholder="612345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="rounded-l-none h-11 bg-white border-slate-200 focus-visible:ring-purple-600 rounded-r-xl text-sm font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Used for order confirmations and payouts.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">City *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-slate-400" />
                      </div>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 h-11 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-xl text-sm font-medium text-slate-800"
                      >
                        {MOROCCAN_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Bank Details (Optional) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#5b21b6]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">3. Bank Details for Payouts</h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Optional (Can add later)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Bank Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-xl text-sm font-medium text-slate-800"
                    >
                      <option value="">Select your bank...</option>
                      {MOROCCAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">RIB (24 digits)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      type="text"
                      maxLength={24}
                      placeholder="007 780 0001234567890123 45"
                      value={rib}
                      onChange={(e) => setRib(e.target.value.replace(/[^\d]/g, ''))}
                      className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-purple-600 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Security */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Lock className="w-4 h-4 text-[#5b21b6]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">4. Security</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10 pr-10 h-11 bg-white border-slate-200 focus-visible:ring-purple-600 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Confirm Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10 pr-10 h-11 bg-white border-slate-200 focus-visible:ring-purple-600 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms of Service Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to ZIDCOD's{' '}
                  <span className="text-purple-600 font-semibold hover:underline">Terms of Service</span>,{' '}
                  <span className="text-purple-600 font-semibold hover:underline">Fulfillment Agreement</span>, and{' '}
                  <span className="text-purple-600 font-semibold hover:underline">Privacy Policy</span>.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-bold text-sm rounded-xl transition-all shadow-md group cursor-pointer"
            >
              {loading ? 'Creating your account...' : 'Create Seller Account'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>

          </form>

          {/* Footer link to login */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link href="/login" className="font-bold text-[#5b21b6] hover:text-[#4c1d95] transition-colors">
              Sign in
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

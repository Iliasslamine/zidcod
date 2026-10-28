'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Store, 
  Phone, 
  MapPin, 
  Building2, 
  Lock, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

const MOROCCAN_CITIES = [
  'Meknès',
  'Casablanca',
  'Rabat',
  'Fes',
  'Marrakech',
  'Tangier',
  'Agadir',
  'Oujda',
  'Kenitra',
  'Tetouan',
  'Safi',
  'Mohammedia',
  'El Jadida',
  'Nador',
  'Beni Mellal'
];

const MOROCCAN_BANKS = [
  'Attijariwafa Bank',
  'Banque Populaire (BCP)',
  'CIH Bank',
  'Bank of Africa (BMCE)',
  'Société Générale Maroc',
  'Crédit Agricole du Maroc',
  'CFG Bank',
  'Al Barid Bank'
];

export function SellerProfileView() {
  const [activeTab, setActiveTab] = useState<'profile' | 'bank' | 'security'>('profile');

  // Profile state
  const [fullName, setFullName] = useState('ILIASS LAMINE');
  const [storeName, setStoreName] = useState('RUVANO');
  const [phone, setPhone] = useState('+212649847132');
  const [city, setCity] = useState('Meknès');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Bank state
  const [bankName, setBankName] = useState('');
  const [rib, setRib] = useState('');
  const [isSavingBank, setIsSavingBank] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // General error banner state
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Load existing profile from API on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const res = await fetch('/api/seller/profile');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.fullName) setFullName(data.fullName);
            if (data.storeName) setStoreName(data.storeName);
            if (data.contact) setPhone(data.contact);
            if (data.city) setCity(data.city);
            if (data.bankName) setBankName(data.bankName);
            if (data.rib) setRib(data.rib);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute initials for avatar (e.g. "IL")
  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return 'IL';
  };

  // Real-time password validations
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatch = confirmPassword.length > 0 && confirmPassword === newPassword;
  const isSecurityValid = hasMinLength && hasUppercase && hasNumber && isMatch;

  // Handle Tab 1: Profile Save
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setIsSavingProfile(true);

    try {
      const res = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          storeName,
          contact: phone,
          city,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
    } catch (err: any) {
      const msg = err.message || 'Failed to update profile';
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Tab 2: Bank Save
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    const cleanRib = rib.replace(/\D/g, '');
    if (cleanRib && cleanRib.length !== 24) {
      const msg = 'RIB must be exactly 24 digits';
      setErrorBanner(msg);
      toast.error(msg);
      return;
    }

    setIsSavingBank(true);
    try {
      const res = await fetch('/api/seller/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName,
          rib: cleanRib,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save bank information');
      }

      toast.success('Bank information saved');
    } catch (err: any) {
      const msg = err.message || 'Failed to save bank information';
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setIsSavingBank(false);
    }
  };

  // Handle Tab 3: Security Save
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!isSecurityValid) {
      const msg = 'Please meet all password requirements and ensure passwords match';
      setErrorBanner(msg);
      toast.error(msg);
      return;
    }

    setIsSavingSecurity(true);
    try {
      const res = await fetch('/api/seller/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.message || 'Failed to update password';
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-[family-name:var(--font-geist-sans)] text-[#111827]">
      {/* Top Header Card / Section */}
      <div className="flex items-center gap-4 pb-2">
        {/* Avatar: 48px x 48px solid #5E2AE2 with bold white initials */}
        <div 
          className="w-12 h-12 rounded-full bg-[#5E2AE2] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 select-none"
          aria-label="User Avatar"
        >
          {getInitials(fullName)}
        </div>

        {/* Stacked Name & Store */}
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold text-[#111827] uppercase tracking-wide leading-tight">
            {fullName || 'ILIASS LAMINE'}
          </h1>
          <p className="text-sm font-medium text-[#6B7280] leading-tight mt-0.5">
            {storeName || 'RUVANO'}
          </p>
        </div>
      </div>

      {/* 3-Tab Navigation Switcher */}
      <div className="flex items-center gap-8 border-b border-[#E5E7EB] mt-7 mb-7">
        {/* Tab 1: Profile */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('profile');
            setErrorBanner(null);
          }}
          className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'profile'
              ? 'text-[#5E2AE2]'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5E2AE2] rounded-full" />
          )}
        </button>

        {/* Tab 2: Bank */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('bank');
            setErrorBanner(null);
          }}
          className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'bank'
              ? 'text-[#5E2AE2]'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bank</span>
          {activeTab === 'bank' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5E2AE2] rounded-full" />
          )}
        </button>

        {/* Tab 3: Security */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('security');
            setErrorBanner(null);
          }}
          className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'security'
              ? 'text-[#5E2AE2]'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security</span>
          {activeTab === 'security' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5E2AE2] rounded-full" />
          )}
        </button>
      </div>

      {/* Error Banner */}
      {errorBanner && (
        <div className="max-w-xl mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Tab 1 Content: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="max-w-xl space-y-5 animate-in fade-in duration-200">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                required
                className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#5E2AE2] focus:ring-2 focus:ring-[#5E2AE2]/20 outline-none transition-all font-normal"
              />
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              Store Name
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Store Name"
                required
                className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#5E2AE2] focus:ring-2 focus:ring-[#5E2AE2]/20 outline-none transition-all font-normal"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212649847132"
                required
                className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#5E2AE2] focus:ring-2 focus:ring-[#5E2AE2]/20 outline-none transition-all font-normal"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 pl-10 pr-10 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:border-[#5E2AE2] focus:ring-2 focus:ring-[#5E2AE2]/20 outline-none transition-all appearance-none cursor-pointer font-normal"
              >
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="bg-[#5E2AE2] hover:bg-[#4D20C4] text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSavingProfile ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2 Content: Bank */}
      {activeTab === 'bank' && (
        <form onSubmit={handleBankSubmit} className="max-w-xl space-y-5 animate-in fade-in duration-200">
          {/* Sub-header notice */}
          <p className="text-sm text-[#6B7280] leading-relaxed">
            This information is used by admin to send your payouts. Keep it accurate.
          </p>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              Bank Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full h-11 pl-10 pr-10 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:border-[#5E2AE2] focus:ring-2 focus:ring-[#5E2AE2]/20 outline-none transition-all appearance-none cursor-pointer font-normal"
              >
                <option value="" disabled>Select your bank</option>
                {MOROCCAN_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* RIB (24 digits) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#111827]">
                RIB <span className="text-[#6B7280] font-normal text-xs">(24 digits)</span>
              </label>
              <span className={`text-xs font-medium ${rib.length === 24 ? 'text-emerald-600 font-semibold' : 'text-[#6B7280]'}`}>
                {rib.length}/24 digits
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={rib}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 24);
                  setRib(cleaned);
                }}
                placeholder="000000000000000000000000"
                maxLength={24}
                className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#5E2AE2] focus:ring-2 focus:ring-[#5E2AE2]/20 outline-none transition-all tracking-wider font-mono font-normal"
              />
              {rib.length === 24 && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingBank}
              className="bg-[#5E2AE2] hover:bg-[#4D20C4] text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSavingBank && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSavingBank ? 'Saving Bank Info...' : 'Save Bank Info'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3 Content: Security */}
      {activeTab === 'security' && (
        <form onSubmit={handleSecuritySubmit} className="max-w-xl space-y-5 animate-in fade-in duration-200">
          {/* Header Row: Hint text on left, Show/Hide toggle on right */}
          <div className="flex items-center justify-between pb-1 border-b border-[#F3F4F6]">
            <p className="text-xs md:text-sm text-[#6B7280]">
              Min 8 characters, one uppercase letter, one number.
            </p>
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-xs font-semibold text-[#5E2AE2] hover:text-[#4D20C4] flex items-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#5E2AE2]" />}
              <span>{showPasswords ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#5E2AE2] focus:ring-2 focus:ring-[#5E2AE2]/20 outline-none transition-all font-normal"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase + number"
                className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#5E2AE2] focus:ring-2 focus:ring-[#5E2AE2]/20 outline-none transition-all font-normal"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              Confirm New
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#5E2AE2] focus:ring-2 focus:ring-[#5E2AE2]/20 outline-none transition-all font-normal"
              />
            </div>
          </div>

          {/* Real-time Validation Indicators */}
          {newPassword.length > 0 && (
            <div className="p-3.5 bg-gray-50/80 rounded-lg border border-[#E5E7EB] space-y-2">
              <div className="text-xs font-semibold text-[#111827] mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5E2AE2]" />
                <span>Password Requirements</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-[#6B7280]'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${hasMinLength ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                    {hasMinLength ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                  </div>
                  <span>At least 8 characters</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 font-medium' : 'text-[#6B7280]'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${hasUppercase ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                    {hasUppercase ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                  </div>
                  <span>One uppercase letter</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-[#6B7280]'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${hasNumber ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                    {hasNumber ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                  </div>
                  <span>One number (0-9)</span>
                </div>

                <div className={`flex items-center gap-1.5 ${isMatch ? 'text-emerald-600 font-medium' : 'text-[#6B7280]'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isMatch ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                    {isMatch ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                  </div>
                  <span>Passwords match</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Button: Outlined light button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingSecurity}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSavingSecurity && <Loader2 className="w-4 h-4 animate-spin text-gray-600" />}
              <span>{isSavingSecurity ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  LayoutDashboard, ShoppingBag, CheckSquare, Package, 
  PlusCircle, Upload, Zap, Activity,
  Users, CreditCard, Sparkles, Box, Headset, FileText, Blocks, Users2, Settings,
  MessageCircle, PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const adminLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Marketplace', href: '/admin/marketplace', icon: ShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: CheckSquare },
  { name: 'Sellers', href: '/admin/sellers', icon: Users },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Simulation', href: '/admin/simulation', icon: Activity },
  { name: 'AI Studio', href: '/admin/ai-studio', icon: Sparkles },
  { name: 'Services', href: '/admin/services', icon: Box },
  { name: 'Complaints', href: '/admin/complaints', icon: Headset },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Integrations', href: '/admin/integrations', icon: Zap },
  { name: 'Users & Roles', href: '/admin/users-roles', icon: Users2 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const sellerLinks = [
  { name: 'Dashboard', href: '/seller', icon: LayoutDashboard },
  { name: 'Marketplace', href: '/seller/marketplace', icon: ShoppingBag },
  { name: 'Orders', href: '/seller/orders', icon: CheckSquare },
  { name: 'Packs', href: '/seller/packs', icon: Package },
  { name: 'Create Lead', href: '/seller/leads/create', icon: PlusCircle },
  { name: 'Import Leads', href: '/seller/leads/import', icon: Upload },
  { name: 'Integrations', href: '/seller/integrations', icon: Zap },
  { name: 'Simulation', href: '/seller/simulation', icon: Activity },
  { name: 'AI Studio', href: '/seller/ai-studio', icon: Sparkles },
  { name: 'Services', href: '/seller/services', icon: Blocks },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const isSeller = status === 'loading' 
    ? pathname.startsWith('/seller')
    : (session?.user as any)?.role === 'SELLER';
    
  const links = isSeller ? sellerLinks : adminLinks;
  
  return (
    <aside className="w-[260px] bg-[#1a1133] text-white h-screen flex flex-col sticky top-0 shrink-0 font-[family-name:var(--font-geist-sans)] relative z-20">
      <div className="h-[72px] flex items-center justify-between px-6 shrink-0 relative z-10 border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* Zidcod Logo */}
          <div className="flex flex-col relative">
             <div className="flex font-black text-xl tracking-tight items-center leading-none">
               <span className="text-[#f43f5e]">Z</span>
               <span className="text-white">ID</span>
               <span className="text-[#f43f5e]">C</span>
               <span className="text-white">OD</span>
             </div>
          </div>
        </div>
        <button className="text-slate-500 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-none relative z-10">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && link.href !== '/seller' && pathname.startsWith(link.href + '/'));
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-[15px] font-medium group",
                isActive 
                  ? "bg-[#6d28d9] text-white shadow-md" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("w-[20px] h-[20px]", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} strokeWidth={2} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Support Buttons */}
      <div className="px-4 py-4 space-y-2 bg-[#140d27] border-t border-white/5">
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
          <div className="bg-[#6d28d9] p-2 rounded-lg shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-bold text-white truncate leading-tight">WhatsApp</span>
            <span className="text-[12px] text-slate-400 truncate leading-tight mt-0.5 group-hover:text-slate-300">Chat with your account mana...</span>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
          <div className="bg-[#6d28d9] p-2 rounded-lg shrink-0">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-bold text-white truncate leading-tight">YouTube</span>
            <span className="text-[12px] text-slate-400 truncate leading-tight mt-0.5 group-hover:text-slate-300">Tips, tutorials, news</span>
          </div>
        </button>
      </div>

      <div className="px-6 py-5 bg-[#140d27] border-t border-white/5 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl bg-gradient-to-br from-pink-500 to-orange-500"></div>
           <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full blur-2xl bg-[#6d28d9]"></div>
        </div>
        <div className="relative z-10 font-black text-[18px] tracking-tight flex items-center leading-none mb-1">
          <span className="text-white">ZID</span>
          <span className="text-[#f43f5e]">COD</span>
        </div>
        <div className="relative z-10 text-[9px] font-bold text-slate-300 tracking-wider uppercase opacity-80">
          One Platform. All Solutions.
        </div>
      </div>
    </aside>
  );
}

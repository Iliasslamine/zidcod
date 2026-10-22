'use client';

import { Bell, ChevronDown, Calendar, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function TopHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const isSellerRoute = pathname.startsWith('/seller');
  const isSeller = status === 'loading' 
    ? isSellerRoute 
    : (session?.user as any)?.role === 'SELLER';
    
  const role = isSeller ? 'Seller' : 'Super Admin';
  const name = isSeller ? 'Seller' : 'Yassine Dradar';
  
  const getPageTitle = () => {
    if (pathname.includes('/marketplace')) return 'Marketplace';
    if (pathname.includes('/orders')) return 'Orders';
    if (pathname.includes('/sellers')) return 'Sellers';
    if (pathname.includes('/billing')) return 'Billing';
    if (pathname.includes('/simulation')) return 'Simulation';
    if (pathname.includes('/ai-studio')) return 'AI Studio';
    return 'Dashboard';
  };

  return (
    <header className="hidden md:flex h-[72px] w-full items-center justify-end border-b border-slate-100 bg-white px-8 shrink-0 sticky top-0 z-10 font-[family-name:var(--font-geist-sans)]">
        {/* Gray Pill Dropdown Mock */}
        <Button variant="secondary" className="flex items-center gap-2 h-9 bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 font-medium px-4 rounded-lg border-0 shadow-none">
          <span>Today</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="relative text-slate-400 hover:text-slate-600 transition-colors ml-1 w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 outline-none cursor-pointer">
            <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 shadow-lg border-slate-100 rounded-xl mt-2 p-0">
            <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-800 text-sm">Notifications</div>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">New product request</p>
                <p className="text-xs text-slate-500">Store A requested access to "Wireless Earbuds"</p>
                <p className="text-[10px] text-slate-400 mt-2">2 mins ago</p>
              </div>
              <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">Payout requested</p>
                <p className="text-xs text-slate-500">Store B has requested a payout of 3400 DH</p>
                <p className="text-[10px] text-slate-400 mt-2">1 hour ago</p>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-slate-100 text-center">
              <span className="text-xs font-bold text-[#7c3aed] cursor-pointer hover:underline">View all</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none flex items-center gap-3 cursor-pointer group ml-2">
            <Avatar className="h-10 w-10 border-0 transition-all">
              <AvatarFallback className="bg-[#7c3aed] text-white font-bold text-sm">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-slate-800 group-hover:text-slate-950 transition-colors leading-tight">{name}</span>
              <span className="text-[11px] text-slate-400 font-medium leading-tight">{role}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-100 rounded-xl mt-2">
            <DropdownMenuItem className="font-medium text-slate-700 cursor-pointer focus:bg-slate-50">Profile</DropdownMenuItem>
            <DropdownMenuItem className="font-medium text-slate-700 cursor-pointer focus:bg-slate-50">Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="font-bold text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    </header>
  );
}

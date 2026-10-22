'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { TopHeader } from './TopHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
      <SessionProvider>
        <div className="min-h-screen bg-gray-50">{children}</div>
        <Toaster richColors position="top-right" />
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <div className="flex h-screen w-full bg-[#fffbf7] overflow-hidden font-[family-name:var(--font-geist-sans)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shadow-2xl z-20">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopHeader />
          {/* Mobile Header */}
          <header className="md:hidden h-16 border-b bg-white flex items-center px-4 sticky top-0 z-10 shadow-sm">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Sidebar />
              </SheetContent>
            </Sheet>
            <div className="ml-4 font-extrabold text-xl tracking-widest">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">ZID</span>
              <span className="text-slate-900">COD</span>
            </div>
          </header>
          
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </SessionProvider>
  );
}

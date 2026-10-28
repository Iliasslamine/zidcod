import { SellerProfileView } from '@/components/seller/SellerProfileView';

export const metadata = {
  title: 'Seller Settings | ZIDCOD',
  description: 'Manage your seller settings, payout bank info, and security credentials.',
};

export default function SellerSettingsPage() {
  return (
    <div className="py-2 px-1 md:px-4">
      <SellerProfileView />
    </div>
  );
}

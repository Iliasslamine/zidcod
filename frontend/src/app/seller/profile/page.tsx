import { SellerProfileView } from '@/components/seller/SellerProfileView';

export const metadata = {
  title: 'Seller Profile | ZIDCOD',
  description: 'Manage your seller profile, payout bank information, and security preferences.',
};

export default function SellerProfilePage() {
  return (
    <div className="py-2 px-1 md:px-4">
      <SellerProfileView />
    </div>
  );
}

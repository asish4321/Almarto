import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { PincodeProvider } from '@/context/PincodeContext';

export const metadata: Metadata = {
  title: 'ALMARTO – Pop DIY Toys & Designer Craft Universe',
  description:
    'Unbox the joy of hands-on pop art! Explore paint-your-own blank vinyl figures, mystery DIY blind boxes, motion-sensing miniature room dioramas, and articulated pop brick mechs.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Supabase so DB queries and image CDN connections start early */}
        <link rel="preconnect" href="https://aws-0-ap-southeast-2.pooler.supabase.com" />
        <link rel="dns-prefetch" href="https://aws-0-ap-southeast-2.pooler.supabase.com" />
        {/* Preconnect for Supabase storage (product images CDN) */}
        <link rel="preconnect" href="https://mnftlaxcqpwpylswkkjm.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://mnftlaxcqpwpylswkkjm.supabase.co" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#EFE9DF] text-[#1B2721] antialiased selection:bg-[#527863] selection:text-[#FAF6F0]">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <PincodeProvider>{children}</PincodeProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

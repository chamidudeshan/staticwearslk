export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Bebas_Neue, Space_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from '@/components/ui/sonner';
import { CustomCursor } from '@/components/ui/cursor';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Static Wears — Drop Culture Sri Lanka',
  description:
    'Premium streetwear crafted in Sri Lanka. New drops. Bold designs. Built different.',
  keywords: ['streetwear', 'Sri Lanka', 'fashion', 'clothing', 'static wears'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider signInUrl="/login" signUpUrl="/register">
      <html
        lang="en"
        className={`${bebasNeue.variable} ${spaceMono.variable}`}
      >
        <body className="bg-[#080808] text-[#f0f0f0] antialiased">
          <CartProvider>
            <CustomCursor />
            {children}
            <Toaster position="bottom-right" theme="dark" />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

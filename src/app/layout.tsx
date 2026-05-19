import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { site } from '@/config/site';
import { SiteSchema } from '@/components/site-schema';
import './globals.css';

// TODO /setup: import project fonts from next/font/google based on brand.md Typography section
// Example:
//   import { Inter } from 'next/font/google';
//   const inter = Inter({ subsets: ['latin'], variable: '--font-heading' });
// Then add the variable className to <html> and 'font-heading' to <body>

export const viewport: Viewport = {
  // Shrinks layout viewport when on-screen keyboard opens — h-dvh containers exclude keyboard height.
  // Do not add keyboardOffset or visualViewport hacks in individual components.
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.ogTitle,
  description: site.description,
  // /assets generates favicons — re-run if the logomark changes.
  // SINGLE mode (colored mark): SVG favicon is primary, one PNG fallback. Use this block.
  // DUAL/AUTO mode (grayscale mark): use icon-light.png + icon-dark.png with media queries instead.
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/icon-light.png' }],
  },
  openGraph: {
    title: site.ogTitle,
    description: site.ogDescription ?? site.description,
    url: site.url,
    siteName: site.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: site.social?.twitterHandle,
    title: site.ogTitle,
    description: site.ogDescription ?? site.description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // TODO /setup: add font variable className(s) to <html> once fonts are configured above
  return (
    <html lang="en">
      <body className="font-heading antialiased">
        <SiteSchema />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
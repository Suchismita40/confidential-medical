import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'MedEx — Private Medical Research Data Exchange | Midnight Preprod',
  description: 'Confidential clinical dataset sharing, zero-knowledge researcher verification, and rate-limited access quotas built on Midnight blockchain.',
  keywords: [
    'Midnight Network',
    'Zero-Knowledge Proofs',
    'Compact Smart Contracts',
    'Confidential Medical Data',
    'Healthcare Privacy',
    'HIPAA Compliance',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-midnight-950 text-slate-100 antialiased selection:bg-teal-500 selection:text-midnight-950 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

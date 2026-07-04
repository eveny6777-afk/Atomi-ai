import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Atomic AI - AI SaaS Platform',
  description: 'Production-ready AI SaaS platform built with Next.js and NestJS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeuroCharge AI',
  description: 'Intelligent Battery Health Monitoring System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

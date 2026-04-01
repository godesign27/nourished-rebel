import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { EmailCaptureSection } from '../home/EmailCaptureSection';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <EmailCaptureSection />
      <Footer />
    </div>
  );
}

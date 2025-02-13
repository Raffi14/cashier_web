'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarChart, Store } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                SwiftPOS V2
              </span>
              <span className="ml-2 text-sm text-muted-foreground hidden sm:block border-l border-border pl-2">
                | Point of Sale System
              </span>
            </div>
            <div className="flex items-center">
              <Button
                onClick={() => router.push('/login')}
                className="bg-primary hover:bg-primary/90 transition-colors"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto py-12  px-4 sm:py-18 sm:px-4 lg:px-8">
          <div className="text-center space-y-12">
            <div className="space-y-8">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                <span className="block bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Efficient Solutions for
                </span>
                <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Modern Business
                </span>
              </h1>
            </div>
            <BarChart className="h-64 w-64 text-primary sm:block mx-auto transform transition-transform hover:scale-105" />
            <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl">
              Simplify your business operations with our advanced point of sale system. 
              Designed for speed and ease of use, our solution streamlines transactions
              and helps you manage your business more efficiently. Reliable, secure, 
              and ready to support your growth.
            </p>
          </div>
        </div>
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-background shadow-xl shadow-primary/5 ring-1 ring-primary/10" />
      </div>
    </div>
  );
}
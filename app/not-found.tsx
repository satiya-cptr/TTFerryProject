"use client";

import { DoubleStackButton } from '@/components/ui/doubleStackButton';
import RollingText from '@/components/ui/rollingText';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-light-surface px-6 text-center">

      <div className="absolute overflow-hidden pointer-events-none opacity-8">
        <h1 className="text-[40vw] font-bold text-blue-surface select-none">404</h1>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="font-inter-tight font-semibold text-sm text-blue-ink uppercase tracking-widest mb-6">
          Error 404
        </h2>
        
        <p className="font-inter-tight font-normal text-3xl lg:text-4xl text-blue-ink/60  leading-tight mb-6">
          Looks like this page doesn't exist <span className='font-light text-blue-ink/30 italic'>(yet)</span> 
        </p>

        <Link href="/">
          <DoubleStackButton variant="light" className="w-full hover:text-butter transition-colors">
            <RollingText primary={"return to harbor"} secondary={"return to harbor"} />
          </DoubleStackButton>
        </Link>
      </div>
    </main>
  );
}
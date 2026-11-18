'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import data from '@/assets/bird-love.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Jeda dalam milidetik: [minimal, maksimal]
const FIRST: [number, number] = [800, 2000]; // muncul pertama kali
const GAP: [number, number] = [3000, 8000]; // jeda acak antar kemunculan
const rand = ([a, b]: [number, number]) => a + Math.random() * (b - a);

export default function BirdLove({ cls = '' }: { cls?: string }) {
  const [still, setStill] = useState(false);
  const [on, setOn] = useState(false);
  const [run, setRun] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const schedule = useCallback((range: [number, number]) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setRun((n) => n + 1); setOn(true); }, rand(range));
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setStill(reduce);
    if (!reduce) schedule(FIRST);
    return () => clearTimeout(timer.current);
  }, [schedule]);

  return (
    <div className={`${cls} aspect-[350/300] transition-opacity duration-500 ${on || still ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
      {(run > 0 || still) && (
        <Lottie key={run} animationData={data} loop={false} autoplay={!still}
          onComplete={() => { setOn(false); schedule(GAP); }} />
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useLocale } from './locale-provider';

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  const { locale, path } = useLocale();
  return (
    <Link
      className="inline-flex items-center gap-3 rounded-sm"
      href={path()}
      aria-label={`Amateur Cycling Stats, ${locale === 'es' ? 'inicio' : 'home'}`}
    >
      <span
        className={`display-font grid h-11 w-11 place-items-center border-2 text-xl font-bold leading-none ${inverse ? 'border-white text-white' : 'border-[#102a43] text-[#102a43]'}`}
        aria-hidden="true"
      >
        21
      </span>
      <span className={`display-font text-xl font-semibold leading-[0.9] ${inverse ? 'text-white' : 'text-[#102a43]'}`}>
        Amateur Cycling
        <br />
        Stats
      </span>
    </Link>
  );
}

'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface SortSelectProps {
  currentSort: string;
}

export default function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('sort', e.target.value);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <select
      className="form-control"
      style={{ padding: '6px 12px', height: '36px', minWidth: '150px' }}
      value={currentSort}
      onChange={handleSortChange}
    >
      <option value="latest">Latest Arrivals</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="title-asc">Product Name (A-Z)</option>
    </select>
  );
}

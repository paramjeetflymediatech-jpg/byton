'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function BlogSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [query, setQuery] = useState(initialQuery);

  // Sync component state when the search query parameter changes in the URL (e.g. browser back/forward)
  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Debounce the URL update on input change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only navigate if the URL param actually differs from the state
      const currentParam = searchParams.get('search') || '';
      if (query !== currentParam) {
        const params = new URLSearchParams(window.location.search);
        if (query.trim()) {
          params.set('search', query);
        } else {
          params.delete('search');
        }
        // Always reset page to 1 when search query changes
        params.delete('page');

        const queryString = params.toString();
        router.push(`/blog${queryString ? '?' + queryString : ''}`, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles by title, categories, tags..."
        className="blog-search-input"
        style={{
          width: '100%',
          padding: '14px 44px 14px 48px',
          borderRadius: '30px',
          border: '1px solid var(--border)',
          backgroundColor: 'white',
          fontSize: '15px',
          outline: 'none',
          boxShadow: 'var(--shadow-sm)'
        }}
      />
      <Search 
        size={18} 
        style={{ 
          position: 'absolute', 
          left: '18px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: 'var(--text-muted)' 
        }} 
      />
      {query && (
        <button
          onClick={handleClear}
          type="button"
          style={{
            position: 'absolute',
            right: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

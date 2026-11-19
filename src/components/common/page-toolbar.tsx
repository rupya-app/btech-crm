'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageToolbarProps {
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageToolbar({
  searchPlaceholder = 'Search records, contacts, details...',
  children,
  className,
}: PageToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        'bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4',
        className
      )}
      style={{ padding: '18px 22px', gap: '16px' }}
    >
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center gap-3 flex-1 max-w-lg h-11 px-4 rounded-xl border border-border bg-[#F8FAFB] focus-within:bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/15 transition-all"
        style={{ padding: '0 14px', gap: '10px', height: '44px' }}
      >
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full h-full bg-transparent text-[13.5px] text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClear}
            className="text-text-muted hover:text-text-primary p-1 shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {children && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap" style={{ gap: '12px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

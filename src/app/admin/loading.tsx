import React from 'react';

export default function AdminLoading() {
  return (
    <div
      className="w-full flex flex-col animate-pulse"
      style={{ gap: '24px', paddingBottom: '48px' }}
    >
      <div className="flex items-center justify-between" style={{ gap: '16px' }}>
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200/80 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200/60 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-200/70 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '20px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 rounded-2xl bg-white border border-border"
            style={{ padding: '24px' }}
          >
            <div className="h-4 w-28 bg-slate-200/70 rounded-md mb-4" />
            <div className="h-8 w-20 bg-slate-200/90 rounded-lg" />
          </div>
        ))}
      </div>

      <div
        className="h-80 rounded-2xl bg-white border border-border"
        style={{ padding: '24px' }}
      >
        <div className="h-5 w-48 bg-slate-200/70 rounded-md mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((r) => (
            <div key={r} className="h-12 w-full bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

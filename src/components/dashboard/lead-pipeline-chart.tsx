import React from 'react';
import Link from 'next/link';
import { PipelineStage } from '@/services/analytics.service';
import { formatNumber } from '@/lib/utils';

interface LeadPipelineChartProps {
  stages: PipelineStage[];
  totalLeads: number;
}

export function LeadPipelineChart({ stages, totalLeads }: LeadPipelineChartProps) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Sales Pipeline Funnel</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time stage distribution across {formatNumber(totalLeads)} active leads
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          View all leads →
        </Link>
      </div>

      {/* Multi-segmented horizontal progress bar (as in reference Image 5) */}
      <div className="h-3 w-full rounded-full bg-surface-muted overflow-hidden flex gap-0.5 p-0.5 border border-border-light shadow-inner mb-6">
        {stages.map((stage) => {
          if (stage.count <= 0) return null;
          const widthPct = Math.max(2, (stage.count / (totalLeads || 1)) * 100);
          return (
            <div
              key={stage.status}
              style={{
                width: `${widthPct}%`,
                backgroundColor: stage.color,
              }}
              className="h-full rounded-xs transition-all duration-300 hover:opacity-90"
              title={`${stage.label}: ${stage.count} (${stage.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Stage Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage) => (
          <Link
            key={stage.status}
            href={`/admin/leads?status=${stage.status}`}
            className="flex flex-col p-3 rounded-xl bg-surface-muted/60 border border-border-light hover:border-primary-200 hover:bg-surface transition-all group"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: stage.color }}
              />
              <span className="text-xs font-medium text-text-secondary truncate group-hover:text-text-primary">
                {stage.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-lg font-bold text-text-primary tabular-nums">
                {formatNumber(stage.count)}
              </span>
              <span className="text-[11px] font-medium text-text-muted">
                {stage.percentage}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { PipelineStage } from '@/services/analytics.service';
import { formatNumber } from '@/lib/utils';

interface LeadPipelineChartProps {
  stages: PipelineStage[];
  totalLeads: number;
}

const STAGE_PALETTE: Record<
  string,
  { color: string; bg: string; border: string; text: string; label: string }
> = {
  new: {
    color: '#0EA5E9',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    text: '#0369A1',
    label: 'New Inquiries',
  },
  contacted: {
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1D4ED8',
    label: 'Contacted',
  },
  interested: {
    color: '#14B8A6',
    bg: '#F0FDFA',
    border: '#99F6E4',
    text: '#0F766E',
    label: 'Interested',
  },
  follow_up: {
    color: '#8B5CF6',
    bg: '#FAF5FF',
    border: '#DDD6FE',
    text: '#6D28D9',
    label: 'Follow-up Queue',
  },
  pending: {
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#B45309',
    label: 'Pending Decision',
  },
  confirmed: {
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#047857',
    label: 'Confirmed Won',
  },
  not_interested: {
    color: '#F43F5E',
    bg: '#FFF1F2',
    border: '#FECDD3',
    text: '#BE123C',
    label: 'Closed Lost',
  },
};

export function LeadPipelineChart({ stages, totalLeads }: LeadPipelineChartProps) {
  return (
    <div
      className="rounded-2xl bg-white border border-border shadow-xs"
      style={{ padding: '24px 28px' }}
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        style={{ marginBottom: '20px' }}
      >
        <div>
          <h2 className="text-[17px] font-bold text-text-primary">
            Sales Pipeline Stage Distribution
          </h2>
          <p className="text-[13px] text-text-muted" style={{ marginTop: '4px' }}>
            Color-coded stage breakdown across{' '}
            <strong className="text-text-primary font-semibold">
              {formatNumber(totalLeads)}
            </strong>{' '}
            active leads
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="text-[13px] font-semibold text-primary-600 hover:text-primary-700 hover:underline"
        >
          Explore full pipeline →
        </Link>
      </div>

      {/* Multi-segmented horizontal progress bar */}
      <div
        className="w-full rounded-full bg-surface-muted overflow-hidden flex border border-border-light"
        style={{ height: '14px', gap: '3px', padding: '2px', marginBottom: '22px' }}
      >
        {stages.map((stage) => {
          if (stage.count <= 0) return null;
          const palette = STAGE_PALETTE[stage.status];
          const barColor = palette?.color || stage.color;
          const widthPct = Math.max(3, (stage.count / (totalLeads || 1)) * 100);
          return (
            <div
              key={stage.status}
              style={{
                width: `${widthPct}%`,
                backgroundColor: barColor,
              }}
              className="h-full rounded-full transition-all duration-300 hover:opacity-90"
              title={`${palette?.label || stage.label}: ${stage.count} (${stage.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Color-Coded Stage Grid Cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        style={{ gap: '14px' }}
      >
        {stages.map((stage) => {
          const palette = STAGE_PALETTE[stage.status] || {
            color: stage.color,
            bg: '#F8FAFB',
            border: '#E7EAEE',
            text: '#20252D',
            label: stage.label,
          };

          return (
            <Link
              key={stage.status}
              href={`/admin/leads?status=${stage.status}`}
              className="flex flex-col rounded-xl transition-all group hover:shadow-sm"
              style={{
                padding: '16px',
                backgroundColor: palette.bg,
                border: `1px solid ${palette.border}`,
                borderLeft: `4px solid ${palette.color}`,
                gap: '10px',
              }}
            >
              <div className="flex items-center" style={{ gap: '8px' }}>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: palette.color }}
                />
                <span
                  className="text-[12.5px] font-bold truncate"
                  style={{ color: palette.text }}
                >
                  {palette.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-[22px] font-bold text-text-primary tabular-nums leading-none">
                  {formatNumber(stage.count)}
                </span>
                <span
                  className="text-[11.5px] font-bold rounded-full tabular-nums"
                  style={{
                    padding: '2px 7px',
                    backgroundColor: '#FFFFFF',
                    color: palette.text,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  {stage.percentage}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

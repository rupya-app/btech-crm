'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Calendar,
  Phone,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { PageCard } from '@/components/common';
import { formatNumber, formatPercentage } from '@/lib/utils';

export interface PerformanceTimePoint {
  label: string;
  calls: number;
  followups: number;
  confirmed: number;
  contacted: number;
}

export interface StageCountItem {
  stage: string;
  label: string;
  count: number;
  color: string;
}

export interface OutcomeItem {
  outcome: string;
  label: string;
  count: number;
  color: string;
}

interface PerformanceChartsProps {
  dailyData: PerformanceTimePoint[];
  weeklyData: PerformanceTimePoint[];
  monthlyData: PerformanceTimePoint[];
  stageDistribution: StageCountItem[];
  outcomeBreakdown: OutcomeItem[];
  kpis: {
    totalCalls: number;
    callsToday: number;
    dailyCallTarget: number;
    confirmedDeals: number;
    totalAssigned: number;
    conversionRate: number;
    contactRate: number;
    followupsDue: number;
  };
}

export function PerformanceCharts({
  dailyData,
  weeklyData,
  monthlyData,
  stageDistribution,
  outcomeBreakdown,
  kpis,
}: PerformanceChartsProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const activeSeries =
    period === 'daily' ? dailyData : period === 'weekly' ? weeklyData : monthlyData;

  const targetCompletion = Math.min(
    100,
    Math.round((kpis.callsToday / (kpis.dailyCallTarget || 20)) * 100)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header with Period Selector Tabs */}
      <div
        className="rounded-2xl bg-white border border-[#E7EAEE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between"
        style={{ padding: '16px 20px', gap: '14px' }}
      >
        <div>
          <h2 className="text-[17px] font-bold text-text-primary flex items-center" style={{ gap: '8px' }}>
            <BarChart3 className="w-5 h-5 text-[#147D72]" />
            <span>Telecalling & Pipeline Performance</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Switch between Daily, Weekly, and Monthly views to inspect activity output and conversion trends.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div
          className="inline-flex rounded-xl bg-[#F4F6F9] p-1 border border-[#E7EAEE]"
          style={{ gap: '4px' }}
        >
          {[
            { id: 'daily', label: 'Daily (7 Days)' },
            { id: 'weekly', label: 'Weekly (4 Weeks)' },
            { id: 'monthly', label: 'Monthly (6 Months)' },
          ].map((tab) => {
            const isActive = period === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPeriod(tab.id as any)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#0E5F58' : '#68717D',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
        <PageCard style={{ borderLeft: '4px solid #147D72' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Today's Call Target (20)</span>
            <Phone className="w-4 h-4 text-[#147D72]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-text-primary tabular-nums">
            {kpis.callsToday}{' '}
            <span className="text-sm font-normal text-text-muted">/ {kpis.dailyCallTarget}</span>
          </div>
          <div className="mt-2 w-full bg-[#E7EAEE] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#147D72] h-full rounded-full transition-all duration-300"
              style={{ width: `${targetCompletion}%` }}
            />
          </div>
          <span className="text-[11.5px] text-text-muted mt-1.5 block">
            {targetCompletion}% of daily target achieved
          </span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #10B981' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Confirmed Won Deals</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="mt-2 text-3xl font-bold text-success tabular-nums">
            {kpis.confirmedDeals}
          </div>
          <span className="text-xs text-text-muted mt-1.5 block">
            {formatPercentage(kpis.conversionRate)} overall win rate
          </span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #3B82F6' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Pipeline Contact Rate</span>
            <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#1D4ED8] tabular-nums">
            {formatPercentage(kpis.contactRate)}
          </div>
          <span className="text-xs text-text-muted mt-1.5 block">
            Leads engaged out of {kpis.totalAssigned} assigned
          </span>
        </PageCard>

        <PageCard style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Follow-ups Scheduled</span>
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#6D28D9] tabular-nums">
            {kpis.followupsDue}
          </div>
          <span className="text-xs text-text-muted mt-1.5 block">Pending callback sessions</span>
        </PageCard>
      </div>

      {/* 3. Main Chart: Calling & Activity Trend */}
      <div
        className="rounded-2xl bg-white border border-[#E7EAEE] shadow-xs"
        style={{ padding: '24px 28px' }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
          <div>
            <h3 className="text-[16px] font-bold text-text-primary">
              Outbound Telecalling & Activity Volume ({period.toUpperCase()})
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Comparison of outbound phone calls vs completed client follow-ups across the selected timeframe.
            </p>
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#68717D"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E7EAEE' }}
              />
              <YAxis
                stroke="#68717D"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E7EAEE',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              {period === 'daily' && (
                <ReferenceLine
                  y={20}
                  stroke="#147D72"
                  strokeDasharray="4 4"
                  label={{ value: 'Target (20 calls/day)', position: 'insideTopRight', fill: '#147D72', fontSize: 11 }}
                />
              )}
              <Bar dataKey="calls" name="Calls Made" fill="#147D72" radius={[6, 6, 0, 0]} maxBarSize={45} />
              <Bar dataKey="followups" name="Follow-ups Done" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={45} />
              <Bar dataKey="confirmed" name="Deals Won" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Two Column Grid: Pipeline Stages & Call Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '20px' }}>
        {/* Stage Distribution */}
        <div
          className="rounded-2xl bg-white border border-[#E7EAEE] shadow-xs flex flex-col justify-between"
          style={{ padding: '24px 26px', gap: '18px' }}
        >
          <div>
            <h3 className="text-[16px] font-bold text-text-primary">
              My Assigned Pipeline Stage Breakdown
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Live status distribution of leads currently in your personal sales queue.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stageDistribution.map((s) => {
              const total = kpis.totalAssigned || 1;
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s.stage} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
                    <span className="flex items-center" style={{ gap: '6px' }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span>{s.label}</span>
                    </span>
                    <span className="tabular-nums">
                      {s.count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F4F6F9] rounded-full h-2 overflow-hidden border border-[#E7EAEE]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(4, pct)}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call Outcomes Distribution */}
        <div
          className="rounded-2xl bg-white border border-[#E7EAEE] shadow-xs flex flex-col justify-between"
          style={{ padding: '24px 26px', gap: '18px' }}
        >
          <div>
            <h3 className="text-[16px] font-bold text-text-primary">
              Call Outcomes & Responses
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Categorized client response outcomes recorded across all your logged phone calls.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {outcomeBreakdown.map((o) => {
              const total = kpis.totalCalls || 1;
              const pct = Math.round((o.count / total) * 100);
              return (
                <div key={o.outcome} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
                    <span className="flex items-center" style={{ gap: '6px' }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: o.color }} />
                      <span>{o.label}</span>
                    </span>
                    <span className="tabular-nums">
                      {o.count} calls ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F4F6F9] rounded-full h-2 overflow-hidden border border-[#E7EAEE]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(4, pct)}%`, backgroundColor: o.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

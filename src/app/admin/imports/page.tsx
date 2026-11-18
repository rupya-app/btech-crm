import React from 'react';
import Link from 'next/link';
import { History, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { ImportWizard } from '@/components/imports/import-wizard';
import { Button } from '@/components/ui/button';

export default function AdminImportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Import Excel & CSV Leads
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Bulk ingest customer datasets, map CRM attributes, detect duplicates, and convert into active leads.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="text-xs h-9 border-border bg-surface hover:bg-surface-muted"
        >
          <Link href="/admin/import-history" className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-text-muted" />
            <span>View Import Log History</span>
          </Link>
        </Button>
      </div>

      <ImportWizard />
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { ImportWizard } from '@/components/imports/import-wizard';
import { Button } from '@/components/ui/button';
import { AdminPageContainer, PageHeader } from '@/components/common';

export default function AdminImportsPage() {
  return (
    <AdminPageContainer>
      <PageHeader
        title="Import Excel & CSV Leads"
        description="Bulk ingest customer datasets, map CRM attributes, detect duplicates, and convert into active leads."
        actions={
          <Button
            asChild
            variant="outline"
            className="text-[13px] h-10 px-4.5 rounded-xl border-border bg-surface hover:bg-surface-muted font-medium shadow-xs"
          >
            <Link href="/admin/import-history" className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-text-muted" />
              <span>View Import Log History</span>
            </Link>
          </Button>
        }
      />

      <ImportWizard />
    </AdminPageContainer>
  );
}

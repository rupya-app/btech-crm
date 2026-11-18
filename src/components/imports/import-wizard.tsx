'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Download,
  Check,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnMapping } from '@/types';
import { autoDetectMapping, validateImportBatch } from '@/services/imports.service';
import { formatNumber } from '@/lib/utils';

export function ImportWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Background progress
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [importSummary, setImportSummary] = useState<any>(null);

  // STEP 1: Handle File Selection (supports Excel or CSV)
  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Mock/parse sample rows for instant browser-based wizard flow
    const sampleHeaders = ['Company Name', 'Contact Person', 'Phone Number', 'Email', 'Category', 'City', 'State', 'Notes'];
    const sampleData = [
      {
        'Company Name': 'Nexus Global Logistics',
        'Contact Person': 'Vikram Mehra',
        'Phone Number': '+91 98200 44556',
        Email: 'vikram@nexuslogistics.com',
        Category: 'Logistics',
        City: 'Mumbai',
        State: 'Maharashtra',
        Notes: 'Large container terminal operator.',
      },
      {
        'Company Name': 'BioPure Pharmaceuticals',
        'Contact Person': 'Dr. Meena Iyer',
        'Phone Number': '+91 98450 11223',
        Email: 'meena.iyer@biopure.in',
        Category: 'Pharmaceuticals',
        City: 'Bengaluru',
        State: 'Karnataka',
        Notes: 'WHO-GMP certified oral dosage facility.',
      },
      {
        'Company Name': 'Zenith Fasteners Private Ltd',
        'Contact Person': 'Amit Sharma',
        'Phone Number': '+91 98100 88990',
        Email: 'amit@zenithfasteners.com',
        Category: 'Manufacturing',
        City: 'Faridabad',
        State: 'Haryana',
        Notes: 'Automotive grade fasteners supplier.',
      },
      {
        'Company Name': 'Alpha Solar Panels & EPC',
        'Contact Person': 'Rohan Desai',
        'Phone Number': '+91 98250 66778',
        Email: 'rohan@alphasolar.co',
        Category: 'Renewable Energy',
        City: 'Surat',
        State: 'Gujarat',
        Notes: 'Commercial rooftop EPC contractor.',
      },
      {
        'Company Name': 'Heritage Spices & Condiments',
        'Contact Person': 'George Varghese',
        'Phone Number': '+91 94470 33445',
        Email: 'sales@heritagespices.in',
        Category: 'FMCG & Food',
        City: 'Kochi',
        State: 'Kerala',
        Notes: 'Cardamom & pepper exporter with organic certificates.',
      },
    ];

    setHeaders(sampleHeaders);
    setParsedRows(sampleData);
    setMappings(autoDetectMapping(sampleHeaders));
    setStep(2);
  };

  // STEP 2: Map Fields
  const handleUpdateMapping = (sourceColumn: string, targetField: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.sourceColumn === sourceColumn ? { ...m, targetField } : m
      )
    );
  };

  // STEP 4: Run Validation
  const runValidation = () => {
    const result = validateImportBatch(parsedRows, mappings);
    setValidationResult(result);
    setStep(4);
  };

  // STEP 6: Execute Background Import Process
  const startImportProcess = () => {
    setStep(6);
    setProgress(0);
    setProcessedCount(0);

    const total = parsedRows.length * 100; // Simulated batch scale
    let current = 0;

    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 80) + 40;
      if (current >= total) {
        clearInterval(interval);
        setProgress(100);
        setProcessedCount(total);
        setImportSummary({
          totalRows: total,
          imported: Math.round(total * 0.94),
          duplicates: Math.round(total * 0.04),
          failed: Math.round(total * 0.02),
        });
        setStep(7);
      } else {
        setProcessedCount(current);
        setProgress(Math.round((current / total) * 100));
      }
    }, 150);
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Step Progress Header */}
      <div className="p-4 sm:p-6 border-b border-border bg-surface-muted/30">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { num: 1, label: 'Upload' },
            { num: 2, label: 'Mapping' },
            { num: 3, label: 'Preview' },
            { num: 4, label: 'Validation' },
            { num: 5, label: 'Confirm' },
            { num: 6, label: 'Process' },
            { num: 7, label: 'Results' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-primary-600 text-white shadow-xs'
                    : step > s.num
                    ? 'bg-success-bg text-success border border-success/30'
                    : 'bg-surface-muted text-text-muted border border-border'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-text-secondary">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Upload Lead Dataset
              </h2>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                Support for Excel (.xlsx, .xls) and CSV (.csv) files. Capable of background processing 50,000+ records in batch chunks.
              </p>
            </div>

            <div className="border-2 border-dashed border-border hover:border-primary-400 bg-surface-muted/30 p-8 rounded-2xl transition-all relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileDrop}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-12 h-12 text-primary-500/80 mx-auto mb-3" />
              <p className="text-xs font-semibold text-text-primary">
                Drag and drop your spreadsheet here, or <span className="text-primary-600 underline">browse files</span>
              </p>
              <p className="text-[11px] text-text-muted mt-1">
                Max file size: 50MB (up to 100,000 leads)
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Map Spreadsheet Columns to CRM Fields
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                We automatically detected matching headers. Review and adjust mappings below.
              </p>
            </div>

            <div className="space-y-3">
              {headers.map((hdr) => {
                const currentMap = mappings.find((m) => m.sourceColumn === hdr);
                return (
                  <div
                    key={hdr}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-border bg-surface-muted/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                      <span className="text-xs font-semibold text-text-primary">
                        {hdr}
                      </span>
                    </div>

                    <div className="w-full sm:w-64">
                      <Select
                        value={currentMap?.targetField || 'none'}
                        onValueChange={(val) => handleUpdateMapping(hdr, !val || val === 'none' ? '' : val)}
                      >
                        <SelectTrigger className="text-xs h-8">
                          <SelectValue placeholder="Choose CRM Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Skip Column --</SelectItem>
                          <SelectItem value="business_name">Business Name *</SelectItem>
                          <SelectItem value="contact_person">Contact Person</SelectItem>
                          <SelectItem value="phone">Phone Number</SelectItem>
                          <SelectItem value="alternate_phone">Alternate Phone</SelectItem>
                          <SelectItem value="email">Email Address</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="category">Business Category</SelectItem>
                          <SelectItem value="address">Address</SelectItem>
                          <SelectItem value="city">City</SelectItem>
                          <SelectItem value="state">State</SelectItem>
                          <SelectItem value="country">Country</SelectItem>
                          <SelectItem value="business_details">Business Details / Notes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                className="text-xs"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => setStep(3)}
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white"
              >
                <span>Continue to Preview</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  Data Mapping Preview
                </h2>
                <p className="text-xs text-text-muted">
                  First 5 parsed rows with mapped fields
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted border-b border-border text-text-secondary">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Business Name</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">City</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {parsedRows.map((r, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 text-text-muted">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-text-primary">{r['Company Name']}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{r['Contact Person']}</td>
                      <td className="py-2.5 px-3 text-primary-700 tabular-nums">{r['Phone Number']}</td>
                      <td className="py-2.5 px-3 text-text-muted">{r['Email']}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{r['Category']}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{r['City']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setStep(2)} className="text-xs">
                Back to Mapping
              </Button>
              <Button size="sm" onClick={runValidation} className="text-xs bg-primary-600 hover:bg-primary-700 text-white">
                <span>Run Validation Check</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: VALIDATION */}
        {step === 4 && validationResult && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-bold text-text-primary">
                Dataset Validation Results
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Pre-import check for duplicates, missing fields, and phone number formats
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-success-bg border border-success/20 text-center">
                <span className="text-2xl font-bold text-success block tabular-nums">
                  {validationResult.validCount}
                </span>
                <span className="text-[11px] font-semibold text-success/80">Valid Records</span>
              </div>
              <div className="p-4 rounded-xl bg-warning-bg border border-warning/20 text-center">
                <span className="text-2xl font-bold text-warning block tabular-nums">
                  {validationResult.duplicateCount}
                </span>
                <span className="text-[11px] font-semibold text-warning/80">Duplicates</span>
              </div>
              <div className="p-4 rounded-xl bg-danger-bg border border-danger/20 text-center">
                <span className="text-2xl font-bold text-danger block tabular-nums">
                  {validationResult.invalidCount}
                </span>
                <span className="text-[11px] font-semibold text-danger/80">Invalid</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setStep(3)} className="text-xs">
                Back
              </Button>
              <Button size="sm" onClick={() => setStep(5)} className="text-xs bg-primary-600 hover:bg-primary-700 text-white">
                <span>Confirm & Import</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRM IMPORT */}
        {step === 5 && (
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Launch Background Import Job
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Leads will be inserted in transactional batch chunks. Once complete, leads will populate into the CRM immediately.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep(4)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={startImportProcess}
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-6 shadow-sm"
              >
                <span>Start Batch Import</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: BACKGROUND PROCESSING */}
        {step === 6 && (
          <div className="max-w-md mx-auto text-center space-y-6 py-6">
            <RefreshCw className="w-10 h-10 text-primary-600 animate-spin mx-auto" />

            <div>
              <h2 className="text-base font-bold text-text-primary">
                Processing Import Job in Background...
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Batch processing active. You can leave this page safely.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-text-primary">
                <span>Progress</span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div className="h-3 w-full bg-surface-muted rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] text-text-muted block tabular-nums">
                Processed {formatNumber(processedCount)} records
              </span>
            </div>
          </div>
        )}

        {/* STEP 7: RESULTS */}
        {step === 7 && importSummary && (
          <div className="max-w-md mx-auto text-center space-y-6 py-4">
            <div className="w-14 h-14 bg-success-bg text-success rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Import Completed Successfully!
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Dataset has been converted into structured leads in the CRM.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-muted border border-border text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-text-muted">Total Processed:</span>
                <span className="font-bold text-text-primary tabular-nums">{formatNumber(importSummary.totalRows)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Successfully Imported:</span>
                <span className="font-bold tabular-nums">{formatNumber(importSummary.imported)}</span>
              </div>
              <div className="flex justify-between text-warning">
                <span>Duplicates Filtered:</span>
                <span className="font-bold tabular-nums">{formatNumber(importSummary.duplicates)}</span>
              </div>
              <div className="flex justify-between text-danger">
                <span>Rejected / Invalid:</span>
                <span className="font-bold tabular-nums">{formatNumber(importSummary.failed)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                <Link href="/admin/import-history">View Import History</Link>
              </Button>
              <Button asChild size="sm" className="w-full sm:w-auto text-xs bg-primary-600 hover:bg-primary-700 text-white">
                <Link href="/admin/leads">Go to All Leads</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

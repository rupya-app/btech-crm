'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ExcelJS from 'exceljs';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Download,
  Check,
  AlertCircle,
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

// RFC-4180 compliant CSV parser for browser file uploads
function parseCsvText(text: string): { headers: string[]; rows: Record<string, any>[] } {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentVal += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentVal += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        currentRow.push(currentVal.trim());
        if (currentRow.some((cell) => cell !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += ch;
      }
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((cell) => cell !== '')) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].map((h, i) => h || `Column_${i + 1}`);
  const rows = lines.slice(1).map((line) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      obj[h] = line[idx] ?? '';
    });
    return obj;
  });

  return { headers, rows };
}

export function ImportWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Background progress
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [importSummary, setImportSummary] = useState<any>(null);

  const downloadSampleTemplate = () => {
    const csv = [
      'Company Name,Contact Person,Phone Number,Email,Category,City,State,Notes',
      '"Nexus Global Logistics","Vikram Mehra","+91 98200 44556","vikram@nexuslogistics.com","Logistics & Supply Chain","Mumbai","Maharashtra","Fleet of 60 containers"',
      '"BioPure Pharmaceuticals","Dr. Meena Iyer","+91 98450 11223","meena.iyer@biopure.in","Healthcare & Pharma","Bengaluru","Karnataka","WHO-GMP certified plant"',
      '"Alpha Solar Panels & EPC","Rohan Desai","+91 98250 66778","rohan@alphasolar.co","Renewable Energy","Surat","Gujarat","Commercial rooftop EPC"',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CRM_Lead_Import_Template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // STEP 1: Parse Real Uploaded Excel (.xlsx) or CSV (.csv) File
  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg(null);

    try {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      let extractedHeaders: string[] = [];
      let extractedRows: Record<string, any>[] = [];

      if (ext === 'csv') {
        const text = await selectedFile.text();
        const parsed = parseCsvText(text);
        extractedHeaders = parsed.headers;
        extractedRows = parsed.rows;
      } else {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
          throw new Error('No worksheet found in the uploaded Excel file.');
        }

        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
          const val = cell.text ? cell.text.trim() : String(cell.value || `Column_${colNumber}`).trim();
          extractedHeaders[colNumber - 1] = val;
        });

        extractedHeaders = extractedHeaders.filter(Boolean);

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const rowObj: Record<string, any> = {};
          let hasData = false;
          extractedHeaders.forEach((hdr, idx) => {
            const cell = row.getCell(idx + 1);
            const cellText = cell.text ? cell.text.trim() : String(cell.value ?? '').trim();
            if (cellText) hasData = true;
            rowObj[hdr] = cellText;
          });
          if (hasData) {
            extractedRows.push(rowObj);
          }
        });
      }

      if (extractedHeaders.length === 0 || extractedRows.length === 0) {
        throw new Error('The uploaded file contains no readable headers or data rows.');
      }

      // Build initial mappings for ALL headers
      const autoMapped = autoDetectMapping(extractedHeaders);
      const fullMappings: ColumnMapping[] = extractedHeaders.map((hdr) => {
        const found = autoMapped.find((m) => m.sourceColumn === hdr);
        return (
          found || {
            sourceColumn: hdr,
            targetField: '',
            isRequired: false,
          }
        );
      });

      setHeaders(extractedHeaders);
      setParsedRows(extractedRows);
      setMappings(fullMappings);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse spreadsheet. Please upload a valid .xlsx or .csv file.');
    }
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

  // STEP 6: Execute Real Database Import Process via POST /api/imports
  const startImportProcess = async () => {
    setStep(6);
    setProgress(25);
    setProcessedCount(0);
    setErrorMsg(null);

    try {
      const normalizedRows = parsedRows.map((rawRow) => {
        const mapped: Record<string, any> = {};
        for (const m of mappings) {
          if (m.targetField && rawRow[m.sourceColumn] !== undefined) {
            mapped[m.targetField] = String(rawRow[m.sourceColumn]).trim();
          }
        }
        return mapped;
      });

      setProgress(65);
      setProcessedCount(Math.floor(normalizedRows.length / 2));

      const res = await fetch('/api/imports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file?.name || 'Uploaded_Dataset.csv',
          rows: normalizedRows,
          mappings,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Database import failed.');
      }

      setProgress(100);
      setProcessedCount(normalizedRows.length);
      setImportSummary(data.summary);
      setStep(7);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to import records.');
      setStep(5);
    }
  };

  const getMappedValue = (row: Record<string, any>, field: string) => {
    const mapItem = mappings.find((m) => m.targetField === field);
    return mapItem ? row[mapItem.sourceColumn] || '—' : '—';
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Step Progress Header */}
      <div
        className="border-b border-border bg-[#F8FAFB]"
        style={{ padding: '20px 28px' }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto" style={{ gap: '12px' }}>
          {[
            { num: 1, label: 'Upload' },
            { num: 2, label: 'Mapping' },
            { num: 3, label: 'Preview' },
            { num: 4, label: 'Validation' },
            { num: 5, label: 'Confirm' },
            { num: 6, label: 'Process' },
            { num: 7, label: 'Results' },
          ].map((s) => (
            <div key={s.num} className="flex items-center shrink-0" style={{ gap: '10px' }}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-primary-600 text-white shadow-xs ring-4 ring-primary-100'
                    : step > s.num
                    ? 'bg-success-bg text-success border border-success/30'
                    : 'bg-white text-text-muted border border-border'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="hidden sm:inline text-[13px] font-semibold text-text-secondary">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {errorMsg && (
          <div
            className="flex items-center gap-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-[13px] font-semibold max-w-2xl mx-auto"
            style={{ padding: '14px 18px', marginBottom: '20px' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div className="max-w-xl mx-auto text-center" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-primary-100">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-[22px] font-bold text-text-primary">
                Upload Lead Dataset
              </h2>
              <p className="text-[13.5px] text-text-muted mt-1.5 max-w-md mx-auto leading-relaxed">
                Upload any Excel (`.xlsx`) or CSV (`.csv`) spreadsheet. All rows are parsed, deduplicated against your database, and inserted directly into Supabase.
              </p>
            </div>

            <div
              className="border-2 border-dashed border-border hover:border-primary-400 bg-[#F8FAFB] rounded-2xl transition-all relative"
              style={{ padding: '40px 28px' }}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileDrop}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-11 h-11 text-primary-600 mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-text-primary">
                Drag and drop your spreadsheet here, or <span className="text-primary-600 underline">browse files</span>
              </p>
              <p className="text-[12px] text-text-muted mt-1.5">
                Supports `.xlsx` and `.csv` • Automatic phone normalization & duplicate detection
              </p>
            </div>

            <div className="flex items-center justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={downloadSampleTemplate}
                className="text-[13px]"
              >
                <Download className="w-4 h-4" />
                <span>Download Sample CSV Template</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 className="text-[18px] font-bold text-text-primary">
                Map Spreadsheet Columns to CRM Fields
              </h2>
              <p className="text-[13px] text-text-muted mt-1">
                File: <strong className="text-text-primary">{file?.name}</strong> ({formatNumber(parsedRows.length)} rows detected). Review column mappings below.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: '12px' }}>
              {headers.map((hdr) => {
                const currentMap = mappings.find((m) => m.sourceColumn === hdr);
                return (
                  <div
                    key={hdr}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-[#F8FAFB]"
                    style={{ padding: '14px 18px', gap: '12px' }}
                  >
                    <div className="flex items-center" style={{ gap: '10px' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
                      <span className="text-[13.5px] font-semibold text-text-primary">
                        {hdr}
                      </span>
                    </div>

                    <div className="w-full sm:w-64">
                      <Select
                        value={currentMap?.targetField || 'none'}
                        onValueChange={(val) =>
                          handleUpdateMapping(hdr, !val || val === 'none' ? '' : val)
                        }
                      >
                        <SelectTrigger size="sm">
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

            <div
              className="flex items-center justify-between border-t border-border"
              style={{ paddingTop: '20px' }}
            >
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                <span>Continue to Preview</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 className="text-[18px] font-bold text-text-primary">
                Data Mapping Preview ({formatNumber(parsedRows.length)} Total Rows)
              </h2>
              <p className="text-[13px] text-text-muted mt-1">
                Previewing first {Math.min(10, parsedRows.length)} rows from your uploaded file
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#F8FAFB] border-b border-border text-text-secondary font-semibold">
                  <tr style={{ height: '44px' }}>
                    <th style={{ padding: '10px 14px' }}>#</th>
                    <th style={{ padding: '10px 14px' }}>Business Name</th>
                    <th style={{ padding: '10px 14px' }}>Contact</th>
                    <th style={{ padding: '10px 14px' }}>Phone</th>
                    <th style={{ padding: '10px 14px' }}>Email</th>
                    <th style={{ padding: '10px 14px' }}>Category</th>
                    <th style={{ padding: '10px 14px' }}>City</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {parsedRows.slice(0, 10).map((r, idx) => (
                    <tr key={idx} style={{ height: '52px' }}>
                      <td className="text-text-muted tabular-nums" style={{ padding: '10px 14px' }}>
                        {idx + 1}
                      </td>
                      <td className="font-semibold text-text-primary" style={{ padding: '10px 14px' }}>
                        {getMappedValue(r, 'business_name')}
                      </td>
                      <td className="text-text-secondary" style={{ padding: '10px 14px' }}>
                        {getMappedValue(r, 'contact_person')}
                      </td>
                      <td className="text-primary-700 tabular-nums font-medium" style={{ padding: '10px 14px' }}>
                        {getMappedValue(r, 'phone')}
                      </td>
                      <td className="text-text-muted" style={{ padding: '10px 14px' }}>
                        {getMappedValue(r, 'email')}
                      </td>
                      <td className="text-text-secondary" style={{ padding: '10px 14px' }}>
                        {getMappedValue(r, 'category')}
                      </td>
                      <td className="text-text-secondary" style={{ padding: '10px 14px' }}>
                        {getMappedValue(r, 'city')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="flex items-center justify-between border-t border-border"
              style={{ paddingTop: '20px' }}
            >
              <Button variant="outline" onClick={() => setStep(2)}>
                Back to Mapping
              </Button>
              <Button onClick={runValidation}>
                <span>Run Validation Check</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: VALIDATION */}
        {step === 4 && validationResult && (
          <div className="max-w-xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="text-center">
              <h2 className="text-[18px] font-bold text-text-primary">
                Dataset Validation Results
              </h2>
              <p className="text-[13px] text-text-muted mt-1">
                Pre-import check for duplicates, missing fields, and phone number formats
              </p>
            </div>

            <div className="grid grid-cols-3" style={{ gap: '16px' }}>
              <div className="rounded-xl bg-success-bg border border-success/25 text-center" style={{ padding: '20px' }}>
                <span className="text-2xl font-bold text-success block tabular-nums">
                  {validationResult.validCount}
                </span>
                <span className="text-xs font-semibold text-success/90 mt-1 block">Valid Records</span>
              </div>
              <div className="rounded-xl bg-warning-bg border border-warning/25 text-center" style={{ padding: '20px' }}>
                <span className="text-2xl font-bold text-warning block tabular-nums">
                  {validationResult.duplicateCount}
                </span>
                <span className="text-xs font-semibold text-warning/90 mt-1 block">In-File Duplicates</span>
              </div>
              <div className="rounded-xl bg-danger-bg border border-danger/25 text-center" style={{ padding: '20px' }}>
                <span className="text-2xl font-bold text-danger block tabular-nums">
                  {validationResult.invalidCount}
                </span>
                <span className="text-xs font-semibold text-danger/90 mt-1 block">Invalid Rows</span>
              </div>
            </div>

            <div
              className="flex items-center justify-between border-t border-border"
              style={{ paddingTop: '20px' }}
            >
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(5)}
                disabled={validationResult.validCount === 0}
              >
                <span>Confirm & Import ({validationResult.validCount} Leads)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRM IMPORT */}
        {step === 5 && (
          <div className="max-w-md mx-auto text-center" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-[19px] font-bold text-text-primary">
                Ready to Import into Database
              </h2>
              <p className="text-[13.5px] text-text-muted mt-1.5 leading-relaxed">
                {validationResult?.validCount || parsedRows.length} validated leads from{' '}
                <strong>{file?.name}</strong> will be inserted into your live Supabase database.
              </p>
            </div>

            <div className="flex items-center justify-center" style={{ gap: '12px' }}>
              <Button variant="outline" onClick={() => setStep(4)}>
                Cancel
              </Button>
              <Button onClick={startImportProcess}>
                <span>Execute Database Import</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: PROCESSING */}
        {step === 6 && (
          <div className="max-w-md mx-auto text-center py-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <RefreshCw className="w-10 h-10 text-primary-600 animate-spin mx-auto" />

            <div>
              <h2 className="text-[17px] font-bold text-text-primary">
                Inserting Leads into Database...
              </h2>
              <p className="text-[13px] text-text-muted mt-1">
                Deduplicating against existing phones/emails and writing records.
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
              <span className="text-xs text-text-muted block tabular-nums">
                Processed {formatNumber(processedCount)} of {formatNumber(parsedRows.length)} records
              </span>
            </div>
          </div>
        )}

        {/* STEP 7: RESULTS */}
        {step === 7 && importSummary && (
          <div className="max-w-md mx-auto text-center py-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="w-14 h-14 bg-success-bg text-success rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-text-primary">
                Import Completed Successfully!
              </h2>
              <p className="text-[13px] text-text-muted mt-1">
                Your spreadsheet records are now live in the CRM pipeline.
              </p>
            </div>

            <div
              className="rounded-xl bg-[#F8FAFB] border border-border text-[13px] space-y-2.5 text-left"
              style={{ padding: '18px 20px' }}
            >
              <div className="flex justify-between">
                <span className="text-text-muted">Total Rows in File:</span>
                <span className="font-bold text-text-primary tabular-nums">
                  {formatNumber(importSummary.totalRows)}
                </span>
              </div>
              <div className="flex justify-between text-success">
                <span>Successfully Imported:</span>
                <span className="font-bold tabular-nums">
                  {formatNumber(importSummary.imported)}
                </span>
              </div>
              <div className="flex justify-between text-warning">
                <span>Duplicates Skipped:</span>
                <span className="font-bold tabular-nums">
                  {formatNumber(importSummary.duplicates)}
                </span>
              </div>
              <div className="flex justify-between text-danger">
                <span>Rejected / Invalid:</span>
                <span className="font-bold tabular-nums">
                  {formatNumber(importSummary.failed)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center" style={{ gap: '12px' }}>
              <Button asChild variant="outline">
                <Link href="/admin/import-history">View Import History</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/leads">Go to Pipeline Leads</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

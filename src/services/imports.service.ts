import { ColumnMapping, ImportPreview } from '@/types';
import { normalizePhone, isValidEmail, isValidPhone } from '@/lib/utils';

export interface ParseResult {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

// Auto-detect matching field based on common column header synonyms
export function autoDetectMapping(headers: string[]): ColumnMapping[] {
  const mappingRules: Record<string, string[]> = {
    business_name: ['business name', 'company', 'company name', 'business', 'org', 'organization', 'firm', 'shop name'],
    contact_person: ['contact person', 'contact name', 'person', 'owner', 'proprietor', 'manager', 'full name', 'name'],
    phone: ['phone', 'phone number', 'mobile', 'mobile number', 'contact number', 'cell', 'telephone'],
    alternate_phone: ['alternate phone', 'alt phone', 'secondary phone', 'landline', 'office phone'],
    email: ['email', 'email address', 'mail', 'e-mail'],
    website: ['website', 'web', 'url', 'domain', 'site'],
    category: ['category', 'business category', 'industry', 'sector', 'type', 'business type'],
    address: ['address', 'street', 'location', 'office address', 'premise'],
    city: ['city', 'town', 'district'],
    state: ['state', 'province'],
    country: ['country', 'nation'],
    business_details: ['business details', 'details', 'remarks', 'notes', 'description', 'about'],
  };

  const detected: ColumnMapping[] = [];

  for (const header of headers) {
    const cleanedHeader = header.toLowerCase().trim().replace(/[_-]/g, ' ');
    let matchedField = '';

    for (const [crmField, synonyms] of Object.entries(mappingRules)) {
      if (synonyms.some((syn) => cleanedHeader === syn || cleanedHeader.includes(syn))) {
        matchedField = crmField;
        break;
      }
    }

    if (matchedField) {
      detected.push({
        sourceColumn: header,
        targetField: matchedField,
        isRequired: matchedField === 'business_name',
      });
    }
  }

  return detected;
}

// Validate a batch of records
export function validateImportBatch(
  rows: Record<string, any>[],
  mappings: ColumnMapping[],
  existingPhones: Set<string> = new Set(),
  existingEmails: Set<string> = new Set()
) {
  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;
  const processedRows: Array<{
    rowNumber: number;
    data: Record<string, any>;
    status: 'valid' | 'duplicate' | 'invalid';
    errors: string[];
  }> = [];

  const seenInBatchPhones = new Set<string>();
  const seenInBatchEmails = new Set<string>();

  rows.forEach((rawRow, idx) => {
    const rowNumber = idx + 1;
    const errors: string[] = [];
    let isDuplicate = false;

    // Map fields
    const normalizedRow: Record<string, any> = {};
    for (const m of mappings) {
      if (m.targetField && rawRow[m.sourceColumn] !== undefined) {
        normalizedRow[m.targetField] = String(rawRow[m.sourceColumn]).trim();
      }
    }

    // 1. Check required business name
    if (!normalizedRow.business_name || normalizedRow.business_name.length < 2) {
      errors.push('Missing or invalid business name');
    }

    // 2. Validate phone if present
    if (normalizedRow.phone) {
      const normPhone = normalizePhone(normalizedRow.phone);
      if (!normPhone || !isValidPhone(normPhone)) {
        errors.push(`Invalid phone number format: ${normalizedRow.phone}`);
      } else {
        normalizedRow.normalized_phone = normPhone;

        // Check duplicate
        if (existingPhones.has(normPhone) || seenInBatchPhones.has(normPhone)) {
          isDuplicate = true;
          errors.push(`Duplicate phone number: ${normPhone}`);
        } else {
          seenInBatchPhones.add(normPhone);
        }
      }
    }

    // 3. Validate email if present
    if (normalizedRow.email) {
      if (!isValidEmail(normalizedRow.email)) {
        errors.push(`Invalid email format: ${normalizedRow.email}`);
      } else {
        const cleanEmail = normalizedRow.email.toLowerCase();
        if (existingEmails.has(cleanEmail) || seenInBatchEmails.has(cleanEmail)) {
          isDuplicate = true;
          errors.push(`Duplicate email: ${cleanEmail}`);
        } else {
          seenInBatchEmails.add(cleanEmail);
        }
      }
    }

    let status: 'valid' | 'duplicate' | 'invalid' = 'valid';
    if (errors.length > 0) {
      if (isDuplicate) {
        status = 'duplicate';
        duplicateCount++;
      } else {
        status = 'invalid';
        invalidCount++;
      }
    } else {
      validCount++;
    }

    processedRows.push({
      rowNumber,
      data: normalizedRow,
      status,
      errors,
    });
  });

  return {
    validCount,
    duplicateCount,
    invalidCount,
    processedRows,
  };
}

import { describe, it, expect } from 'vitest';
import {
  normalizePhone,
  isValidEmail,
  isValidPhone,
  generateEmployeeId,
  formatNumber,
  formatPercentage,
} from '../src/lib/utils';
import { autoDetectMapping, validateImportBatch } from '../src/services/imports.service';

describe('Phone Normalization & Validation', () => {
  it('should normalize standard 10-digit Indian numbers to +91 format', () => {
    expect(normalizePhone('9820112345')).toBe('+919820112345');
    expect(normalizePhone('98201 12345')).toBe('+919820112345');
    expect(normalizePhone('+91 98201 12345')).toBe('+919820112345');
  });

  it('should preserve international numbers with leading +', () => {
    expect(normalizePhone('+14155552671')).toBe('+14155552671');
    expect(normalizePhone('+44 20 7946 0958')).toBe('+442079460958');
  });

  it('should validate phone number length', () => {
    expect(isValidPhone('+919820112345')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });
});

describe('Email Validation', () => {
  it('should validate valid emails', () => {
    expect(isValidEmail('admin@digitalcrm.com')).toBe(true);
    expect(isValidEmail('rajesh.verma@apexlogistics.in')).toBe(true);
  });

  it('should reject malformed emails', () => {
    expect(isValidEmail('plainaddress')).toBe(false);
    expect(isValidEmail('missingatsign.com')).toBe(false);
    expect(isValidEmail('@missingusername.com')).toBe(false);
  });
});

describe('Employee ID Generation', () => {
  it('should generate unique formatted employee IDs with prefix', () => {
    const id1 = generateEmployeeId('EMP');
    const id2 = generateEmployeeId('EMP');
    expect(id1).toMatch(/^EMP\d{5}$/);
    expect(id2).toMatch(/^EMP\d{5}$/);
  });
});

describe('Calculation Formulas', () => {
  it('should format conversion rate correctly', () => {
    const confirmed = 18;
    const assigned = 120;
    const rate = (confirmed / assigned) * 100;
    expect(formatPercentage(rate)).toBe('15.0%');
  });

  it('should format numbers with standard Indian commas', () => {
    expect(formatNumber(15400)).toBe('15,400');
    expect(formatNumber(50000)).toBe('50,000');
  });
});

describe('Excel Import Auto-Detection & Validation', () => {
  it('should detect standard business headers', () => {
    const headers = ['Company Name', 'Mobile Number', 'Email', 'City', 'Remarks'];
    const detected = autoDetectMapping(headers);

    expect(detected.some((d) => d.targetField === 'business_name')).toBe(true);
    expect(detected.some((d) => d.targetField === 'phone')).toBe(true);
    expect(detected.some((d) => d.targetField === 'email')).toBe(true);
    expect(detected.some((d) => d.targetField === 'city')).toBe(true);
  });

  it('should validate rows and filter duplicates', () => {
    const rows = [
      { 'Company Name': 'ABC Corp', 'Mobile Number': '9820111111', Email: 'abc@corp.com' },
      { 'Company Name': 'XYZ Ltd', 'Mobile Number': '9820111111', Email: 'xyz@ltd.com' }, // duplicate phone
      { 'Company Name': '', 'Mobile Number': '9820122222', Email: 'missing@name.com' }, // missing business name
    ];

    const mappings = [
      { sourceColumn: 'Company Name', targetField: 'business_name', isRequired: true },
      { sourceColumn: 'Mobile Number', targetField: 'phone', isRequired: false },
      { sourceColumn: 'Email', targetField: 'email', isRequired: false },
    ];

    const result = validateImportBatch(rows, mappings);
    expect(result.validCount).toBe(1);
    expect(result.duplicateCount).toBe(1);
    expect(result.invalidCount).toBe(1);
  });
});

// Core utility — cn from shadcn/ui
export { cn } from "cn";

// Phone normalization — strips non-digits and adds country code
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Indian number: 10 digits → +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }
  
  return cleaned || null;
}

// WhatsApp URL from phone number
export function getWhatsAppUrl(phone: string | null | undefined): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const digits = normalized.replace(/\+/g, '');
  return `https://wa.me/${digits}`;
}

// Tel link from phone number
export function getTelUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  return `tel:${phone.replace(/\s/g, '')}`;
}

// Email validation
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Phone validation
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

// Format date for display (IST)
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Format date + time for display (IST)
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Format relative time
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

// Format number with commas
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-IN');
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Truncate text
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

// Generate initials from name
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Lead status display labels
export const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  follow_up: 'Follow-up',
  pending: 'Pending',
  confirmed: 'Confirmed',
  not_interested: 'Not Interested',
  unqualified: 'Unqualified',
  archived: 'Archived',
};

// Priority labels
export const priorityLabels: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
};

// Call outcome labels
export const callOutcomeLabels: Record<string, string> = {
  no_answer: 'No Answer',
  busy: 'Busy',
  call_back: 'Call Back Requested',
  connected: 'Connected',
  wrong_number: 'Wrong Number',
  switched_off: 'Switched Off',
  not_reachable: 'Not Reachable',
  other: 'Other',
};

// Generate unique employee ID
export function generateEmployeeId(prefix: string = 'EMP'): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${num}`;
}

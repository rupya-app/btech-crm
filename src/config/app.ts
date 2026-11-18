// Application configuration
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Digital Sales CRM',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'Asia/Kolkata',
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    maxPageSize: 100,
  },

  // Import settings
  import: {
    maxFileSizeMB: 50,
    supportedFormats: ['.xlsx', '.xls', '.csv'],
    batchSize: 500,
    maxRowsPerImport: 100000,
  },

  // Assignment settings
  assignment: {
    defaultMaxClaimsPerEmployee: 50,
    enableSelfSelection: true,
  },

  // Lead pool preview — fields visible to employees before claiming
  leadPoolVisibleFields: [
    'business_name',
    'category',
    'city',
    'state',
    'source',
  ],

  // Employee ID prefix
  employeeIdPrefix: 'EMP',
} as const;

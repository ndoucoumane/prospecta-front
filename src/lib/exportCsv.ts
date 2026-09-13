/**
 * Export CSV Helper for Prospecta
 * Generates RFC 4180 compliant CSV files with UTF-8 BOM so Excel
 * renders African accents (é, è, à, etc.) properly without encoding issues.
 */

export function exportToCsv<T extends object>(
  filename: string,
  rows: T[],
  columns: { key: keyof T | string; label: string }[]
): void {
  if (!rows || rows.length === 0) {
    throw new Error('Aucune donnée à exporter.');
  }

  // Header line
  const header = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(';');

  // Data lines
  const dataLines = rows.map((row) =>
    columns
      .map((col) => {
        const val = (row as unknown as Record<string, unknown>)[col.key as string];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') {
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(';')
  );

  // UTF-8 BOM (\uFEFF) ensures Excel reads UTF-8 correctly
  const csvContent = '\uFEFF' + [header, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

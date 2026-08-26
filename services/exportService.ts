import type { CategorizedTransaction, Invoice, Bill, PayrollRun, ReportData } from '../types';
import DOMPurify from 'dompurify';
import { sanitizeHTML } from './securityUtils';

export function exportToCSV(filename: string, data: any[], columns?: string[]) {
  if (!data || data.length === 0) return;

  const headers = columns || Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    if (val === null || val === undefined) return '';

    let strVal = String(val);

    // Mitigate CSV Formula Injection
    if (/^[=+\-@\t\r]/.test(strVal)) {
      strVal = "'" + strVal;
    }

    // Mitigate CSV structure breaking (escape double quotes, wrap if contains delimiter/newline/quote)
    if (strVal.includes(',') || strVal.includes('\n') || strVal.includes('\r') || strVal.includes('"')) {
      return `"${strVal.replace(/"/g, '""')}"`;
    }

    return strVal;
  }).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(`${filename}.csv`, csv, 'text/csv');
}

export function exportToExcel(filename: string, data: any[], columns?: string[]) {
  // Simple HTML table export that Excel can open
  const headers = columns || Object.keys(data[0]);
  const headerRow = `<tr>${headers.map(h => `<th style="font-weight:bold;background:#f0f0f0;padding:8px;border:1px solid #ddd">${sanitizeHTML(String(h))}</th>`).join('')}</tr>`;
  const dataRows = data.map(row =>
    `<tr>${headers.map(h => `<td style="padding:8px;border:1px solid #ddd">${sanitizeHTML(String(row[h] ?? ''))}</td>`).join('')}</tr>`
  ).join('');

  const html = `<html><head><meta charset="utf-8"></head><body><table>${headerRow}${dataRows}</table></body></html>`;
  downloadFile(`${filename}.xls`, html, 'application/vnd.ms-excel');
}

export function exportToJSON(filename: string, data: any[]) {
  downloadFile(`${filename}.json`, JSON.stringify(data, null, 2), 'application/json');
}

export function printElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html><head>
      <title>Print</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #f5f5f5; font-weight: bold; }
        h1 { font-size: 18px; margin-bottom: 8px; }
        h2 { font-size: 14px; color: #666; margin-bottom: 16px; }
        .total { font-weight: bold; border-top: 2px solid #333; }
        @media print { body { padding: 0; } }
      </style>
    </head><body>${DOMPurify.sanitize(element.innerHTML)}</body></html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFirsVatSchedule(invoices: any[], startDate: string, endDate: string) {
  const data = invoices.map(i => ({
    invoiceNumber: i.id?.slice(-6) || '',
    customer: i.customer,
    date: i.issueDate,
    amount: i.amount,
    vat: i.vat,
    total: i.total,
  }));
  exportToCSV(`FIRS-VAT-Schedule-${startDate}-to-${endDate}`, data);
}

export function exportFirsWhtSchedule(invoices: any[], transactions: any[], startDate: string, endDate: string) {
  const data = invoices.map(i => ({
    invoiceNumber: i.id?.slice(-6) || '',
    customer: i.customer,
    date: i.issueDate,
    amount: i.amount,
    whtApplied: i.whtApplied ? 'Yes' : 'No',
  }));
  exportToCSV(`FIRS-WHT-Schedule-${startDate}-to-${endDate}`, data);
}
